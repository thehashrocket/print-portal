// This script copies the purchase order numbers from Work Orders to Orders

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function copyPurchaseOrderNumbers() {
    console.log('Starting purchase order number copy process...');
    
    try {
        // Get all WorkOrders with their associated Orders in a single query
        const workOrders = await prisma.workOrder.findMany({
            where: {
                purchaseOrderNumber: { not: null }
            },
            select: {
                purchaseOrderNumber: true,
                id: true,
                Orders: {
                    select: {
                        id: true
                    }
                }
            },
        });

        console.log(`Found ${workOrders.length} work orders with purchase order numbers`);

        let totalOrdersUpdated = 0;

        // Process updates in batches for better performance
        for (const workOrder of workOrders) {
            if (workOrder.Orders.length === 0) continue;

            await prisma.order.updateMany({
                where: {
                    workOrderId: workOrder.id
                },
                data: {
                    purchaseOrderNumber: workOrder.purchaseOrderNumber
                }
            });

            totalOrdersUpdated += workOrder.Orders.length;
            console.log(`Updated ${workOrder.Orders.length} orders for WorkOrder ${workOrder.id}`);
        }

        console.log(`Successfully completed. Total orders updated: ${totalOrdersUpdated}`);
    } catch (error) {
        console.error('Error copying purchase order numbers:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

copyPurchaseOrderNumbers()
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });