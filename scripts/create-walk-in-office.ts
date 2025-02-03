import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createWalkInOffice() {
    try {
        // Get the first admin user to use as createdBy
        const adminUser = await prisma.user.findFirst({
            where: {
                Roles: {
                    some: {
                        name: 'Admin'
                    }
                }
            }
        });

        if (!adminUser) {
            throw new Error('No admin user found in the system');
        }

        // First find the walk-in company if it exists
        const existingCompany = await prisma.company.findFirst({
            where: {
                name: 'Walk-In Customers'
            }
        });

        // Create or update walk-in company
        const walkInCompany = existingCompany 
            ? await prisma.company.update({
                where: { id: existingCompany.id },
                data: { isActive: true }
            })
            : await prisma.company.create({
                data: {
                    name: 'Walk-In Customers',
                    isActive: true,
                    quickbooksId: 'WALK-IN-CUSTOMERS' // Required for unique constraint
                }
            });
        console.log('Walk-in company upserted:', walkInCompany);

        // Find existing counter office
        const existingOffice = await prisma.office.findFirst({
            where: {
                quickbooksCustomerId: 'COUNTER-SERVICE'
            }
        });

        // Create or update counter office
        const counterOffice = existingOffice
            ? await prisma.office.update({
                where: { id: existingOffice.id },
                data: {
                    companyId: walkInCompany.id,
                    isActive: true,
                    isWalkInOffice: true
                }
            })
            : await prisma.office.create({
                data: {
                    name: 'Counter Service',
                    companyId: walkInCompany.id,
                    isActive: true,
                    createdById: adminUser.id,
                    quickbooksCustomerId: 'COUNTER-SERVICE',
                    isWalkInOffice: true
                }
            });
        console.log('Counter office upserted:', counterOffice);

        console.log('Walk-in office setup completed successfully!');
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error setting up walk-in office:', error.message);
        } else {
            console.error('Unknown error setting up walk-in office');
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function
createWalkInOffice()
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 
