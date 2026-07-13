import { db } from './firebase'
import { collection, query, where, getDocs, doc, getDoc, limit } from 'firebase/firestore'
import { serializeDoc } from './firebase-utils'

export interface ProductVariant {
  id: string
  type: string
  size: string
  price: number
  images: string[]
  stock?: number
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  mrp?: number
  on_sale?: boolean
  image_urls: string[]
  category_id: string
  featured: boolean
  stock_quantity: number
  is_active: boolean
  dimensions?: string
  material?: string
  weight?: number
  sku?: string
  categories?: {
    id: string
    name: string
    slug: string
  }
  variants?: ProductVariant[]
}

export async function getProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products')
    const q = query(productsRef, where('is_active', '==', true))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => serializeDoc(doc) as Product)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getFeaturedProducts(limitCount: number = 8): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products')
    const q = query(
      productsRef,
      where('is_active', '==', true),
      where('featured', '==', true),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => serializeDoc(doc) as Product)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, 'products', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return null
    }
    return serializeDoc(docSnap) as Product
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    return null
  }
}

export async function getRelatedProducts(productId: string, limitCount: number = 4): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products')
    const q = query(
      productsRef,
      where('featured', '==', true),
      limit(limitCount + 1)
    )
    const querySnapshot = await getDocs(q)
    const products = querySnapshot.docs.map(doc => serializeDoc(doc) as Product)
    return products.filter(p => p.id !== productId).slice(0, limitCount)
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}
