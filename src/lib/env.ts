// Declare global property to avoid TypeScript errors
declare global {
  var _envValidated: boolean | undefined
}

// Environment variable validation
const requiredEnvVars = [
  'RAZORPAY_KEY_ID'
] as const

const optionalEnvVars = [
  'RAZORPAY_KEY_SECRET'
] as const

// Validate environment manually when needed
export function validateEnv() {
  const missing: string[] = []
  const invalid: string[] = []

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    if (!value || value.trim() === '') {
      missing.push(envVar)
    }
  }

  return { missing, invalid }
}
