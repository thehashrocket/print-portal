import { PrismaClient } from '@prisma/client';

async function downcaseEmails() {
  const prisma = new PrismaClient();
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      where: {
        deleted: false,
        email: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
      }
    }) as Array<{ id: string; email: string }>;

    // Group users by lowercase email to find duplicates
    const emailGroups = users.reduce((acc, user) => {
      const lowerEmail = user.email.toLowerCase();
      if (!acc[lowerEmail]) {
        acc[lowerEmail] = [];
      }
      acc[lowerEmail].push(user);
      return acc;
    }, {} as Record<string, Array<{ id: string; email: string }>>);

    // Process each group
    for (const [lowerEmail, userGroup] of Object.entries(emailGroups)) {
      if (userGroup.length === 1) {
        // No duplicates, just lowercase the email
        if (userGroup[0]!.email !== lowerEmail) {
          console.log(`Converting ${userGroup[0]!.email} to ${lowerEmail}`);
          await prisma.user.update({
            where: { id: userGroup[0]!.id },
            data: { email: lowerEmail }
          });
        }
      } else {
        // Handle duplicates
        console.log(`Found ${userGroup.length} users with email ${lowerEmail}`);
        
        // Sort by ID to ensure consistent processing
        userGroup.sort((a, b) => a.id.localeCompare(b.id));
        
        // Keep the first one as is (lowercase)
        if (userGroup[0]!.email !== lowerEmail) {
          console.log(`Converting ${userGroup[0]!.email} to ${lowerEmail}`);
          await prisma.user.update({
            where: { id: userGroup[0]!.id },
            data: { email: lowerEmail }
          });
        }
        
        // Add suffix to others
        for (let i = 1; i < userGroup.length; i++) {
          const newEmail = `${lowerEmail}.${i}`;
          console.log(`Converting duplicate ${userGroup[i]!.email} to ${newEmail}`);
          await prisma.user.update({
            where: { id: userGroup[i]!.id },
            data: { email: newEmail }
          });
        }
      }
    }

    console.log('Email conversion completed successfully');
  } catch (error) {
    console.error('Error during email conversion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
downcaseEmails()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 