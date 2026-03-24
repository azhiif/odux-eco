'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { formatPrice } from '@/lib/utils'
import { Filter, ShoppingCart } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_urls: string[]
  category_id: string
  featured: boolean
  stock_quantity: number
  created_at?: string
  categories?: {
    id: string
    name: string
    slug: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const productsPerPage = 12

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [selectedCategory, sortBy, currentPage])

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), where('is_active', '==', true))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category))
      data.sort((a, b) => a.name.localeCompare(b.name))
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const productsRef = collection(db, 'products')
      let q = query(productsRef, where('is_active', '==', true))

      if (selectedCategory) {
        q = query(productsRef, where('is_active', '==', true), where('category_id', '==', selectedCategory))
      }

      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))

      // Sort client-side to avoid complex Firestore composite indexes
      data.sort((a, b) => {
        switch (sortBy) {
          case 'price-low': return a.price - b.price
          case 'price-high': return b.price - a.price
          case 'newest': 
            const aTime = a.created_at || ''
            const bTime = b.created_at || ''
            return bTime.localeCompare(aTime)
          case 'name':
          default: return a.name.localeCompare(b.name)
        }
      })

      setTotalPages(Math.ceil(data.length / productsPerPage))

      // Client-side pagination
      const from = (currentPage - 1) * productsPerPage
      const to = from + productsPerPage
      setProducts(data.slice(from, to))

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

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 bg-background">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">All Products</h1>
        <p className="text-muted-foreground">Discover our complete collection of custom art pieces</p>
      </div>

      {/* Filters */}
      <div className="bg-muted p-6 rounded-lg mb-8 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <select
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground bg-background text-foreground"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground bg-background text-foreground"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('')
              setSortBy('name')
              setCurrentPage(1)
            }}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
          <Button
            onClick={() => {
              setSelectedCategory('')
              setCurrentPage(1)
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
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
                  <div className="mb-2">
                    {product.categories && (
                      <Link href={`/categories/${product.categories.slug}`}>
                        <span className="text-xs text-gray-500 hover:text-black">
                          {product.categories.name}
                        </span>
                      </Link>
                    )}
                  </div>
                  
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-lg font-semibold mb-2 hover:text-black transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
