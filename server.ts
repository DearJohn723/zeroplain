import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import multer from "multer";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { initializeApp as initializeClientApp, getApp as getClientApp, getApps as getClientApps } from "firebase/app";
import { getFirestore as getClientFirestore, collection as getClientCollection, getDocs as getClientDocs, doc as getClientDoc, getDoc as getClientGetDoc } from "firebase/firestore";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// --- Firebase Admin Lazy Init ---
let db: any = null;
let bucket: any = null;
let clientDb: any = null;
let activeProjectId = "";
let activeDatabaseId = "(default)";
let clientConfig: any = null;

function getFirebase() {
  if (db && bucket) return { db, bucket, clientDb };

  let projectId = "";
  let storageBucket = "";
  let firestoreDatabaseId = "(default)";

  // 1. Prioritize applet config as it's the source of truth for provisioned projects
  try {
    const paths = [
      path.join(process.cwd(), "firebase-applet-config.json"),
      path.join(__dirname, "firebase-applet-config.json")
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) {
        const appletConfig = JSON.parse(fs.readFileSync(p, "utf8"));
        projectId = appletConfig.projectId;
        storageBucket = appletConfig.storageBucket;
        firestoreDatabaseId = appletConfig.firestoreDatabaseId || "(default)";
        clientConfig = appletConfig;
        console.log(`Loaded Firebase config from ${p}:`, { projectId, firestoreDatabaseId });
        break;
      }
    }
  } catch (e) {
    console.warn("Could not load firebase-applet-config.json in server:", e);
  }

  // 2. Fallback to ENV if still missing
  if (!projectId) {
    projectId = process.env.VITE_FIREBASE_PROJECT_ID || "";
    storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || "";
    firestoreDatabaseId = process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firestoreDatabaseId;
    if (projectId) console.log("Using Firebase config from environment variables:", { projectId, firestoreDatabaseId });
  } else {
    // Even if projectId was found in file, allow ENV to override database ID if file didn't have it
    if (firestoreDatabaseId === "(default)" && process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID) {
      firestoreDatabaseId = process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
    }
  }

  if (!getApps().length && (projectId || process.env.VITE_FIREBASE_PROJECT_ID)) {
    const finalProjectId = projectId || process.env.VITE_FIREBASE_PROJECT_ID;
    try {
      const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (serviceAccountVar) {
        const serviceAccount = JSON.parse(serviceAccountVar);
        initializeApp({
          credential: cert(serviceAccount),
          storageBucket: storageBucket || process.env.VITE_FIREBASE_STORAGE_BUCKET
        });
        console.log("Firebase Admin initialized with Service Account.");
      } else {
        // Use Application Default Credentials or Project ID fallback
        try {
          // Try ADC without explicit projectId first to let it auto-discover from environment
          initializeApp({ 
            credential: applicationDefault(),
            storageBucket: storageBucket || process.env.VITE_FIREBASE_STORAGE_BUCKET
          });
          console.log("Firebase Admin initialized with ADC (auto-discovery).");
        } catch (adcError) {
          try {
            initializeApp({ 
              credential: applicationDefault(),
              projectId: finalProjectId, 
              storageBucket: storageBucket || process.env.VITE_FIREBASE_STORAGE_BUCKET
            });
            console.log("Firebase Admin initialized with ADC and explicit projectId.");
          } catch (adcError2) {
            initializeApp({ 
              projectId: finalProjectId, 
              storageBucket: storageBucket || process.env.VITE_FIREBASE_STORAGE_BUCKET 
            });
            console.log("Firebase Admin initialized with projectId only (fallback).");
          }
        }
      }
    } catch (e: any) {
      console.error("Firebase Admin Init Error:", e);
    }
  }

  try {
    const app = getApps()[0];
    if (app) {
      // Use the specific database ID if provided
      const dbId = firestoreDatabaseId && firestoreDatabaseId !== "(default)" ? firestoreDatabaseId : undefined;
      
      if (dbId) {
        db = getFirestore(app, dbId);
      } else {
        db = getFirestore(app);
      }
      
      bucket = getStorage(app).bucket(storageBucket);
      activeProjectId = projectId || (app.options as any).projectId || "unknown";
      activeDatabaseId = firestoreDatabaseId;
      console.log(`Firestore connected to database: ${firestoreDatabaseId} in project: ${activeProjectId}`);

      // Initialize Client SDK as fallback
      if (clientConfig && !getClientApps().length) {
        const clientApp = initializeClientApp(clientConfig);
        clientDb = getClientFirestore(clientApp, firestoreDatabaseId === "(default)" ? undefined : firestoreDatabaseId);
        console.log("Firebase Client SDK initialized as fallback.");
      }
    } else {
      console.warn("Firebase Admin not initialized: No apps found.");
    }
  } catch (e: any) {
    console.error("Firebase Services Init Error:", e);
  }

  return { db, bucket, clientDb };
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
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT
    }
  });
});

app.get("/api/diag", async (req, res) => {
  const results: any = {};
  try {
    const app = getApps()[0];
    if (!app) throw new Error("No Firebase app found");
    
    // Test Default Database
    try {
      const defaultDb = getFirestore(app);
      const snap = await defaultDb.collection("products").limit(1).get();
      results.defaultDb = { status: "ok", size: snap.size };
    } catch (e: any) {
      results.defaultDb = { status: "error", message: e.message };
    }

    // Test Configured Database
    const { db } = getFirebase();
    if (db) {
      try {
        const snap = await db.collection("products").limit(1).get();
        results.configuredDb = { status: "ok", size: snap.size, id: activeDatabaseId };
      } catch (e: any) {
        results.configuredDb = { status: "error", message: e.message, id: activeDatabaseId };
      }
    }

    res.json({
      activeProjectId,
      activeDatabaseId,
      results
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/data", async (req, res) => {
  // Force no-cache for this endpoint
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const { db } = getFirebase();
    if (!db) throw new Error("Firestore database instance is null after initialization. Please check server logs.");
    
    console.log("Fetching data from Firestore...");
    let productsSnap, newsSnap, siteConfigSnap;
    
    try {
      [productsSnap, newsSnap, siteConfigSnap] = await Promise.all([
        db.collection("products").get(),
        db.collection("news").get(),
        db.doc("siteConfig/main").get()
      ]);
    } catch (firestoreError: any) {
      console.error("Firestore Admin Fetch Error:", firestoreError);
      
      const { clientDb } = getFirebase();
      if (clientDb && firestoreError.message.includes("PERMISSION_DENIED")) {
        console.log("Attempting fallback to Client SDK...");
        try {
          const [pSnap, nSnap, sConfigSnap] = await Promise.all([
            getClientDocs(getClientCollection(clientDb, "products")),
            getClientDocs(getClientCollection(clientDb, "news")),
            getClientGetDoc(getClientDoc(clientDb, "siteConfig", "main"))
          ]);
          
          return res.json({
            products: pSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            news: nSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            siteConfig: sConfigSnap.exists() ? sConfigSnap.data() : null,
            _serverTime: new Date().toISOString(),
            _fallback: true
          });
        } catch (clientError: any) {
          console.error("Client SDK Fallback Error:", clientError);
        }
      }

      if (firestoreError.message.includes("PERMISSION_DENIED")) {
        throw new Error(`PERMISSION_DENIED: The server does not have permission to access Firestore. 
          Project ID: ${activeProjectId || 'unknown'}
          Database ID: ${activeDatabaseId || 'default'}
          1. Ensure the Service Account has 'Cloud Datastore User' role.
          2. Check if the database ID is correct.
          Original error: ${firestoreError.message}`);
      }
      throw firestoreError;
    }

    console.log(`Fetched: ${productsSnap.size} products, ${newsSnap.size} news items`);

    res.json({
      products: productsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })),
      news: newsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })),
      siteConfig: siteConfigSnap.exists ? siteConfigSnap.data() : null,
      _serverTime: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("API /api/data error:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
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
