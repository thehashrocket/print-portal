import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const productTypes = [
  { name: 'Banner', description: 'Standard banner printing' },
  { name: 'Booklet', description: 'Multi-page booklets' },
  { name: 'Brochure', description: 'Informational brochures' },
  { name: 'Business Card Labels', description: 'Labels in business card format' },
  { name: 'Business Cards', description: 'Standard business cards' },
  { name: 'Door Hangers', description: 'Door hangers' },
  { name: 'Envelopes', description: 'Various sizes of envelopes' },
  { name: 'Flyers', description: 'Single-sheet promotional flyers' },
  { name: 'Foam Core Poster, mounted', description: 'Posters mounted on foam core board' },
  { name: 'Fold-Over Cards', description: 'Cards that fold in half' },
  { name: 'Invitations', description: 'Event invitations' },
  { name: 'Labels(stickers)', description: 'Adhesive labels and stickers' },
  { name: 'Letterhead', description: 'Company letterhead stationery' },
  { name: 'Mailers', description: 'Mailers' },
  { name: 'NCR Form, 2pt', description: '2-part carbonless forms' },
  { name: 'NCR Form, 3pt', description: '3-part carbonless forms' },
  { name: 'Notepads', description: 'Custom notepads' },
  { name: 'Other', description: 'Other custom print products' },
  { name: 'Pop-Up Banner', description: 'Retractable banner stands' },
  { name: 'Post Cards', description: 'Standard postcards' },
  { name: 'Posters', description: 'Standard posters' },
  { name: 'Prayer Cards', description: 'Religious prayer cards' },
  { name: 'Rack Cards', description: 'Display rack cards' },
  { name: 'Remittance Envelopes', description: 'Payment return envelopes' },
  { name: 'Special Order', description: 'Custom special order items' },
  { name: 'Table Tent', description: 'Folded table display cards' },
];

// Do not add product types that already exist
const existingProductTypes = await prisma.productType.findMany({
  select: { name: true },
}); 

async function main() {
  console.log('Starting to add product types...');

  try {
    await prisma.productType.createMany({
      data: productTypes.filter(type => !existingProductTypes.some(existingType => existingType.name === type.name)),
      skipDuplicates: true,
    });
    console.log('Successfully added product types');
  } catch (error) {
    console.error('Error adding product types:', error);
  }

  console.log('Finished adding product types.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 