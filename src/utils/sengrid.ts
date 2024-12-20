import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_SMTP_PASSWORD as string);

interface SendGridError {
    response?: {
        body: unknown;
    };
    message?: string;
}

export async function sendInvoiceEmail(
    to: string,
    subject: string,
    html: string,
    attachmentContent: string
) {
    const msg = {
        to,
        from: process.env.SENDGRID_EMAIL_FROM as string, // Use the email you verified with SendGrid
        subject,
        templateId: process.env.SENDGRID_INVOICE_TEMPLATE_ID as string,
        html
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
        return true;
    } catch (error: unknown) {
        console.error('Error sending email:', error);
        if (error && typeof error === 'object' && 'response' in error) {
            const sendGridError = error as SendGridError;
            if (sendGridError.response) {
                console.error('SendGrid error response:', sendGridError.response.body);
            }
        }
        return false;
    }
}

// Sends an email to the customer with the order details
// This is the email that is sent when the customer places an order
export async function sendOrderEmail(
    to: string,
    subject: string,
    dynamicTemplateData: {
        subject: string,
        html: string,
        orderNumber: string,
        companyName: string,
        officeName: string,
    },
    pdfContent: string
) {
    const msg = {
        to,
        from: process.env.SENDGRID_EMAIL_FROM as string,
        templateId: process.env.SENDGRID_ORDER_TEMPLATE_ID as string,
        subject,
        dynamicTemplateData: {
          subject: dynamicTemplateData.subject,
          html: dynamicTemplateData.html,
          orderNumber: dynamicTemplateData.orderNumber,
          companyName: dynamicTemplateData.companyName,
          officeName: dynamicTemplateData.officeName,
        },
        attachments: [
            {
              content: pdfContent,
              filename: 'order.pdf',
              type: 'application/pdf',
              disposition: 'attachment',
            },
          ],
      };

      console.log('msg', msg);

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
        return true;
    } catch (error: unknown) {
        console.error('Error sending email:', error);
        if (error && typeof error === 'object' && 'response' in error) {
            const sendGridError = error as SendGridError;
            if (sendGridError.response) {
                console.error('SendGrid error response:', sendGridError.response.body);
            }
        }
        return false;
    }
}

// Sends an email to the customer with the order status
export async function sendOrderStatusEmail(
    to: string,
    subject: string,
    dynamicTemplateData: {
        subject: string,
        html: string,
        orderNumber: string,
        status: string,
        trackingNumber: string | null,
        shippingMethod: string | null,
    }
) {
    const msg = {
        to,
        from: process.env.SENDGRID_EMAIL_FROM as string,
        templateId: process.env.SENDGRID_ORDER_STATUS_TEMPLATE_ID as string,
        dynamicTemplateData: {
            subject: subject,
            orderNumber: dynamicTemplateData.orderNumber,
            status: dynamicTemplateData.status,
            trackingNumber: dynamicTemplateData.trackingNumber,
            shippingMethod: dynamicTemplateData.shippingMethod,
        },
    };

    console.log('msg', msg);

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
        return true;
    } catch (error: unknown) {
        console.error('Error sending email:', error);
        return false;
    }
}
