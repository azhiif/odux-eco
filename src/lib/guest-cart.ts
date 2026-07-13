export const GUEST_CART_KEY = 'odux_guest_cart'

export function getGuestCart() {
  if (typeof window === 'undefined') return []
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY)
    return cart ? JSON.parse(cart) : []
  } catch {
    return []
  }
}

export function saveGuestCart(cart: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
  }
}

export function clearGuestCart() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_CART_KEY)
  }
}
