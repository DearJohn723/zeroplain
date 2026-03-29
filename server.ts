import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import multer from "multer";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";

dotenv.config();

let db: any;
let bucket: any;
let isFirebaseInitialized = false;

function initializeFirebaseAdmin() {
  if (isFirebaseInitialized) return;
  
  const firebaseConfig = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  };

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

  if (!getApps().length && firebaseConfig.projectId) {
    try {
      initializeApp({
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
      });
    } catch (e) {
      console.error("Firebase Admin initializeApp failed:", e);
    }
  }
  
  try {
    db = getFirestore();
    bucket = getStorage().bucket();
    isFirebaseInitialized = true;
  } catch (e) {
    console.error("Firebase Admin services initialization failed:", e);
  }
}

const upload = multer({ storage: multer.memoryStorage() });

export const app = express();
let isAppConfigured = false;

async function configureApp() {
  if (isAppConfigured) return;
  
  app.use(express.json());

  // Test route to verify API is working
  app.get("/api/test", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "API is working on Vercel",
      env: {
        hasSmtpHost: !!process.env.SMTP_HOST,
        hasSmtpUser: !!process.env.SMTP_USER,
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL
      }
    });
  });

  // API route for fetching all site data
  app.get("/api/data", async (req, res) => {
    try {
      initializeFirebaseAdmin();
      if (!db) throw new Error("Database not initialized");
      
      const productsSnap = await db.collection("products").get();
      const newsSnap = await db.collection("news").get();
      const siteConfigSnap = await db.doc("siteConfig/main").get();

      const products = productsSnap.docs.map((d: any) => d.data());
      const news = newsSnap.docs.map((d: any) => d.data());
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
      initializeFirebaseAdmin();
      if (!bucket) throw new Error("Storage not initialized");
      
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
        try {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
          res.status(200).json({ url: publicUrl });
        } catch (e) {
          const [url] = await blob.getSignedUrl({
            action: 'read',
            expires: '03-01-2500',
          });
          res.status(200).json({ url });
        }
      });

      blobStream.end(file.buffer);
    } catch (error: any) {
      console.error("Server upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  });

  // Vite middleware for development (Skip on Vercel production)
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    // Only serve static files if we are NOT on Vercel (Vercel handles this)
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }
  
  isAppConfigured = true;
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
