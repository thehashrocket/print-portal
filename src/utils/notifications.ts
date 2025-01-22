import nodemailer from "nodemailer";

export async function sendAdminNotification(message: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SENDGRID_SMTP_HOST,
        port: parseInt(process.env.SENDGRID_SMTP_PORT ?? "465"),
        secure: true,
        auth: {
            user: process.env.SENDGRID_SMTP_USER,
            pass: process.env.SENDGRID_SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SENDGRID_EMAIL_FROM,
        to: process.env.SENDGRID_ADMIN_EMAIL, // You'll need to set this in your environment variables
        subject: "New User Sign-in Attempt",
        text: `${message}`,
        html: `
          <div style="text-align: center; padding: 50px 0;">
            <p style="font-weight: bold;"> ${message}</p>
          </div>
          `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}