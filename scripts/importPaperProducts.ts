import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { PrismaClient, PaperBrand, PaperType, PaperFinish } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the equivalent of __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface RawPaperProduct {
  Size: string;
  'M Wgt': string;
  'Sheets per Ctn/Skid'?: string;
  'CTNS'?: string;
  'REF#': string;
}

interface HeaderLine {
  isHeader: true;
  content: string;
}

type ParsedLine = Partial<RawPaperProduct> | HeaderLine | null;

async function parsePaperProduct(
  line: string[], 
  brand: PaperBrand,
  currentType: PaperType | null,
  currentWeight: number | null,
  currentFinish: PaperFinish | null,
  currentCaliper: number | null,
  isHPIndigo: boolean
): Promise<ParsedLine> {
  // Skip empty lines, header rows, or metadata rows
  if (
    line.length < 4 || 
    !line[0] || 
    line[0].includes('Thomson') || 
    line[0].includes('Size') ||
    line[0].includes('Saturday') ||
    line[0].includes('Price/Cwt') ||
    line[0].includes('Digital') ||  // Skip the paper brand name line
    /^\s*$/.test(line[0])  // Skip empty or whitespace-only lines
  ) {
    return null;
  }

  // If this is a header line indicating paper type/weight/finish
  if (line[0].includes('#')) {
    return { isHeader: true, content: line[0] };
  }

  // Only parse lines that look like dimensions (contain 'x')
  if (!line[0].includes('x')) {
    return null;
  }

  // Parse actual product line
  return {
    Size: line[0],
    'M Wgt': line[1],
    'Sheets per Ctn/Skid': line[2],
    'REF#': line[3]
  };
}

function extractDimensions(size: string): { width: number; height: number } {
  const dimensions = size.split('x').map(d => parseFloat(d.trim()));
  
  if (dimensions.length !== 2 || isNaN(dimensions[0]!) || isNaN(dimensions[1]!)) {
    throw new Error(`Invalid size format: ${size}. Expected format: "width x height"`);
  }

  return {
    width: dimensions[0]!,
    height: dimensions[1]!
  };
}

async function importFile(filePath: string, brand: PaperBrand) {
  const records: any[] = [];
  let currentType: PaperType | null = null;
  let currentWeight: number | null = null;
  let currentFinish: PaperFinish | null = null;
  let currentCaliper: number | null = null;
  let isHPIndigo = false;

  const parser = createReadStream(filePath).pipe(
    parse({
      skip_empty_lines: true,
      trim: true
    })
  );

  for await (const line of parser) {
    // Check if this is a header line indicating paper type
    if (typeof line[0] === 'string' && line[0].includes('#')) {
      const headerText = line[0].toLowerCase();
      
      // Reset HP Indigo flag unless explicitly marked
      isHPIndigo = headerText.includes('hp indigo');
      
      // Extract weight from header (e.g., "80# Gloss Book")
      currentWeight = parseInt(headerText.match(/(\d+)#/)?.[1] ?? '0');
      
      // Determine paper type
      currentType = headerText.includes('cover') ? PaperType.Cover : PaperType.Book;
      
      // Determine finish
      if (headerText.includes('gloss')) {
        currentFinish = PaperFinish.Gloss;
      } else if (headerText.includes('satin')) {
        currentFinish = PaperFinish.Satin;
      } else if (headerText.includes('opaque')) {
        currentFinish = PaperFinish.Opaque;
      }
      
      // Extract caliper if present
      const caliperMatch = headerText.match(/caliper\s*([\d.]+)/i);
      currentCaliper = caliperMatch && caliperMatch[1] ? parseFloat(caliperMatch[1]) : null;
      
      continue;
    }

    const product = await parsePaperProduct(
      line, 
      brand, 
      currentType, 
      currentWeight, 
      currentFinish, 
      currentCaliper,
      isHPIndigo
    );

    if (product && 'isHeader' in product && product.isHeader) {
      // Handle header line
      continue;
    }

    if (product && 'Size' in product && product.Size) {
      const { width, height } = extractDimensions(product.Size);
      const sheetsPerUnit = parseInt(product['Sheets per Ctn/Skid'] ?? product['CTNS'] ?? '0');
      const mWeight = parseFloat(product['M Wgt'] || '0');
      const referenceId = product['REF#'];

      try {
        await prisma.paperProduct.upsert({
          where: { referenceId },
          update: {
            brand,
            paperType: currentType!,
            finish: currentFinish!,
            weightLb: currentWeight!,
            caliper: currentCaliper || 0,
            size: product.Size,
            width,
            height,
            mWeight,
            sheetsPerUnit,
            isHPIndigo,
          },
          create: {
            brand,
            paperType: currentType!,
            finish: currentFinish!,
            weightLb: currentWeight!,
            caliper: currentCaliper || 0,
            size: product.Size,
            width,
            height,
            mWeight,
            sheetsPerUnit,
            isHPIndigo,
            referenceId: referenceId || '',
          },
        });
        
        console.log(`Imported/Updated: ${brand} ${currentWeight}# ${currentFinish} ${currentType} - ${product.Size}`);
      } catch (error) {
        console.error(`Error importing ${referenceId}:`, error);
      }
    }
  }
}

async function main() {
  try {
    // Import Blazer Digital products
    await importFile(
      path.join(__dirname, '../prisma/import_data/blazer_digital_april_2023.csv'),
      PaperBrand.BlazerDigital
    );

    // Import Omnilux products
    await importFile(
      path.join(__dirname, '../prisma/import_data/omnilux_digital_april_2023.csv'),
      PaperBrand.OmniluxOpaque
    );

    console.log('Import completed successfully');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 