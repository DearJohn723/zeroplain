import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default to environment variables (Production environment)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)'
};

// In AI Studio development, the environment variables might be empty,
// so we try to load from the applet config if it exists.
// This block will be stripped or ignored in production if variables are set.
if (!firebaseConfig.apiKey) {
  try {
    // @ts-ignore
    const appletConfig = await import('../firebase-applet-config.json');
    Object.assign(firebaseConfig, appletConfig.default);
  } catch (e) {
    // No applet config found, likely production or manual setup
  }
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export default app;
