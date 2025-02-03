import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { OrderStatus, Prisma, ShippingMethod } from "@prisma/client";
import { normalizeOrder, normalizeOrderPayment, normalizeWalkInCustomer } from "~/utils/dataNormalization";
import { type SerializedOrder } from "~/types/serializedTypes";
import { TRPCError } from "@trpc/server";
import { sendOrderEmail, sendOrderStatusEmail } from "~/utils/sengrid";
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
              ProductType: true,
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
          },
          WalkInCustomer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
              updatedAt: true
            }
          },
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
          ProductType: item.ProductType,
          Order: {
            Office: order.Office,
            WorkOrder: order.WorkOrder,
          },
          OrderItemStock: item.OrderItemStock,
        })),
        WalkInCustomer: order.WalkInCustomer ? normalizeWalkInCustomer(order.WalkInCustomer) : null,
      });
    }),

  getAll: protectedProcedure
    .input(z.object({
    }).nullish())
    .query(async ({ ctx, input }) => {

      const orders = await ctx.db.order.findMany({
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
              ProductType: true,
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
          },
          WalkInCustomer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
              updatedAt: true
            }
          },
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
          contactPerson: order.contactPerson ? {
            id: order.contactPerson.id,
            name: order.contactPerson.name,
            email: order.contactPerson.email,
          } : null,
          WalkInCustomer: order.WalkInCustomer ? normalizeWalkInCustomer(order.WalkInCustomer) : null,
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
              ProductType: true,
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
          },
          WalkInCustomer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
              updatedAt: true
            }
          },
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
        WorkOrder: {
          purchaseOrderNumber: updatedOrder.WorkOrder?.purchaseOrderNumber ?? null
        },
        OrderItems: updatedOrder.OrderItems.map(item => ({
          ...item,
          Order: {
            Office: updatedOrder.Office,
            WorkOrder: updatedOrder.WorkOrder,
          },
        })),
        contactPerson: updatedOrder.contactPerson || null,
        WalkInCustomer: updatedOrder.WalkInCustomer ? normalizeWalkInCustomer(updatedOrder.WalkInCustomer) : null,
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
        shippingMethod: z.nativeEnum(ShippingMethod),
        shippingOther: z.string().optional(),
        trackingNumber: z.array(z.string()).optional(),
        shippingPickup: z.object({
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
                  instructions: shippingInfo.instructions,
                  shippingOther: shippingInfo.shippingOther,
                  shippingDate: shippingInfo.shippingDate,
                  shippingMethod: shippingInfo.shippingMethod as ShippingMethod,
                  shippingCost: shippingInfo.shippingCost,
                  officeId: order.officeId,
                  addressId: shippingInfo.addressId,
                  createdById: ctx.session.user.id,
                  shippingNotes: shippingInfo.shippingNotes,
                  trackingNumber: shippingInfo.trackingNumber || [],
                  ShippingPickup: shippingInfo.shippingPickup ? {
                    create: {
                      pickupDate: shippingInfo.shippingPickup.pickupDate,
                      pickupTime: shippingInfo.shippingPickup.pickupTime,
                      contactName: shippingInfo.shippingPickup.contactName,
                      contactPhone: shippingInfo.shippingPickup.contactPhone,
                      notes: shippingInfo.shippingPickup.notes,
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
                  trackingNumber: shippingInfo.trackingNumber || [],
                  shippingOther: shippingInfo.shippingOther,
                  instructions: shippingInfo.instructions,
                  ShippingPickup: shippingInfo.shippingPickup ? {
                    deleteMany: {},
                    create: {
                      pickupDate: shippingInfo.shippingPickup.pickupDate,
                      pickupTime: shippingInfo.shippingPickup.pickupTime,
                      contactName: shippingInfo.shippingPickup.contactName,
                      contactPhone: shippingInfo.shippingPickup.contactPhone,
                      notes: shippingInfo.shippingPickup.notes,
                      createdById: ctx.session.user.id,
                    }
                  } : {
                    deleteMany: {}
                  }
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
                ProductType: true,
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
            },
            WalkInCustomer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                updatedAt: true
              }
            },
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
        trackingNumber: z.array(z.string()).optional(),
        shippingMethod: z.nativeEnum(ShippingMethod).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { shippingDetails } = input;

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
              ProductType: true,
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
          },
          WalkInCustomer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true,
              updatedAt: true
            }
          },
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

      // If the status is 'Invoiced', update the order items to 'Invoiced'
      if (input.status === 'Invoiced') {
        await ctx.db.orderItem.updateMany({
          where: { orderId: input.id },
          data: { status: 'Invoiced' },
        });
      }

      if (input.sendEmail && emailToSend) {

        // If tracking number and shipping method are provided, add them to the email
        const trackingNumber = input.shippingDetails?.trackingNumber;
        const shippingMethod = input.shippingDetails?.shippingMethod;

        const emailHtml = `
            <h1>Order Status Update</h1>
            <p>Your order #${updatedOrder.orderNumber} status has been updated to: ${input.status}</p>
            ${trackingNumber ? `<p>Tracking Number: ${trackingNumber.join(', ')}</p>` : ''}
            ${shippingMethod ? `<p>Shipping Method: ${shippingMethod}</p>` : ''}
            <p>If you have any questions, please contact us.</p>
        `;

        const dynamicTemplateData = {
          subject: `Order ${updatedOrder.orderNumber} Status Update`,
          html: emailHtml,
          orderNumber: updatedOrder.orderNumber.toString(),
          status: input.status,
          trackingNumber: trackingNumber ? trackingNumber.join(', ') : null,
          shippingMethod: shippingMethod || null,
        };

        await sendOrderStatusEmail(
          emailToSend,
          `Order ${updatedOrder.orderNumber} Status Update`,
          dynamicTemplateData,
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
        WalkInCustomer: updatedOrder.WalkInCustomer ? normalizeWalkInCustomer(updatedOrder.WalkInCustomer) : null,
      });
    }),

  // Order Dashbaord
  // Shows all orders, their status, and the company they are associated with
  // Includes OrderItemStatus, returns the status that all OrderItems equal,
  // otherwise, it returns the lowest status of all OrderItems
  // We don't need to show Orders that are Cancelled, Invoiced, or Completed
  dashboard: protectedProcedure
    .query(async ({ ctx }) => {
      const orders = await ctx.db.order.findMany({
        where: {
          status: {
            notIn: ['Cancelled', 'Invoiced', 'PaymentReceived']
          }
        },
        include: {
          WorkOrder: {
            select: {
              purchaseOrderNumber: true,
            }
          },
          OrderItems: true,
          Office: {
            include: {
              Company: true,
            }
          }
        }
      });
      return orders.map(order => {
        const orderItemStatuses = order.OrderItems.map(orderItem => orderItem.status);
        // Loop through OrderItems and find the status that is the lowest
        // If all OrderItems are the same, return that status
        // Otherwise, return the lowest status
        const orderStatus = orderItemStatuses.every(status => status === orderItemStatuses[0]) ?
          orderItemStatuses[0] :
          orderItemStatuses.reduce((prev, current) => prev < current ? prev : current);

        // Loop through the OrderItems, sort by expectedDate, and return the first one  
        const firstOrderItem = order.OrderItems.sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime())[0];
        return {
          ...order,
          orderNumber: order.orderNumber.toString(),
          purchaseOrderNumber: order.WorkOrder?.purchaseOrderNumber || '',
          deposit: Number(order.deposit),
          OrderItems: order.OrderItems.map(item => ({
            ...item,
            amount: item.amount ? Number(item.amount) : null,
            cost: item.cost ? Number(item.cost) : null,
            shippingAmount: item.shippingAmount ? Number(item.shippingAmount) : null,
          })),
          OrderItemStatus: orderStatus,
          inHandsDate: firstOrderItem?.expectedDate,
          companyName: order.Office.Company.name,
        };
      });
    }),

  sendOrderEmail: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      recipientEmail: z.string().email(),
      pdfContent: z.string().min(1, "PDF content cannot be empty"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log('Received PDF content length:', input.pdfContent.length);
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
            WalkInCustomer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                updatedAt: true
              }
            },
          }
        });

        if (!order) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Order not found',
          });
        }

        const emailHtml = `
          <h1>Order ${order.orderNumber}</h1>
          <p>Please find attached the order for your recent order.</p>
        `;

        const dynamicTemplateData = {
          subject: `Order ${order.orderNumber} from ${order.Office.Company.name}`,
          html: emailHtml,
          orderNumber: order.orderNumber.toString(),
          companyName: order.Office.Company.name,
          officeName: order.Office.name,
        };

        const emailSent = await sendOrderEmail(
          input.recipientEmail,
          `Order ${order.orderNumber} from ${order.Office.Company.name}`,
          dynamicTemplateData,
          input.pdfContent
        );

        if (!emailSent) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send email',
          });
        }

        return { success: true, message: 'Order sent successfully' };
      } catch (error) {
        console.error('Error in sendOrderEmail:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send order email',
        });
      }
    })
});