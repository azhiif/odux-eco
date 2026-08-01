import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let adminInitError: string | null = null

if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing in environment variables.')
    }
    
    let credential;
    try {
      let keyToParse = serviceAccountKey.trim();
      if (keyToParse.startsWith("'") && keyToParse.endsWith("'")) {
        keyToParse = keyToParse.slice(1, -1);
      }
      if (keyToParse.startsWith('"type"')) {
        keyToParse = '{' + keyToParse + '}';
      }
      credential = JSON.parse(keyToParse);
    } catch (parseError: any) {
      console.error('Firebase Admin init error: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.');
      console.error('Raw value length:', serviceAccountKey.length);
      console.error('Raw value starts with:', serviceAccountKey.substring(0, 20));
      throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError?.message}`);
    }

    if (credential.private_key) {
      credential.private_key = credential.private_key.replace(/\\n/g, '\n')
    }
    
    initializeApp({
      credential: cert(credential),
    })
  } catch (error: any) {
    console.error('Firebase Admin initialization error', error)
    adminInitError = error.message
  }
}

let db: Firestore | null = null
try {
  if (getApps().length) {
    db = getFirestore()
  }
} catch (e: any) {
  console.error("Failed to get Firestore instance:", e)
  if (!adminInitError) adminInitError = e.message
}

export const adminDb = db as Firestore
export const firebaseAdminError = adminInitError
