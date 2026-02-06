import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USERNAME) {
    console.log('MOCK EMAIL SENDING (Credentials missing):');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    return;
  }

  console.log(`[Email Service] attempting to send email to: ${options.email}`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, 
    greetingTimeout: 10000,   
  });

  const mailOptions = {
    from: `"SurplusLink" <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error(`[Email Service] FAILURE: Could not send email to ${options.email}`);
    console.error(`[Email Service] Error Details: ${error.message}`);
    throw error;
  }
};

export default sendEmail;
