import { PaperType, PaperBrand, PaperFinish, PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface PaperCatalogRow {
  Paper: string;
  Category: string;
}

function extractDimensions(size: string): { width: number; height: number } {
  // Extract dimensions from strings like "8.5 x 11" or "12 x 18"
  const dimensions = size.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/);
  if (!dimensions) {
    throw new Error(`Could not extract dimensions from size: ${size}`);
  }
  return {
    width: parseFloat(dimensions[1]!),
    height: parseFloat(dimensions[2]!)
  };
}

function determinePaperType(category: string): PaperType {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('envelope')) {
    return PaperType.Envelope;
  } else if (lowerCategory.includes('gloss coated')) {
    return PaperType.GlossCoated;
  } else if (lowerCategory.includes('matte coated')) {
    return PaperType.MatteCoated;
  } else if (lowerCategory.includes('plain/uncoated')) {
    return PaperType.PlainUncoated;
  }
  return PaperType.Other;
}

function extractWeightAndType(paper: string): { weight: number | null } {
  // Match patterns like "80T" (text) or "80C" (cover)
  const match = paper.match(/(\d+)(T|C)/i);
  if (match) {
    const weight = parseInt(match[1]!);
    return { weight };
  }
  // For special cases like "#20 Plain"
  const plainMatch = paper.match(/#(\d+)/);
  if (plainMatch) {
    return {
      weight: parseInt(plainMatch[1]!)
    };
  }
  return {
    weight: null
  };
}

function determinePaperBrand(paper: string): PaperBrand {
  if (paper.toLowerCase().includes('omnilux')) {
    return PaperBrand.OmniluxOpaque;
  }
  return PaperBrand.Other;
}

function determinePaperFinish(category: string): PaperFinish {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('gloss')) {
    return PaperFinish.Gloss;
  } else if (lowerCategory.includes('matte')) {
    return PaperFinish.Satin;
  } else if (lowerCategory.includes('plain') || lowerCategory.includes('uncoated')) {
    return PaperFinish.Opaque;
  }
  return PaperFinish.Other;
}

async function importPaperCatalog() {
  try {
    const csvPath = path.join(process.cwd(), 'prisma/import_data/paper_catalog.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const records = await new Promise<PaperCatalogRow[]>((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err, parsedRecords: PaperCatalogRow[]) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(parsedRecords ?? []);
      });
    });

    for (const row of records) {
      try {
        // Extract size from the paper name
        const sizeMatch = row.Paper.match(/\d+\.?\d*\s*x\s*\d+\.?\d*/);
        if (!sizeMatch) {
          console.log(`Skipping row with no size information: ${row.Paper}`);
          continue;
        }

        const { width, height } = extractDimensions(sizeMatch[0]);
        const { weight } = extractWeightAndType(row.Paper);
        const brand = determinePaperBrand(row.Paper);
        const finish = determinePaperFinish(row.Category);
        const paperType = determinePaperType(row.Category);

        // Generate a unique reference ID
        const referenceId = `${row.Paper.replace(/[^a-zA-Z0-9]/g, '_')}`;

        await prisma.paperProduct.upsert({
          where: { referenceId },
          update: {
            brand,
            paperType,
            finish,
            weightLb: weight,
            size: sizeMatch[0],
            width,
            height,
            customDescription: row.Paper,
          },
          create: {
            brand,
            paperType,
            finish,
            weightLb: weight,
            size: sizeMatch[0],
            width,
            height,
            referenceId,
            customDescription: row.Paper,
          },
        });

        console.log(`Imported/Updated: ${row.Paper}`);
      } catch (error) {
        console.error(`Error processing row: ${row.Paper}`, error);
      }
    }

    console.log('Import completed successfully');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importPaperCatalog(); 
