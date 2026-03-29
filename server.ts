import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import multer from "multer";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";

dotenv.config();

// Initialize Firebase Admin
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
};

// Fallback to applet config
if (!firebaseConfig.projectId) {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      firebaseConfig.projectId = config.projectId;
      firebaseConfig.storageBucket = config.storageBucket;
    }
  } catch (e) {
    console.error("Error loading firebase-applet-config.json:", e);
  }
}

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();

const upload = multer({ storage: multer.memoryStorage() });

export const app = express();

async function configureApp() {
  app.use(express.json());

  // API route for fetching all site data (Proxy to Firestore to avoid blocking in China)
  app.get("/api/data", async (req, res) => {
    try {
      const productsSnap = await db.collection("products").get();
      const newsSnap = await db.collection("news").get();
      const siteConfigSnap = await db.doc("siteConfig/main").get();

      const products = productsSnap.docs.map(d => d.data());
      const news = newsSnap.docs.map(d => d.data());
      const siteConfig = siteConfigSnap.exists ? siteConfigSnap.data() : null;

      res.status(200).json({ products, news, siteConfig });
    } catch (error: any) {
      console.error("Server data fetch error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch data" });
    }
  });

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
      to: INQUIRY_DESTINATION_EMAIL || "john@greatidea.tw",
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
      console.log(`Attempting to send inquiry email via ${SMTP_HOST}:${SMTP_PORT}...`);
      await transporter.sendMail(mailOptions);
      console.log("Inquiry email sent successfully.");
      res.status(200).json({ success: true, message: "Inquiry sent successfully!" });
    } catch (error: any) {
      console.error("SMTP Error Details:", {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        stack: error.stack
      });
      res.status(500).json({ 
        error: "Failed to send inquiry email", 
        details: error.message 
      });
    }
  });

  // API route for file uploads (Proxy to Firebase Storage to avoid CORS)
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      const folder = req.body.folder || "general";
      
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileName = `${Date.now()}_${file.originalname}`;
      const filePath = `${folder}/${fileName}`;
      const blob = bucket.file(filePath);
      
      console.log(`Server uploading ${fileName} to ${folder} via Admin SDK...`);
      
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
        resumable: false,
      });

      blobStream.on("error", (err) => {
        console.error("Blob stream error:", err);
        res.status(500).json({ error: err.message });
      });

      blobStream.on("finish", async () => {
        // Make the file public or get a signed URL
        // For simplicity in this environment, we'll use a public URL if possible
        // or a long-lived signed URL
        try {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
          console.log(`Upload successful: ${publicUrl}`);
          res.status(200).json({ url: publicUrl });
        } catch (e) {
          // If makePublic fails (e.g. bucket settings), use a signed URL
          const [url] = await blob.getSignedUrl({
            action: 'read',
            expires: '03-01-2500', // Far future
          });
          console.log(`Upload successful (signed URL): ${url}`);
          res.status(200).json({ url });
        }
      });

      blobStream.end(file.buffer);
    } catch (error: any) {
      console.error("Server upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload file" });
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
}

export async function getApp() {
  await configureApp();
  return app;
}

async function startServer() {
  const appInstance = await getApp();
  const PORT = 3000;
  appInstance.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if we're not in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}
