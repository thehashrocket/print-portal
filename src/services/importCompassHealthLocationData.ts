import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface CompassHealthLocation {
  "Site ID": string;
  "Office": string;
  "Address": string;
}

function parseAddress(addressString: string): {
  line1: string;
  line2: string | undefined;
  line3: string | undefined;
  line4: string | undefined;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  telephoneNumber: string;
} {
  // Remove any quotes from the address
  addressString = addressString.replace(/"/g, '') || '';
  
  // Split the address by comma
  const parts = addressString.split(',').map(part => part.trim());
  
  if (parts.length < 2) {
    throw new Error('Invalid address format: missing city, state, or zip');
  }

  // Last part should contain state and zip
  const stateZip = parts[parts.length - 1]?.split(' ') || [];
  if (stateZip.length < 2) {
    throw new Error('Invalid state/zip format');
  }
  const state = stateZip[stateZip.length - 2] || '';
  const zipCode = stateZip[stateZip.length - 1] || '';
  
  // Second to last part is the city
  const city = parts[parts.length - 2] || '';
  
  // Handle suite/apartment numbers
  let line1 = parts[0] || '';
  let line2: string | undefined = undefined;
  let line3: string | undefined = undefined;
  let line4: string | undefined = undefined;
  
  // Check if there's a suite/apartment number in the middle parts
  if (parts.length > 2) {
    const middlePart = parts[1];
    if (middlePart) {
      const suiteMatch = middlePart.match(/(?:Suite|Ste\.?|Bldg\.?|Unit)\s*(.+)/i);
      if (suiteMatch) {
        line2 = middlePart.trim();
      } else if (middlePart.includes('#')) {
        line2 = middlePart.trim();
      } else if (/^[A-Za-z]/.test(middlePart)) {
        line2 = middlePart.trim();
      }
    }
  }

  return {
    line1,
    line2,
    line3,
    line4,
    city,
    state,
    zipCode,
    country: "USA",
    telephoneNumber: "", // Empty string as per the schema
  };
}

export async function importData() {
  try {
    // Find the Compass Health company
    const compassHealth = await prisma.company.findFirst({
      where: {
        name: "Compass Health"
      }
    });

    if (!compassHealth) {
      throw new Error("Compass Health company not found in database");
    }

    // Find system user
    const systemUser = await prisma.user.findFirst({
      where: {
        email: "jason.shultz@1905newmedia.com"
      }
    });

    if (!systemUser) {
      throw new Error("System user not found");
    }

    const csvPath = path.join(process.cwd(), "prisma/import_data/compass_health_locations_2024.csv");
    const fileContent = fs.readFileSync(csvPath, "utf-8");

    const records: CompassHealthLocation[] = await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });

    for (const row of records) {
      try {
        const officeName = `${row["Site ID"]} - ${row["Office"]}`;
        const parsedAddress = parseAddress(row["Address"]);

        // Create office using the same structure as the endpoint
        const office = await prisma.office.create({
          data: {
            name: officeName,
            isActive: true,
            createdBy: {
              connect: {
                id: systemUser.id,
              },
            },
            Company: {
              connect: {
                id: compassHealth.id,
              },
            },
            Addresses: {
              create: [{
                line1: parsedAddress.line1,
                line2: parsedAddress.line2,
                line3: parsedAddress.line3,
                line4: parsedAddress.line4,
                city: parsedAddress.city,
                state: parsedAddress.state,
                zipCode: parsedAddress.zipCode,
                country: parsedAddress.country,
                telephoneNumber: parsedAddress.telephoneNumber,
              }],
            },
          },
        });

        console.log(`Imported office: ${officeName}`);
      } catch (error) {
        console.error(`Error processing location ${row["Site ID"]}:`, error);
      }
    }

    console.log("Import completed");
  } catch (error) {
    console.error("Import failed:", error);
    throw error;
  }
}
