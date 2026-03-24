'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, ArrowLeft } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_urls: string[]
  stock_quantity: number
  featured: boolean
  dimensions?: string
  material?: string
}

interface Category {
  id: string
  name: string
  description: string
  slug: string
  image_url?: string
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>('name')

  useEffect(() => {
    if (slug) {
      fetchCategory()
    }
  }, [slug])

  useEffect(() => {
    if (category) {
      fetchProducts()
    }
  }, [category?.id, sortBy])

  const fetchCategory = async () => {
    try {
      console.log('Fetching category for slug:', slug)
      const q = query(collection(db, 'categories'), where('slug', '==', slug), where('is_active', '==', true))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        const data = { id: doc.id, ...doc.data() } as Category
        setCategory(data)
        console.log('Category found:', data.name)
      } else {
        console.warn('No active category found for slug:', slug)
        setCategory(null)
      }
    } catch (error) {
      console.error('Error fetching category:', error)
    }
  }

  const fetchProducts = async () => {
    if (!category) return
    setLoading(true)
    try {
      console.log('Fetching all active products for robust counting/filtering...')
      const q = query(
        collection(db, 'products'),
        where('is_active', '==', true)
      )

      const snapshot = await getDocs(q)
      const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product))
      console.log('Total active products loaded globally:', allProducts.length)

      // Filter products for this specific category using robust matching
      const filteredProducts = allProducts.filter(p => {
        const pCatId = String((p as any).category_id || '').trim().toLowerCase()
        const catId = String(category.id || '').trim().toLowerCase()
        return pCatId === catId
      })

      console.log(`Matching for ${category.name} (${category.id}): found ${filteredProducts.length} products`)

      // Apply sorting in memory
      filteredProducts.sort((a, b) => {
        switch (sortBy) {
          case 'price-low': return a.price - b.price
          case 'price-high': return b.price - a.price
          case 'newest': return 0 
          default: return a.name.localeCompare(b.name)
        }
      })

      setProducts(filteredProducts)
      console.log('Products loaded for category:', filteredProducts.length)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    // This will be implemented when we build the cart functionality
    console.log('Add to cart:', productId)
  }

  if (loading && !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist or has been removed.</p>
          <Link href="/categories">
            <Button>Browse All Categories</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-black">Categories</Link>
          <span>/</span>
          <span className="text-black font-medium">{category.name}</span>
        </div>
      </nav>

      {/* Category Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <Link href="/categories">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
            <p className="text-lg text-gray-600 mb-6">{category.description}</p>
            <p className="text-gray-500">
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </p>
          </div>
          
          {category.image_url && (
            <div className="w-full md:w-80 h-80 relative">
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Products</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-8">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl text-gray-400">
                {category.name.charAt(0)}
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No products available</h3>
            <p className="text-gray-600 mb-6">
              We're working on adding amazing products to this category. Check back soon!
            </p>
          </div>
          <div className="space-y-4">
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
            <div className="text-gray-500">
              <p>Need something specific? Contact us:</p>
              <p>WhatsApp: +91 9072270271</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/products/${product.id}`}>
                <div className="relative h-64 bg-gray-200">
                  {product.image_urls[0] && (
                    <Image
                      src={product.image_urls[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                  {product.featured && (
                    <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 text-xs rounded">
                      Featured
                    </div>
                  )}
                  {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                      Only {product.stock_quantity} left
                    </div>
                  )}
                  {product.stock_quantity === 0 && (
                    <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 text-xs rounded">
                      Out of Stock
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold mb-2 hover:text-black transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                {(product.dimensions || product.material) && (
                  <div className="text-xs text-gray-500 mb-3">
                    {product.dimensions && <span>Size: {product.dimensions}</span>}
                    {product.dimensions && product.material && <span> • </span>}
                    {product.material && <span>Material: {product.material}</span>}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-black">
                    {formatPrice(product.price)}
                  </p>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock_quantity === 0}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
