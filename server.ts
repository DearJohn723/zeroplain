import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for inquiries
  app.post("/api/inquiry", async (req, res) => {
    const { country, company, email, name, phone, requirement, remarks } = req.body;

    if (!country || !email || !name || !phone || !requirement) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check for SMTP credentials
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, INQUIRY_DESTINATION_EMAIL } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      console.warn("SMTP credentials not configured. Inquiry received but not sent via email.");
      console.log("Inquiry Data:", req.body);
      // In a real app, you'd store this in a database here.
      return res.status(200).json({ 
        success: true, 
        message: "Inquiry received! (Note: SMTP not configured, email not sent)",
        data: req.body 
      });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const mailOptions = {
      from: SMTP_USER,
      to: INQUIRY_DESTINATION_EMAIL || "wesley723@163.com",
      subject: `New Inquiry from ${name} (${country})`,
      text: `
        New Inquiry Details:
        
        Country: ${country}
        Company: ${company || "N/A"}
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Requirement: ${requirement}
        Remarks: ${remarks || "None"}
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: "Inquiry sent successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send inquiry email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
