import { createTransport } from "nodemailer";
export const sendMail = async ({
  from,
  to,
  subject,
  text,
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
}) => {
  try {
    let mailOptions = {
      from,
      to,
      subject,
      text,
    };
    const Transporter = createTransport({
      service: "outlook",
      auth: {
        user: process.env.SERVICE_EMAIL,
        pass: process.env.SERVICE_PASSWORD,
      },
    });
    return await Transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
