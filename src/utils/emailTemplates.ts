// ~/utils/emailTemplates.ts

export function getVerificationEmailTemplate(url: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background-color: #FCA311; color: #000; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Verify Your Email</h1>
        <p>Thank you for signing up. Please click the button below to verify your email address:</p>
        <p><a href="${url}" class="button">Verify Email</a></p>
        <p>If you didn't request this email, you can safely ignore it.</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    </body>
    </html>
  `;
}