import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";

dotenv.config();

// --- Firebase Admin Lazy Init ---
let db: any = null;
let bucket: any = null;

function getFirebase() {
  if (db && bucket) return { db, bucket };

  let projectId = "";
  let storageBucket = "";
  let firestoreDatabaseId = "(default)";

  // 1. Try to load from applet config
  try {
    // Try multiple paths for Vercel/Cloud Run compatibility
    const paths = [
      path.join(process.cwd(), "firebase-applet-config.json"),
      path.join(__dirname, "..", "firebase-applet-config.json"),
      path.join(__dirname, "firebase-applet-config.json")
    ];
    
    let configFound = false;
    for (const p of paths) {
      if (fs.existsSync(p)) {
        const appletConfig = JSON.parse(fs.readFileSync(p, "utf8"));
        projectId = appletConfig.projectId;
        storageBucket = appletConfig.storageBucket;
        firestoreDatabaseId = appletConfig.firestoreDatabaseId || "(default)";
        console.log(`Loaded Firebase config from ${p}:`, { projectId, firestoreDatabaseId });
        configFound = true;
        break;
      }
    }
  } catch (e) {
    console.warn("Error reading firebase-applet-config.json:", e);
  }

  // 2. Fallback to ENV
  if (!projectId) {
    projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "";
    storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "";
    firestoreDatabaseId = process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || process.env.FIREBASE_FIRESTORE_DATABASE_ID || firestoreDatabaseId;
  }

  if (!getApps().length && projectId) {
    try {
      const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (serviceAccountVar) {
        const serviceAccount = JSON.parse(serviceAccountVar);
        initializeApp({
          credential: cert(serviceAccount),
          storageBucket: storageBucket
        });
        console.log("Firebase Admin initialized with Service Account.");
      } else {
        // Try ADC or just projectId
        try {
          initializeApp({ 
            credential: applicationDefault(),
            projectId, 
            storageBucket 
          });
          console.log("Firebase Admin initialized with ADC.");
        } catch (adcError) {
          initializeApp({ projectId, storageBucket });
          console.log("Firebase Admin initialized with projectId only.");
        }
      }
    } catch (e: any) {
      console.error("Firebase Admin Init Error:", e);
    }
  }

  try {
    const app = getApps()[0];
    if (app) {
      // If we have a database ID, use it. If it fails with PERMISSION_DENIED, 
      // it might be because the service account only has access to (default).
      db = firestoreDatabaseId && firestoreDatabaseId !== "(default)" 
        ? getFirestore(app, firestoreDatabaseId)
        : getFirestore(app);
      bucket = getStorage(app).bucket(storageBucket);
    }
  } catch (e) {
    console.error("Firebase Services Init Error:", e);
  }

  return { db, bucket };
}

// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// --- API Routes ---

app.get("/api/test", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "API is alive on Vercel",
    diagnostics: {
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
      hasFirebaseProjectId: !!(process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID),
      hasFirebaseStorage: !!(process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET),
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || "unknown"
    }
  });
});

app.get("/api/data", async (req, res) => {
  // Force no-cache for this endpoint
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const { db } = getFirebase();
    if (!db) {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
      throw new Error(`Database not available. Project ID: ${projectId || 'MISSING'}. Please check Vercel environment variables.`);
    }
    
    let productsSnap, newsSnap, siteConfigSnap;
    
    try {
      [productsSnap, newsSnap, siteConfigSnap] = await Promise.all([
        db.collection("products").get(),
        db.collection("news").get(),
        db.doc("siteConfig/main").get()
      ]);
    } catch (firestoreError: any) {
      console.error("Firestore Fetch Error:", firestoreError);
      if (firestoreError.message.includes("PERMISSION_DENIED")) {
        throw new Error(`PERMISSION_DENIED: The server does not have permission to access Firestore. 
          1. If on Vercel, ensure FIREBASE_SERVICE_ACCOUNT is set.
          2. Ensure the Service Account has 'Cloud Datastore User' role.
          3. Check if the database ID is correct: ${process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 'using default'}.
          Original error: ${firestoreError.message}`);
      }
      throw firestoreError;
    }

    res.json({
      products: productsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })),
      news: newsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })),
      siteConfig: siteConfigSnap.exists ? siteConfigSnap.data() : null,
      _serverTime: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("API Data Error:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      hint: "Ensure FIREBASE_SERVICE_ACCOUNT is set in Vercel environment variables if running outside Google Cloud."
    });
  }
});

// Use a more flexible route matching for inquiry
app.post(["/api/inquiry", "/api/inquiry/", "/inquiry"], async (req, res) => {
  const { country, email, name, phone, requirement } = req.body;
  if (!country || !email || !name || !phone || !requirement) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, INQUIRY_DESTINATION_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({ 
      error: "SMTP_NOT_CONFIGURED", 
      message: "Server environment variables for SMTP are missing. Please check Vercel settings." 
    });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "465"),
    secure: (SMTP_PORT || "465") === "465",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: SMTP_USER,
      to: INQUIRY_DESTINATION_EMAIL || "wesley723@163.com",
      subject: `[Product Inquiry] From ${name} (${country})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #e11d48;">New Product Inquiry</h2>
          <p><strong>Product/Requirement:</strong> ${requirement}</p>
          <hr />
          <p><strong>Contact Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Company:</strong> ${req.body.company || 'N/A'}</p>
          <p><strong>Country:</strong> ${country}</p>
          <hr />
          <p><strong>Additional Remarks:</strong></p>
          <p style="background: #f9f9f9; padding: 10px;">${req.body.remarks || 'No remarks provided.'}</p>
        </div>
      `,
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

// Explicitly handle 404 for API
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "API Route Not Found", path: req.path, method: req.method });
});

export default app;
