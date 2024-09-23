import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "57c8583b747122",
          pass: "4b33a8fb24fe54"
        }
      });
  const mailoptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transport.sendMail(mailoptions);
};
