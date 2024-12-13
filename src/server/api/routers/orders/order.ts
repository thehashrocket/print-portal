import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { OrderStatus, Prisma, ShippingMethod } from "@prisma/client";
import { normalizeOrder, normalizeOrderItem, normalizeOrderPayment } from "~/utils/dataNormalization";
import { type SerializedOrder, type SerializedOrderItem } from "~/types/serializedTypes";
import { TRPCError } from "@trpc/server";
import { generateEmailOrderPDF } from "~/utils/pdfGenerator";
import { sendOrderEmail } from "~/utils/sengrid";
const SALES_TAX = 0.07;

export const orderRouter = createTRPCRouter({
  getByID: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }): Promise<SerializedOrder | null> => {
      const order = await ctx.db.order.findUnique({
        where: { id: input },
        include: {
          Office: {
            include: {
              Company: true,
            },
          },
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
              Order: {
                select: {
                  Office: {
                    select: {
                      Company: true,
                    }
                  },
                  WorkOrder: {
                    select: {
                      purchaseOrderNumber: true,
                    }
                  }
                }
              }
            },
          },
          contactPerson: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          OrderPayments: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          Invoice: {
            include: {
              InvoiceItems: true,
              InvoicePayments: true,
              createdBy: true,
              Order: {
                include: {
                  Office: {
                    include: {
                      Company: true,
                    }
                  }
                }
              }
            },
          },
          OrderNotes: true,
          WorkOrder: {
            select: {
              purchaseOrderNumber: true,
            }
          }
        },
      });

      if (!order) return null;

      const nonCancelledOrderItems = order.OrderItems.filter(item => item.status !== 'Cancelled');
      const totalCost = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0));
      const totalItemAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0));
      const totalShippingAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.shippingAmount ?? 0), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
      const totalOrderPayments = order.OrderPayments ? order.OrderPayments.map(normalizeOrderPayment) : [];
      const totalPaid = totalOrderPayments.reduce((sum, payment) => sum.add(new Prisma.Decimal(payment.amount)), new Prisma.Decimal(0));
      const balance = totalAmount.sub(totalPaid);

      return normalizeOrder({
        ...order,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalCost,
        totalItemAmount,
        totalShippingAmount,
        balance,
        totalPaid,
        OrderItems: order.OrderItems.map(item => ({
          ...item,
          artwork: item.artwork,
          Order: {
            Office: order.Office,
            WorkOrder: order.WorkOrder,
          },
          OrderItemStock: item.OrderItemStock,
        })),
      });
    }),

  getAll: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(),
    }).nullish())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const cursor = input?.cursor;

      const orders = await ctx.db.order.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          Office: {
            include: {
              Company: true,
            },
          },
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
              Order: {
                select: {
                  Office: {
                    select: {
                      Company: true,
                    }
                  },
                  WorkOrder: {
                    select: {
                      purchaseOrderNumber: true,
                    }
                  }
                }
              }
            },
          },
          contactPerson: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          OrderPayments: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          Invoice: {
            include: {
              InvoiceItems: true,
              InvoicePayments: true,
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true
                },
              },
              Order: {
                include: {
                  Office: {
                    include: {
                      Company: true,
                    }
                  }
                }
              }
            },
          },
          OrderNotes: true,
          WorkOrder: {
            select: {
              purchaseOrderNumber: true,
            }
          }
        },
      });

      return Promise.all(orders.map(async order => {
        const nonCancelledOrderItems = order.OrderItems.filter(item => item.status !== 'Cancelled');
        const totalCost = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0));
        const totalItemAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0));
        const totalShippingAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.shippingAmount ?? 0), new Prisma.Decimal(0));
        const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
        const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
        const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
        const totalOrderPayments = order.OrderPayments ? order.OrderPayments.map(normalizeOrderPayment) : [];
        const totalPaid = totalOrderPayments.reduce((sum, payment) => sum.add(new Prisma.Decimal(payment.amount)), new Prisma.Decimal(0));
        const balance = totalAmount.sub(totalPaid);

        return normalizeOrder({
          ...order,
          calculatedSalesTax,
          calculatedSubTotal,
          totalAmount,
          totalItemAmount,
          totalCost,
          totalShippingAmount,
          totalPaid,
          balance,
          createdBy: {
            id: order.createdBy.id,
            name: order.createdBy.name,
          },
          contactPerson: {
            id: order.contactPerson.id,
            name: order.contactPerson.name,
            email: order.contactPerson.email,
          },
        });
      }));
    }),

  updateDeposit: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        deposit: z.number().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }): Promise<SerializedOrder> => {
      const { id, data } = input;
      const { deposit } = data;

      const updatedOrder = await ctx.db.order.update({
        where: { id },
        data: { deposit },
        include: {
          Office: {
            include: {
              Company: true,
            },
          },
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
              Order: {
                select: {
                  Office: {
                    select: {
                      Company: true,
                    }
                  },
                  WorkOrder: {
                    select: {
                      purchaseOrderNumber: true,
                    }
                  }
                }
              }
            },
          },
          contactPerson: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          OrderPayments: true,
          ShippingInfo: {
            include: {
              Address: true,
              ShippingPickup: true,
            },
          },
          Invoice: {
            include: {
              InvoiceItems: true,
              InvoicePayments: true,
              createdBy: true,
            },
          },
          OrderNotes: true,
          WorkOrder: {
            select: {
              purchaseOrderNumber: true,
            }
          }
        },
      });

      const nonCancelledOrderItems = updatedOrder.OrderItems.filter(item => item.status !== 'Cancelled');
      const totalCost = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0));
      const totalItemAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0));
      const totalShippingAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.shippingAmount ?? 0), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
      const totalOrderPayments = updatedOrder.OrderPayments ? updatedOrder.OrderPayments.map(normalizeOrderPayment) : [];
      const totalPaid = totalOrderPayments.reduce((sum, payment) => sum.add(new Prisma.Decimal(payment.amount)), new Prisma.Decimal(0));
      const balance = totalAmount.sub(totalPaid);

      return normalizeOrder({
        ...updatedOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalItemAmount,
        totalCost,
        totalShippingAmount,
        totalPaid,
        balance,
      });
    }),

    updateContactPerson: protectedProcedure
    .input(z.object({
        orderId: z.string(),
        contactPersonId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
        const updatedOrder = await ctx.db.order.update({
            where: { id: input.orderId },
            data: { contactPersonId: input.contactPersonId },
        });

        return updatedOrder;
    }),

  updateShippingInfo: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      shippingInfo: z.object({
        addressId: z.string().optional(),
        instructions: z.string().optional(),
        shippingCost: z.number().optional(),
        shippingDate: z.date().optional(),
        shippingNotes: z.string().optional(),
        shippingMethod: z.string(),
        shippingOther: z.string().optional(),
        trackingNumber: z.string().optional(),
        ShippingPickup: z.object({
          id: z.string().optional(),
          pickupDate: z.date(),
          pickupTime: z.string(),
          contactName: z.string(),
          contactPhone: z.string(),
          notes: z.string().optional(),
        }).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      console.log('Updating shipping info:', input);
      
      const { orderId, shippingInfo } = input;

      const order = await ctx.db.order.findUnique({
        where: { id: orderId },
        select: { officeId: true },
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }

      try {
        const updatedOrder = await ctx.db.order.update({
          where: { id: orderId },
          data: {
            ShippingInfo: {
              upsert: {
                create: {
                  ...shippingInfo,
                  createdById: ctx.session.user.id,
                  officeId: order.officeId,
                  shippingMethod: shippingInfo.shippingMethod as ShippingMethod,
                  ShippingPickup: shippingInfo.ShippingPickup ? {
                    create: {
                      pickupDate: shippingInfo.ShippingPickup.pickupDate,
                      pickupTime: shippingInfo.ShippingPickup.pickupTime,
                      contactName: shippingInfo.ShippingPickup.contactName,
                      contactPhone: shippingInfo.ShippingPickup.contactPhone,
                      notes: shippingInfo.ShippingPickup.notes,
                      createdById: ctx.session.user.id,
                    }
                  } : undefined
                },
                update: {
                  addressId: shippingInfo.addressId,
                  shippingCost: shippingInfo.shippingCost,
                  shippingDate: shippingInfo.shippingDate,
                  shippingNotes: shippingInfo.shippingNotes,
                  shippingMethod: shippingInfo.shippingMethod as ShippingMethod,
                  trackingNumber: shippingInfo.trackingNumber,
                  shippingOther: shippingInfo.shippingOther,
                  instructions: shippingInfo.instructions,
                  ShippingPickup: shippingInfo.ShippingPickup ? {
                    create: {
                      pickupDate: shippingInfo.ShippingPickup.pickupDate,
                      pickupTime: shippingInfo.ShippingPickup.pickupTime,
                      contactName: shippingInfo.ShippingPickup.contactName,
                      contactPhone: shippingInfo.ShippingPickup.contactPhone,
                      notes: shippingInfo.ShippingPickup.notes,
                      createdById: ctx.session.user.id,
                    }
                  } : undefined
                },
              },
            },
          },
          include: {
            Office: {
              include: {
                Company: true,
              },
            },
            OrderItems: {
              include: {
                artwork: true,
                OrderItemStock: true,
                Order: {
                  select: {
                    Office: {
                      select: {
                        Company: true,
                      }
                    },
                    WorkOrder: {
                      select: {
                        purchaseOrderNumber: true,
                      }
                    }
                  }
                }
              },
            },
            contactPerson: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
            OrderPayments: true,
            ShippingInfo: {
              include: {
                Address: true,
                ShippingPickup: true,
              },
            },
            Invoice: {
              include: {
                InvoiceItems: true,
                InvoicePayments: true,
                createdBy: true,
              },
            },
            OrderNotes: true,
            WorkOrder: {
              select: {
                purchaseOrderNumber: true,
              }
            }
          },
        });
        
        console.log('Order updated successfully:', updatedOrder);
        return updatedOrder;
      } catch (error) {
        console.error('Error updating order:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update shipping info',
        });
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({
        id: z.string(),
        status: z.nativeEnum(OrderStatus),
        sendEmail: z.boolean(),
        emailOverride: z.string(),
        shippingDetails: z.object({
            trackingNumber: z.string().optional(),
            shippingMethod: z.nativeEnum(ShippingMethod).optional(),
        }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        const { id, status, sendEmail, emailOverride, shippingDetails } = input;

        // Update order status
        const updatedOrder = await ctx.db.order.update({
          where: { id: input.id },
          data: { 
            status: input.status,
            ShippingInfo: {
              update: {
                trackingNumber: shippingDetails?.trackingNumber,
                shippingMethod: shippingDetails?.shippingMethod,
              },
            },
          },
          include: {
            Office: {
              include: {
                Company: true,
              },
            },
            OrderItems: {
              include: {
                artwork: true,
                OrderItemStock: true,
                Order: {
                  select: {
                    Office: {
                      select: {
                        Company: true,
                      }
                    },
                    WorkOrder: {
                      select: {
                        purchaseOrderNumber: true,
                      }
                    }
                  }
                }
              },
            },
            contactPerson: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
            OrderPayments: true,
            ShippingInfo: {
              include: {
                Address: true,
                ShippingPickup: true,
              },
            },
            Invoice: {
              include: {
                InvoiceItems: true,
                InvoicePayments: true,
                createdBy: true,
              },
            },
            OrderNotes: true,
            WorkOrder: {
              select: {
                purchaseOrderNumber: true,
              }
            }
          },
        });

        // If sendEmail is true, send status update email
      // If emailOverride is provided, send to that email address instead of the customer's email address
      const emailToSend = input.emailOverride || updatedOrder.contactPerson?.email;

      // If the status is 'Cancelled', update the order items to 'Cancelled'
      if (input.status === 'Cancelled') {
        await ctx.db.orderItem.updateMany({
          where: { orderId: input.id },
          data: { status: 'Cancelled' },
        });
      }

      // If the status is 'Completed', update the order items to 'Completed'
      if (input.status === 'Completed') {
        await ctx.db.orderItem.updateMany({
          where: { orderId: input.id },
          data: { status: 'Completed' },
        });
      }

      if (input.sendEmail && emailToSend) {

        // If tracking number and shipping method are provided, add them to the email
        const trackingNumber = input.shippingDetails?.trackingNumber;
        const shippingMethod = input.shippingDetails?.shippingMethod;

        const emailHtml = `
            <h1>Order Status Update</h1>
            <p>Your order #${updatedOrder.orderNumber} status has been updated to: ${input.status}</p>
            ${trackingNumber ? `<p>Tracking Number: ${trackingNumber}</p>` : ''}
            ${shippingMethod ? `<p>Shipping Method: ${shippingMethod}</p>` : ''}
            <p>If you have any questions, please contact us.</p>
        `;

        await sendOrderEmail(
          emailToSend,
          `Order ${updatedOrder.orderNumber} Status Update`,
          emailHtml,
          '' // No attachment needed for status update
        );
      }

      const nonCancelledOrderItems = updatedOrder.OrderItems.filter(item => item.status !== 'Cancelled');
      const totalCost = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0));
      const totalItemAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0));
      const totalShippingAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.shippingAmount ?? 0), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
      const totalOrderPayments = updatedOrder.OrderPayments ? updatedOrder.OrderPayments.map(normalizeOrderPayment) : [];
      const totalPaid = totalOrderPayments.reduce((sum, payment) => sum.add(new Prisma.Decimal(payment.amount)), new Prisma.Decimal(0));
      const balance = totalAmount.sub(totalPaid);

      return normalizeOrder({
        ...updatedOrder,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalItemAmount,
        totalShippingAmount,
        totalCost,
        totalPaid,
        balance,
        OrderItems: updatedOrder.OrderItems.map(item => ({
          ...item,
          Order: {
            Office: updatedOrder.Office,
            WorkOrder: updatedOrder.WorkOrder,
          },
        })),
      });
    }),

  dashboard: protectedProcedure
    .query(async ({ ctx }): Promise<SerializedOrderItem[]> => {
      // Get all orders that are not cancelled or completed
      const orders = await ctx.db.order.findMany({
        where: {
          status: {
            notIn: ['Cancelled', 'Completed']
          }
        },
        include: {
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
              Order: {
                select: {
                  Office: {
                    select: {
                      Company: true,
                    }
                  },
                  WorkOrder: {
                    select: {
                      purchaseOrderNumber: true,
                    }
                  }
                }
              }
            }
          },
          Office: {
            include: {
              Company: true
            }
          }
        }
      });

      const allOrderItems: SerializedOrderItem[] = orders.flatMap(order =>
        order.OrderItems.map(item => {
          const normalizedItem = normalizeOrderItem(item);
          return {
            ...normalizedItem,
            officeId: order.officeId,
            officeName: order.Office.name,
            companyName: order.Office.Company.name,
          };
        })
      );

      return allOrderItems;
    }),

  sendOrderEmail: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      recipientEmail: z.string().email(),
      
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: {
          Office: {
            include: {
              Company: true,
            }
          },
          OrderItems: {
            include: {
              artwork: true,
              OrderItemStock: true,
              Order: {
                select: {
                  Office: {
                    select: {
                      Company: true,
                    }
                  },
                  WorkOrder: {
                    select: {
                      purchaseOrderNumber: true,
                    }
                  }
                }
              }
            },
          },
          OrderPayments: true,
          contactPerson: true,
          createdBy: true,
          WorkOrder: true,
        }
      });

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }

      const nonCancelledOrderItems = order.OrderItems.filter(item => item.status !== 'Cancelled');
      const totalCost = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.cost ?? 0), new Prisma.Decimal(0));
      const totalItemAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.amount ?? 0), new Prisma.Decimal(0));
      const totalShippingAmount = nonCancelledOrderItems.reduce((sum, item) => sum.add(item.shippingAmount ?? 0), new Prisma.Decimal(0));
      const calculatedSubTotal = totalItemAmount.add(totalShippingAmount);
      const calculatedSalesTax = totalItemAmount.mul(SALES_TAX);
      const totalAmount = totalItemAmount.add(totalShippingAmount).add(calculatedSalesTax);
      const totalOrderPayments = order.OrderPayments ? order.OrderPayments.map(normalizeOrderPayment) : [];
      const totalPaid = totalOrderPayments.reduce((sum, payment) => sum.add(new Prisma.Decimal(payment.amount)), new Prisma.Decimal(0));
      const balance = totalAmount.sub(totalPaid);

      const normalizedOrder = normalizeOrder({
        ...order,
        calculatedSalesTax,
        calculatedSubTotal,
        totalAmount,
        totalCost,
        totalItemAmount,
        totalShippingAmount,
        balance,
        totalPaid,
        OrderItems: order.OrderItems.map(item => ({
          ...item,
          artwork: item.artwork,
          Order: {
            Office: order.Office,
            WorkOrder: order.WorkOrder,
          },
          OrderItemStock: item.OrderItemStock,
        })),
      });

      const pdfContent = await generateEmailOrderPDF(normalizedOrder);
      const emailHtml = `
        <h1>Order ${order.orderNumber}</h1>
        <p>Please find attached the order for your recent order.</p>
      `;

      const emailSent = await sendOrderEmail(input.recipientEmail, `Order ${order.orderNumber} from ${order.Office.Company.name}`, emailHtml, pdfContent);

      if (emailSent) {
        return { success: true, message: 'Order sent successfully' };
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send order email',
        });
      }
    })
});