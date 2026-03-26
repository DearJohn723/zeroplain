import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Default to environment variables (Production environment)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)'
};

// In AI Studio development, the environment variables might be empty,
// so we try to load from the applet config if it exists.
// This block will be stripped or ignored in production if variables are set.
if (!firebaseConfig.apiKey || !firebaseConfig.storageBucket) {
  try {
    // @ts-ignore
    const appletConfig = await import('../firebase-applet-config.json');
    const config = appletConfig.default || appletConfig;
    
    // Only assign if the current value is missing
    if (!firebaseConfig.apiKey) firebaseConfig.apiKey = config.apiKey;
    if (!firebaseConfig.authDomain) firebaseConfig.authDomain = config.authDomain;
    if (!firebaseConfig.projectId) firebaseConfig.projectId = config.projectId;
    if (!firebaseConfig.appId) firebaseConfig.appId = config.appId;
    if (!firebaseConfig.storageBucket) firebaseConfig.storageBucket = config.storageBucket;
    if (!firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === '(default)') {
      firebaseConfig.firestoreDatabaseId = config.firestoreDatabaseId || '(default)';
    }
  } catch (e) {
    // No applet config found, likely production or manual setup
  }
}

// Initialize Firebase SDK only if config is valid
let app;
let db: any;
let auth: any;
let storage: any;

if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
} else {
  console.warn("Firebase configuration is missing. Some features may not work.");
}

export { db, auth, storage };
export default app;
