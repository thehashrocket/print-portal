import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function sendInvoiceEmail(to: string, subject: string, html: string, attachmentContent: string) {
    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL as string, // Use the email you verified with SendGrid
        subject,
        html,
        attachments: [
            {
                content: attachmentContent,
                filename: 'invoice.pdf',
                type: 'application/pdf',
                disposition: 'attachment',
            },
        ],
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}