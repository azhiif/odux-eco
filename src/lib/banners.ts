import { db } from './firebase'
import { collection, getDocs } from 'firebase/firestore'
import { serializeDoc } from './firebase-utils'

export interface Banner {
  id: string
  title?: string
  subtitle?: string
  desktop_image_url: string
  mobile_image_url: string
  button_text?: string
  button_link?: string
  is_active: boolean
  sort_order: number
}

export async function getActiveBanners(): Promise<Banner[]> {
  try {
    const bannersRef = collection(db, 'banners')
    const querySnapshot = await getDocs(bannersRef)
    const banners = querySnapshot.docs.map(doc => serializeDoc(doc) as Banner)
    
    // Sort and filter in memory to avoid index requirements
    return banners
      .filter(b => b.is_active)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  } catch (error) {
    console.error('Error fetching banners:', error)
    return []
  }
}
