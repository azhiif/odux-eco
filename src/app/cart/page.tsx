'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getCartItems, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart, CartItem } from '@/lib/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react'

// Types imported from lib/cart

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const items = await getCartItems()
      setCartItems(items)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating(cartItemId)
    try {
      await apiUpdateCartItem(cartItemId, newQuantity)

      setCartItems(items =>
        items.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (cartItemId: string) => {
    setUpdating(cartItemId)
    try {
      await apiRemoveFromCart(cartItemId)
      setCartItems(items => items.filter(item => item.id !== cartItemId))
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setUpdating(null)
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (item.products.price * item.quantity)
  }, 0)

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-background">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Link>
        <h1 className="text-3xl font-bold mb-2 text-foreground">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products">
            <Button className="bg-foreground text-background hover:bg-muted">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link href={`/products/${item.products.id}`}>
                    <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.custom_image || item.products.image_urls[0]}
                        alt={item.products.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                      {item.custom_image && (
                        <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm text-white rounded-full p-1" title="Personalized Photo">
                          <Plus className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <Link href={`/products/${item.products.id}`}>
                        <h3 className="font-semibold hover:text-black transition-colors">
                          {item.products.name}
                        </h3>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold">{formatPrice(item.products.price)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id || item.quantity <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id || item.quantity >= item.products.stock_quantity}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right mt-2">
                      <p className="text-lg font-bold">
                        {formatPrice(item.products.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-6">
                <p>Free shipping on orders above ₹999</p>
              </div>

              <Button
                className="w-full bg-black text-white hover:bg-gray-800"
                size="lg"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <div className="mt-4 text-center">
                <Link href="/products" className="text-sm text-gray-600 hover:text-black">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
