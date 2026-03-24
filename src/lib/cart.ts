import { db, auth } from './firebase'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, writeBatch } from 'firebase/firestore'

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  custom_image?: string
  products: {
    id: string
    name: string
    price: number
    image_urls: string[]
    stock_quantity: number
  }
}

export async function getCartItems(): Promise<CartItem[]> {
  const user = auth.currentUser
  
  if (!user) {
    return []
  }

  const q = query(collection(db, 'shopping_cart'), where('user_id', '==', user.uid))
  const snapshot = await getDocs(q)
  
  const items = await Promise.all(snapshot.docs.map(async (cartDoc) => {
    const data = cartDoc.data()
    const productSnap = await getDoc(doc(db, 'products', data.product_id))
    
    // If product doesn't exist anymore, we might want to skip or handle it
    if (!productSnap.exists()) return null
    
    return {
      id: cartDoc.id,
      product_id: data.product_id,
      quantity: data.quantity,
      custom_image: data.custom_image,
      products: { id: productSnap.id, ...productSnap.data() } as any
    } as CartItem
  }))

  return items.filter(Boolean) as CartItem[]
}

export async function addToCart(productId: string, quantity: number = 1, customImage?: string) {
  const user = auth.currentUser
  
  if (!user) {
    throw new Error('Please login to add items to cart')
  }

  // Check if item already exists in cart to update quantity instead
  const q = query(collection(db, 'shopping_cart'), where('user_id', '==', user.uid), where('product_id', '==', productId))
  const snapshot = await getDocs(q)
  
  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0]
    await updateDoc(doc(db, 'shopping_cart', existingDoc.id), {
      quantity: existingDoc.data().quantity + quantity,
      ...(customImage ? { custom_image: customImage } : {})
    })
    return { id: existingDoc.id }
  } else {
    const docRef = await addDoc(collection(db, 'shopping_cart'), {
      user_id: user.uid,
      product_id: productId,
      quantity,
      ...(customImage ? { custom_image: customImage } : {})
    })
    return { id: docRef.id }
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const user = auth.currentUser
  
  if (!user) {
    throw new Error('Please login to update cart')
  }

  if (quantity <= 0) {
    return removeFromCart(cartItemId)
  }

  await updateDoc(doc(db, 'shopping_cart', cartItemId), { quantity })
}

export async function removeFromCart(cartItemId: string) {
  const user = auth.currentUser
  
  if (!user) {
    throw new Error('Please login to remove items from cart')
  }

  await deleteDoc(doc(db, 'shopping_cart', cartItemId))
}

export async function clearCart() {
  const user = auth.currentUser
  
  if (!user) {
    throw new Error('Please login to clear cart')
  }

  const q = query(collection(db, 'shopping_cart'), where('user_id', '==', user.uid))
  const snapshot = await getDocs(q)
  
  const batch = writeBatch(db)
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })
  
  await batch.commit()
}
