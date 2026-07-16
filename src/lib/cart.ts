import { db, auth } from './firebase'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, writeBatch } from 'firebase/firestore'

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  customerUploads?: string[]
  variantId?: string
  variantSnapshot?: {
    type: string
    size: string
    price: number
    image: string
  }
  products: {
    id: string
    name: string
    price: number
    image_urls: string[]
    stock_quantity: number
    variants?: any[]
  }
}

export async function getCartItems(): Promise<CartItem[]> {
  const user = auth.currentUser
  
  if (!user) {
    if (typeof window === 'undefined') return []
    const { getGuestCart } = await import('./guest-cart')
    const guestCart = getGuestCart()
    
    if (guestCart.length === 0) return []
    
    const items = await Promise.all(guestCart.map(async (data: any) => {
      const productSnap = await getDoc(doc(db, 'products', data.product_id))
      if (!productSnap.exists()) return null
      
      return {
        id: data.id,
        product_id: data.product_id,
        quantity: data.quantity,
        customerUploads: data.customerUploads,
        variantId: data.variantId,
        variantSnapshot: data.variantSnapshot,
        products: { id: productSnap.id, ...productSnap.data() } as any
      } as CartItem
    }))
    
    return items.filter(Boolean) as CartItem[]
  }
  
  // If user is logged in, check if there's a guest cart to migrate
  if (typeof window !== 'undefined') {
    const { getGuestCart, clearGuestCart } = await import('./guest-cart')
    const guestCart = getGuestCart()
    if (guestCart.length > 0) {
      const batch = writeBatch(db)
      guestCart.forEach((item: any) => {
        const newRef = doc(collection(db, 'shopping_cart'))
        const cartData = {
          user_id: user.uid,
          product_id: item.product_id,
          quantity: item.quantity,
          customerUploads: item.customerUploads || [],
          variantId: item.variantId || null,
          variantSnapshot: item.variantSnapshot || null
        }
        batch.set(newRef, cartData)
      })
      await batch.commit()
      clearGuestCart()
    }
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
      customerUploads: data.customerUploads || (data.custom_image ? [data.custom_image] : undefined),
      variantId: data.variantId,
      variantSnapshot: data.variantSnapshot,
      products: { id: productSnap.id, ...productSnap.data() } as any
    } as CartItem
  }))

  return items.filter(Boolean) as CartItem[]
}

export async function addToCart(productId: string, quantity: number = 1, customerUploads?: string[]) {
  const user = auth.currentUser
  
  if (!user) {
    if (typeof window === 'undefined') return { id: '' }
    const { getGuestCart, saveGuestCart } = await import('./guest-cart')
    const guestCart = getGuestCart()
    
    // Check if item already exists
    const existingIndex = guestCart.findIndex((item: any) => item.product_id === productId)
    
    if (existingIndex >= 0) {
      guestCart[existingIndex].quantity += quantity
      if (customerUploads) {
        guestCart[existingIndex].customerUploads = customerUploads
      }
      saveGuestCart(guestCart)
      return { id: guestCart[existingIndex].id }
    } else {
      const newItem = {
        id: `guest_${Date.now()}`,
        product_id: productId,
        quantity,
        customerUploads: customerUploads || []
      }
      guestCart.push(newItem)
      saveGuestCart(guestCart)
      return { id: newItem.id }
    }
  }

  // Check if item already exists in cart to update quantity instead
  const q = query(collection(db, 'shopping_cart'), where('user_id', '==', user.uid), where('product_id', '==', productId))
  const snapshot = await getDocs(q)
  
  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0]
    await updateDoc(doc(db, 'shopping_cart', existingDoc.id), {
      quantity: existingDoc.data().quantity + quantity,
      ...(customerUploads ? { customerUploads: customerUploads } : {})
    })
    return { id: existingDoc.id }
  } else {
    const docRef = await addDoc(collection(db, 'shopping_cart'), {
      user_id: user.uid,
      product_id: productId,
      quantity,
      ...(customerUploads ? { customerUploads: customerUploads } : {})
    })
    return { id: docRef.id }
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const user = auth.currentUser
  
  if (!user) {
    if (typeof window === 'undefined') return
    if (quantity <= 0) return removeFromCart(cartItemId)
    
    const { getGuestCart, saveGuestCart } = await import('./guest-cart')
    const guestCart = getGuestCart()
    const index = guestCart.findIndex((item: any) => item.id === cartItemId)
    if (index >= 0) {
      guestCart[index].quantity = quantity
      saveGuestCart(guestCart)
    }
    return
  }

  if (quantity <= 0) {
    return removeFromCart(cartItemId)
  }

  await updateDoc(doc(db, 'shopping_cart', cartItemId), { quantity })
}

export async function removeFromCart(cartItemId: string) {
  const user = auth.currentUser
  
  if (!user) {
    if (typeof window === 'undefined') return
    const { getGuestCart, saveGuestCart } = await import('./guest-cart')
    const guestCart = getGuestCart()
    const filteredCart = guestCart.filter((item: any) => item.id !== cartItemId)
    saveGuestCart(filteredCart)
    return
  }

  await deleteDoc(doc(db, 'shopping_cart', cartItemId))
}

export async function clearCart() {
  const user = auth.currentUser
  
  if (!user) {
    if (typeof window === 'undefined') return
    const { clearGuestCart } = await import('./guest-cart')
    clearGuestCart()
    return
  }

  const q = query(collection(db, 'shopping_cart'), where('user_id', '==', user.uid))
  const snapshot = await getDocs(q)
  
  const batch = writeBatch(db)
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })
  
  await batch.commit()
}
