import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const productTypes = [
  { name: 'Banner', description: 'Standard banner printing' },
  { name: 'Brochure', description: 'Informational brochures' },
  { name: 'Booklet', description: 'Multi-page booklets' },
  { name: 'Business Cards', description: 'Standard business cards' },
  { name: 'Business Card Labels', description: 'Labels in business card format' },
  { name: 'Envelopes', description: 'Various sizes of envelopes' },
  { name: 'Flyers', description: 'Single-sheet promotional flyers' },
  { name: 'Foam Core Poster, mounted', description: 'Posters mounted on foam core board' },
  { name: 'Fold-Over Cards', description: 'Cards that fold in half' },
  { name: 'Invitations', description: 'Event invitations' },
  { name: 'Labels(stickers)', description: 'Adhesive labels and stickers' },
  { name: 'Letterhead', description: 'Company letterhead stationery' },
  { name: 'NCR Form, 2pt', description: '2-part carbonless forms' },
  { name: 'NCR Form, 3pt', description: '3-part carbonless forms' },
  { name: 'Notepads', description: 'Custom notepads' },
  { name: 'Other', description: 'Other custom print products' },
  { name: 'Pop-Up Banner', description: 'Retractable banner stands' },
  { name: 'Posters', description: 'Standard posters' },
  { name: 'Post Cards', description: 'Standard postcards' },
  { name: 'Prayer Cards', description: 'Religious prayer cards' },
  { name: 'Rack Cards', description: 'Display rack cards' },
  { name: 'Remittance Envelopes', description: 'Payment return envelopes' },
  { name: 'Special Order', description: 'Custom special order items' },
  { name: 'Table Tent', description: 'Folded table display cards' },
];

async function main() {
  console.log('Starting to add product types...');

  try {
    await prisma.productType.createMany({
      data: productTypes,
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