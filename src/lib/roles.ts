import { db, auth } from './firebase'
import { doc, getDoc, setDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  is_admin: boolean
  is_superadmin: boolean
  created_at: string
  updated_at?: string
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const profileRef = doc(db, 'user_profiles', uid)
    const profileSnap = await getDoc(profileRef)
    
    if (profileSnap.exists()) {
      return profileSnap.data() as UserProfile
    }
    return null
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching user profile:', error)
    }
    return null
  }
}

export async function createSuperAdminProfile(uid: string, email: string, displayName?: string): Promise<void> {
  try {
    const profileRef = doc(db, 'user_profiles', uid)
    const names = displayName?.split(' ') || ['', '']
    
    await setDoc(profileRef, {
      uid,
      email,
      first_name: names[0] || '',
      last_name: names.slice(1).join(' ') || '',
      is_admin: true,
      is_superadmin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating superadmin profile:', error)
    }
    throw error
  }
}

export async function makeUserSuperAdmin(uid: string): Promise<void> {
  try {
    const profileRef = doc(db, 'user_profiles', uid)
    await updateDoc(profileRef, {
      is_superadmin: true,
      is_admin: true,
      updated_at: new Date().toISOString()
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error making user superadmin:', error)
    }
    throw error
  }
}

export async function removeSuperAdminRole(uid: string): Promise<void> {
  try {
    const profileRef = doc(db, 'user_profiles', uid)
    await updateDoc(profileRef, {
      is_superadmin: false,
      updated_at: new Date().toISOString()
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error removing superadmin role:', error)
    }
    throw error
  }
}

export async function getAllSuperAdmins(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'user_profiles'), where('is_superadmin', '==', true))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data() as UserProfile)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching superadmins:', error)
    }
    return []
  }
}

export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  const user = auth.currentUser
  if (!user) return false
  
  const profile = await getUserProfile(user.uid)
  return profile?.is_superadmin || false
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = auth.currentUser
  if (!user) return false
  
  const profile = await getUserProfile(user.uid)
  return profile?.is_admin || false
}
