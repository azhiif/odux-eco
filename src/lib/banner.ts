import { db } from './firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

export interface Banner {
  id: string
  title: string
  subtitle: string
  desktop_image_url: string
  mobile_image_url: string
  button_text: string
  button_link: string
  is_active: boolean
  sort_order: number
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const bannersRef = collection(db, 'banners')
    const querySnapshot = await getDocs(bannersRef)
    const banners = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner))
    
    // Sort and filter in memory to avoid index requirements
    return banners
      .filter(b => b.is_active)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching banners:', error)
    }
    return []
  }
}

export async function createBanner(banner: Omit<Banner, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'banners'), banner)
    return { id: docRef.id, ...banner }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating banner:', error)
    }
    throw error
  }
}

export async function updateBanner(id: string, banner: Partial<Banner>) {
  try {
    const bannerRef = doc(db, 'banners', id)
    await updateDoc(bannerRef, banner)
    return { id, ...banner }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating banner:', error)
    }
    throw error
  }
}

export async function deleteBanner(id: string) {
  try {
    await deleteDoc(doc(db, 'banners', id))
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting banner:', error)
    }
    throw error
  }
}
