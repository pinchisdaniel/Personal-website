import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { name, email, project, message, token } = req.body;

    // Verify reCAPTCHA token with Google
    const recaptchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
    });
    const recaptchaData = await recaptchaRes.json();

    if (!recaptchaData.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Message from ${name || "Anonymous"} (${project || "General"})`,
      text: `
Name: ${name}
Email: ${email}
Project: ${project}
Message:
${message}
      `,
    });

    return res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Mailer error:", err);
    return res.status(500).json({ message: "Email failed to send." });
  }
}
