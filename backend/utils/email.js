import { Resend } from 'resend';

const sendEmail = async (options) => {
  // Mock mode for tests or missing API key
  if (process.env.NODE_ENV === 'test' || !process.env.RESEND_API_KEY) {
    console.log(`[Email Mock] ${process.env.NODE_ENV === 'test' ? 'Test Mode' : 'Missing Credentials'} - Skipping real send to: ${options.email}`);
    return { mock: true, to: options.email, subject: options.subject };
  }

  console.log(`[Resend Service] attempting to send email to: ${options.email}`);

  // Initialize Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  const mailOptions = {
    from: 'SurplusLink <onboarding@resend.dev>', // Keep this as onboarding@resend.dev during testing phase
    to: typeof options.email === 'string' ? [options.email] : options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const { data, error } = await resend.emails.send(mailOptions);

    if (error) {
      console.error(`[Resend Service] Error Payload:`, error);
      throw new Error(error.message);
    }

    console.log(`[Resend Service] SUCCESS: Message sent to ${options.email} (ID: ${data?.id})`);
    return data;
  } catch (error) {
    console.error(`[Resend Service] FAILURE: Could not send email to ${options.email}`);
    console.error(`[Resend Service] Error Message: ${error.message}`);
    throw error;
  }
};

export default sendEmail;
