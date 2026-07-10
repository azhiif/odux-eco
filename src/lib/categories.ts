import { db } from './firebase'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { serializeDoc } from './firebase-utils'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  is_active: boolean
  sort_order?: number
  product_count?: number
}

export async function getCategories(limitCount?: number): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, 'categories')
    const q = limitCount 
      ? query(categoriesRef, where('is_active', '==', true), limit(limitCount))
      : query(categoriesRef, where('is_active', '==', true))
      
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => serializeDoc(doc) as Category)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const categoriesRef = collection(db, 'categories')
    const q = query(categoriesRef, where('slug', '==', slug), limit(1))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    return serializeDoc(querySnapshot.docs[0]) as Category
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error)
    return null
  }
}
