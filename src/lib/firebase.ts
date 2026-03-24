// Firebase configuration for Authentication, Firestore, and Storage
import { initializeApp, getApps, getApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Log config on initialization (masked for security)
if (typeof window !== 'undefined') {
  console.log('Firebase Initializing with Project:', firebaseConfig.projectId)
  console.log('Firebase App ID check:', firebaseConfig.appId?.substring(0, 10) + '...')
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Extend Window interface for TypeScript
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

// Phone authentication service
export class PhoneAuthService {
  // Clear any existing reCAPTCHA instance
  private clearRecaptcha() {
    if (typeof window !== 'undefined' && window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
        console.log('Existing reCAPTCHA cleared')
      } catch (e) {
        console.warn('Error clearing reCAPTCHA:', e)
        window.recaptchaVerifier = null
      }
    }
  }

  // Send OTP with fresh reCAPTCHA v2
  async sendOTP(phoneNumber: string, containerId: string = 'recaptcha-container') {
    if (typeof window === 'undefined') {
      throw new Error('Phone auth must be called from client side')
    }

    try {
      console.log('Starting fresh OTP flow for:', phoneNumber)

      // 1. Force standard reCAPTCHA v2 (bypass Enterprise)
      if (auth.settings) {
        (auth as any).settings.appVerificationDisabledForTesting = false
      }

      // 2. ALWAYS clear previous instance first
      this.clearRecaptcha()

      // 3. Ensure container exists and is clean
      const container = document.getElementById(containerId)
      if (!container) {
        throw new Error(`reCAPTCHA container #${containerId} not found in DOM`)
      }
      container.innerHTML = '' // Critical: prevent duplicate UI elements

      // 4. Create a fresh instance (CORRECT order: auth first)
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved')
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired, clearing...')
          this.clearRecaptcha()
        }
      })

      // 5. Explicitly render the verifier before use
      console.log('Explicitly rendering reCAPTCHA...')
      await window.recaptchaVerifier.render()

      // 6. Use this fresh rendered instance immediately
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
      console.log('OTP sent successfully with fresh reCAPTCHA v2')
      return result
      
    } catch (error: any) {
      console.error('Send OTP Error Details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        configProjectId: firebaseConfig.projectId,
        configAuthDomain: firebaseConfig.authDomain
      })
      
      // If any error occurs, clear for safety
      this.clearRecaptcha()
      
      throw error
    }
  }

  // Verify OTP
  async verifyOTP(verificationCode: string, confirmationResult: any) {
    try {
      const result = await confirmationResult.confirm(verificationCode)
      return result.user
    } catch (error: any) {
      console.error('OTP Verification Error:', error)
      throw error
    }
  }

  // Google Sign-in
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      return result.user
    } catch (error: any) {
      console.error('Google Sign-in Error:', error)
      throw error
    }
  }

  // Email Sign-up
  async signUpWithEmail(email: string, password: string, name?: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      if (name) {
        await updateProfile(result.user, { displayName: name })
      }
      return result.user
    } catch (error: any) {
      console.error('Email Sign-up Error:', error)
      throw error
    }
  }

  // Email Sign-in
  async signInWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error: any) {
      console.error('Email Sign-in Error:', error)
      throw error
    }
  }

  // Password Reset
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error('Password Reset Error:', error)
      throw error
    }
  }
}

export const phoneAuthService = new PhoneAuthService()
