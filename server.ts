import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import multer from "multer";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";

dotenv.config();

// --- Firebase Admin Lazy Init ---
let db: any = null;
let bucket: any = null;

function getFirebase() {
  if (db && bucket) return { db, bucket };

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET;

  if (!getApps().length && projectId) {
    try {
      // In Vercel, we usually don't have the service account file unless provided via ENV
      const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (serviceAccountVar) {
        const serviceAccount = JSON.parse(serviceAccountVar);
        initializeApp({
          credential: cert(serviceAccount),
          storageBucket: storageBucket
        });
      } else {
        // Fallback to default or just project ID (might fail without credentials)
        initializeApp({ projectId, storageBucket });
      }
    } catch (e) {
      console.error("Firebase Admin Init Error:", e);
    }
  }

  try {
    db = getFirestore();
    bucket = getStorage().bucket();
  } catch (e) {
    console.error("Firebase Services Init Error:", e);
  }

  return { db, bucket };
}

// --- Express App Setup ---
const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// --- API Routes ---

app.get("/api/test", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Minimal API is alive",
    env: {
      hasSmtp: !!process.env.SMTP_HOST,
      isVercel: !!process.env.VERCEL,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    }
  });
});

app.get("/api/data", async (req, res) => {
  try {
    const { db } = getFirebase();
    if (!db) throw new Error("Database not available");
    
    const [productsSnap, newsSnap, siteConfigSnap] = await Promise.all([
      db.collection("products").get(),
      db.collection("news").get(),
      db.doc("siteConfig/main").get()
    ]);

    res.json({
      products: productsSnap.docs.map((d: any) => d.data()),
      news: newsSnap.docs.map((d: any) => d.data()),
      siteConfig: siteConfigSnap.exists ? siteConfigSnap.data() : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inquiry", async (req, res) => {
  const { country, email, name, phone, requirement } = req.body;
  if (!country || !email || !name || !phone || !requirement) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, INQUIRY_DESTINATION_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return res.json({ success: true, message: "SMTP not configured, but inquiry received." });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "465"),
    secure: SMTP_PORT === "465",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: SMTP_USER,
      to: INQUIRY_DESTINATION_EMAIL || "john@greatidea.tw",
      subject: `Inquiry from ${name}`,
      text: JSON.stringify(req.body, null, 2),
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const { bucket } = getFirebase();
    if (!bucket || !req.file) throw new Error("Upload unavailable");

    const fileName = `${Date.now()}_${req.file.originalname}`;
    const blob = bucket.file(`uploads/${fileName}`);
    const blobStream = blob.createWriteStream({ metadata: { contentType: req.file.mimetype } });

    blobStream.on("error", (err) => res.status(500).json({ error: err.message }));
    blobStream.on("finish", async () => {
      const [url] = await blob.getSignedUrl({ action: 'read', expires: '03-01-2500' });
      res.json({ url });
    });
    blobStream.end(req.file.buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Development / Production Logic ---

async function startLocalServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    // Only load Vite in local dev
    try {
      const { createServer } = await import("vite");
      const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
      app.listen(3000, "0.0.0.0", () => console.log("Dev server: http://localhost:3000"));
    } catch (e) {
      console.error("Vite startup error:", e);
    }
  } else if (!process.env.VERCEL) {
    // Standard production server (not Vercel)
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
    app.listen(3000, "0.0.0.0", () => console.log("Prod server: http://localhost:3000"));
  }
}

// Only call startup if not in Vercel
if (!process.env.VERCEL) {
  startLocalServer();
}

export default app;
