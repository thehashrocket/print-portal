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

export async function sendOrderEmail(
    to: string,
    subject: string,
    html: string,
    attachmentContent: string
) {
    const msg = {
        to,
        from: process.env.SENDGRID_EMAIL_FROM as string,
        subject,
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