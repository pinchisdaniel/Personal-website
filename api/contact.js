import nodemailer from "nodemailer";

// The secret is stored in Vercel as RECAPTCHA_SECRET_KEY. Trim it so a stray space or
// newline from copy/paste can't break verification.
function getSecret() {
  return (process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET || "").trim();
}

async function verifyRecaptcha(token) {
  const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: getSecret(), response: token || "" }).toString(),
  });
  return r.json();
}

export default async function handler(req, res) {
  // Health check: GET /api/contact?check=1 asks Google whether the stored secret is valid,
  // using a dummy token. "invalid-input-response" = secret OK, "invalid-input-secret" = secret wrong.
  // Never returns the secret itself.
  if (req.method === "GET" && req.query && req.query.check) {
    const data = await verifyRecaptcha("health-check");
    return res.status(200).json({ secretConfigured: getSecret().length > 0, errorCodes: data["error-codes"] || [] });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { name, email, project, message, token } = req.body;

    const recaptchaData = await verifyRecaptcha(token);

    if (!recaptchaData.success) {
      const codes = recaptchaData["error-codes"] || [];
      console.error("reCAPTCHA failed:", codes, "hostname:", recaptchaData.hostname);
      return res.status(400).json({ message: "reCAPTCHA verification failed.", codes });
    }

    // Gmail needs an App Password here (Google Account > Security > App passwords), not the
    // normal account password. Google shows it as "abcd efgh ijkl mnop"; spaces are stripped.
    const mailUser = (process.env.EMAIL_USER || "").trim();
    const mailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: mailUser, pass: mailPass },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${mailUser}>`,
      to: mailUser,
      replyTo: email,
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
