import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface QuickbooksRow {
  "Active Status": string;
  "Customer": string;
  "Company": string;
  "First Name": string;
  "Last Name": string;
  "Main Phone": string;
  "Main Email": string;
  "Bill to 1": string;
  "Bill to 2": string;
  "Bill to 3": string;
  "Bill to 4": string;
  "Bill to 5": string;
  "Ship to 1": string;
  "Ship to 2": string;
  "Ship to 3": string;
  "Ship to 4": string;
  "Ship to 5": string;
}

interface ParsedAddress {
  line1: string;
  line2: string | null;
  line3: string | null;
  line4: string | null;
  city: string;
  state: string;
  zipCode: string;
}

function cleanString(str: string | undefined): string {
  return (str || "").trim();
}

function findAddressWithCityStateZip(addressLines: string[]): number {
  const stateRegex = /\b[A-Z]{2}\b/;  // Matches two capital letters
  const zipRegex = /\b\d{5}(-\d{4})?\b/;  // Matches 5 digit zip code, optionally with 4 digit extension

  return addressLines.findIndex(line => 
    line && stateRegex.test(line) && zipRegex.test(line)
  );
}

function extractCityStateZip(line: string): { city: string; state: string; zipCode: string } {
  const stateRegex = /\b[A-Z]{2}\b/;
  const zipRegex = /\b\d{5}(-\d{4})?\b/;
  
  // Extract zip code
  const zipMatch = line.match(zipRegex);
  const zipCode = zipMatch ? zipMatch[0] : "";
  
  // Extract state
  const stateMatch = line.match(stateRegex);
  const state = stateMatch ? stateMatch[0] : "";
  
  // Remove zip and state from the line to get city
  let city = line
    .replace(zipRegex, "")
    .replace(stateRegex, "")
    .replace(/,/g, "")  // Remove commas
    .trim();
  
  return { city, state, zipCode };
}

function parseAddressLines(addressLines: string[]): ParsedAddress | null {
  // Clean and filter out empty lines
  const cleanedLines = addressLines
    .map(line => cleanString(line))
    .filter(line => line.length > 0);

  if (cleanedLines.length === 0) {
    return null;
  }

  // Find which line contains city, state, zip
  const cityStateZipIndex = findAddressWithCityStateZip(cleanedLines);
  
  if (cityStateZipIndex === -1) {
    return null;
  }

  // Before extracting, check if line exists
  if (!cleanedLines[cityStateZipIndex]) {
    return null;
  }

  const { city, state, zipCode } = extractCityStateZip(cleanedLines[cityStateZipIndex]);

  // Get all lines before the city/state/zip line for address lines
  const streetLines = cleanedLines.slice(0, cityStateZipIndex);
  const line1 = streetLines[0] || "";
  const line2 = streetLines[1] || null;
  const line3 = streetLines[2] || null;
  const line4 = streetLines[3] || null;

  return {
    line1,
    line2,
    line3,
    line4,
    city,
    state,
    zipCode
  };
}

async function createSystemUser() {
  // First check if system user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      email: "jason.shultz@1905newmedia.com"
    }
  });

  if (existingUser) {
    return existingUser;
  }

  // Create system user if it doesn't exist
  const hashedPassword = await bcrypt.hash("systemuser123", 10);
  
  const systemUser = await prisma.user.create({
    data: {
      name: "System User",
      email: "system@thomsonprinting.com",
      password: hashedPassword,
      Roles: {
        connect: [{ name: "Admin" }]
      }
    }
  });

  return systemUser;
}

function extractFirstValidEmail(emailString: string): string | null {
  // Split by common separators (comma or semicolon)
  const emails = emailString.split(/[,;]/)
    .map(e => e.trim())
    .filter(e => e.length > 0);

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Find first valid email
  const validEmail = emails.find(email => {
    // Skip entries that look like phone numbers or don't have @ symbol
    if (email.match(/^\+?\d[\d\s-]+$/) || !email.includes('@')) {
      return false;
    }
    return emailRegex.test(email);
  });

  return validEmail || null;
}

async function importData() {
  // Create system user first
  const systemUser = await createSystemUser();
  
  const csvPath = path.join(process.cwd(), "prisma/import_data/quickbooks_client_export.csv");
  const fileContent = fs.readFileSync(csvPath, "utf-8");

  const records = await new Promise<QuickbooksRow[]>((resolve, reject) => {
    parse<QuickbooksRow>(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }, (err, parsedRecords) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(parsedRecords ?? []);
    });
  });

  for (const row of records) {
    try {
      // Create or update company
      const companyName = cleanString(row.Company || row.Customer);
      
      // First try to find existing company
      const existingCompany = await prisma.company.findFirst({
        where: {
          name: companyName,
        }
      });

      let company;
      if (existingCompany) {
        // Update existing company
        company = await prisma.company.update({
          where: {
            id: existingCompany.id
          },
          data: {
            isActive: row["Active Status"] === "Active",
          }
        });
      } else {
        // Create new company
        company = await prisma.company.create({
          data: {
            name: companyName,
            isActive: row["Active Status"] === "Active",
            deleted: false,
          }
        });
      }

      // Create office
      const office = await prisma.office.create({
        data: {
          name: cleanString(row.Customer),
          isActive: row["Active Status"] === "Active",
          deleted: false,
          companyId: company.id,
          createdById: systemUser.id,
        },
      });

      // Handle billing address
      const billingAddressLines = [
        row["Bill to 1"],
        row["Bill to 2"],
        row["Bill to 3"],
        row["Bill to 4"],
        row["Bill to 5"],
      ];

      const parsedBillingAddress = parseAddressLines(billingAddressLines);
      
      if (parsedBillingAddress) {
        await prisma.address.create({
          data: {
            addressType: "Billing",
            line1: parsedBillingAddress.line1,
            line2: parsedBillingAddress.line2 ?? undefined,
            line3: parsedBillingAddress.line3 ?? undefined,
            line4: parsedBillingAddress.line4 ?? undefined,
            city: parsedBillingAddress.city,
            state: parsedBillingAddress.state,
            zipCode: parsedBillingAddress.zipCode,
            country: "USA",
            telephoneNumber: cleanString(row["Main Phone"]),
            officeId: office.id,
          },
        });
      }

      // Handle shipping address
      const shippingAddressLines = [
        row["Ship to 1"],
        row["Ship to 2"],
        row["Ship to 3"],
        row["Ship to 4"],
        row["Ship to 5"],
      ];

      const parsedShippingAddress = parseAddressLines(shippingAddressLines);
      
      // Only create shipping address if it's different from billing
      if (parsedShippingAddress && 
          (!parsedBillingAddress || 
           parsedShippingAddress.line1 !== parsedBillingAddress.line1 ||
           parsedShippingAddress.city !== parsedBillingAddress.city)) {
        await prisma.address.create({
          data: {
            addressType: "Shipping",
            line1: parsedShippingAddress.line1,
            line2: parsedShippingAddress.line2 ?? undefined,
            line3: parsedShippingAddress.line3 ?? undefined,
            line4: parsedShippingAddress.line4 ?? undefined,
            city: parsedShippingAddress.city,
            state: parsedShippingAddress.state,
            zipCode: parsedShippingAddress.zipCode,
            country: "USA",
            telephoneNumber: cleanString(row["Main Phone"]),
            officeId: office.id,
          },
        });
      }

      // Create or update user if contact info exists
      if (row["First Name"] || row["Last Name"] || row["Main Email"]) {
        const email = cleanString(row["Main Email"]);
        const name = `${cleanString(row["First Name"])} ${cleanString(row["Last Name"])}`.trim();

        if (email) {  // Only proceed if there's an email
          const validEmail = extractFirstValidEmail(email);
          
          if (validEmail) {  // Only proceed if there's a valid email
            // Check for existing user
            const existingUser = await prisma.user.findUnique({
              where: { email: validEmail },
              include: {
                Roles: true
              }
            });

            if (existingUser) {
              // Update existing user
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  name: name || existingUser.name,
                  offices: {
                    create: {
                      officeId: office.id
                    }
                  },
                  Roles: !existingUser.Roles.some(role => role.name === "Customer")
                    ? {
                        connect: [{ name: "Customer" }]
                      }
                    : undefined
                },
              });
            } else {
              // Create new user
              await prisma.user.create({
                data: {
                  name,
                  email: validEmail,
                  offices: {
                    create: {
                      officeId: office.id
                    }
                  },
                  Roles: {
                    connect: [{ name: "Customer" }],
                  },
                },
              });
            }
          } else {
            console.log(`Skipping user creation for ${name} - invalid email format: ${email}`);
          }
        } else {
          // Handle users without email - you might want to generate a unique email or skip
          console.log(`Skipping user creation for ${name} - no email provided`);
        }
      }

    } catch (error) {
      console.error(`Error processing row for ${row.Customer}:`, error);
    }
  }
}

export { importData }; 
