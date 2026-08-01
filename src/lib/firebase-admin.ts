import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing in environment variables.')
    }
    
    let credential;
    try {
      // Sometimes Next.js or shell strips the outer curly braces
      let keyToParse = serviceAccountKey.trim();
      if (keyToParse.startsWith('"type"')) {
        keyToParse = '{' + keyToParse + '}';
      }
      credential = JSON.parse(keyToParse);
    } catch (parseError) {
      console.error('Firebase Admin init error: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY.');
      console.error('Raw value length:', serviceAccountKey.length);
      console.error('Raw value starts with:', serviceAccountKey.substring(0, 20));
      throw parseError;
    }

    if (credential.private_key) {
      credential.private_key = credential.private_key.replace(/\\n/g, '\n')
    }
    
    initializeApp({
      credential: cert(credential),
    })
  } catch (error) {
    console.error('Firebase Admin initialization error', error)
  }
}

let db: Firestore | null = null
let auth = null
try {
  if (getApps().length) {
    db = getFirestore()
    auth = getAuth()
  }
} catch (e) {
  console.error("Failed to get Firestore or Auth instance:", e)
}

export const adminDb = db as Firestore
export const adminAuth = auth
