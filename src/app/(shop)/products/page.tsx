'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { formatPrice } from '@/lib/utils'
import { Filter, ShoppingBag, Star, Camera, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 }
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

      // Sort client-side
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

      // Pagination
      const from = (currentPage - 1) * productsPerPage
      const to = from + productsPerPage
      setProducts(data.slice(from, to))

    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    // Implement cart logic
    console.log('Add to cart:', productId)
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 border-4 border-t-brand-pink border-r-brand-orange border-b-brand-purple border-l-brand-blue rounded-full mx-auto mb-6"
          />
          <p className="text-brand-purple font-heading text-xl animate-pulse">Finding the perfect gifts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-16 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0 pointer-events-none"></div>
      <div className="absolute top-96 left-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0 pointer-events-none"></div>

      <div className="container-premium relative z-10">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 md:mb-16"
        >
          <h1 className="text-display text-foreground mb-4">
            Our <span className="text-brand-pink">Collection</span>
          </h1>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Browse through our magical assortment of custom frames, gifts, and masterpieces.
          </p>
        </motion.div>

        {/* Filters & Sorting */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 md:p-6 rounded-[2rem] mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-brand-pink/10 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 flex-1">
            <div className="relative flex-1 max-w-xs">
              <select
                className="w-full appearance-none px-5 py-3 pr-10 border-2 border-gray-100 rounded-full focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-foreground font-medium transition-all"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">✨ All Magic Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-pink pointer-events-none w-5 h-5" />
            </div>

            <div className="relative flex-1 max-w-xs">
              <select
                className="w-full appearance-none px-5 py-3 pr-10 border-2 border-gray-100 rounded-full focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 bg-gray-50 text-foreground font-medium transition-all"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Magic</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-purple pointer-events-none w-5 h-5" />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('')
              setSortBy('name')
              setCurrentPage(1)
            }}
            className="w-full md:w-auto rounded-full border-2 border-gray-200 text-gray-500 hover:text-brand-pink hover:border-brand-pink hover:bg-pink-50"
          >
            Clear Filters <Filter className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="text-center py-20 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-gray-200"
          >
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-brand-pink opacity-50" />
            </div>
            <h3 className="text-heading-3 text-foreground mb-2">No masterpieces found</h3>
            <p className="text-muted-foreground mb-6">Try tweaking your magical filters to find what you need.</p>
            <Button onClick={() => { setSelectedCategory(''); setCurrentPage(1); }} className="btn-premium-gold">
              Show All Gifts
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mb-12"
            >
              {products.map((product) => (
                <motion.div key={product.id} variants={itemVariants} className="h-full">
                  <Link href={`/products/${product.id}`} className="block group h-full">
                    <article className="premium-card bg-white h-full flex flex-col group-hover:-translate-y-2 transition-all duration-400 overflow-visible">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[22px] bg-gray-50">
                        {product.image_urls[0] ? (
                          <Image
                            src={product.image_urls[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-12 h-12 text-brand-pink/30" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        {product.featured && (
                          <div className="absolute top-4 left-4 bg-brand-orange text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center z-10">
                            <Star className="w-3 h-3 mr-1" fill="currentColor" /> Featured
                          </div>
                        )}
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg z-10">
                            Only {product.stock_quantity} left
                          </div>
                        )}
                        {product.stock_quantity === 0 && (
                          <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg z-10">
                            Sold Out
                          </div>
                        )}

                        {/* Quick Add Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-center bg-gradient-to-t from-black/50 to-transparent z-20">
                          <Button 
                            className="btn-premium-gold w-full max-w-[200px] shadow-2xl"
                            onClick={(e) => handleAddToCart(product.id, e)}
                            disabled={product.stock_quantity === 0}
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" /> 
                            {product.stock_quantity === 0 ? 'Out of Stock' : 'Quick Add'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col z-10 bg-white rounded-b-[22px]">
                        <div className="mb-2">
                          {product.categories && (
                            <span className="text-xs font-bold text-brand-purple uppercase tracking-wider bg-purple-50 px-2 py-1 rounded-md">
                              {product.categories.name}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-heading-3 text-foreground mb-2 group-hover:text-brand-pink transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        
                        <p className="text-body-small text-muted-foreground mb-4 line-clamp-2 flex-1">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <p className="font-heading text-xl font-bold text-foreground">
                            {formatPrice(product.price)}
                          </p>
                          {/* Mobile quick add button - only shows if out of stock or mobile */}
                          <button 
                            className="md:hidden w-10 h-10 rounded-full bg-pink-50 text-brand-pink flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors"
                            onClick={(e) => handleAddToCart(product.id, e)}
                            disabled={product.stock_quantity === 0}
                          >
                            <ShoppingBag className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Bubbly Pagination */}
            {totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8"
              >
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`rounded-full px-8 py-6 ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'btn-outline-premium'}`}
                >
                  Previous
                </Button>
                
                <span className="text-brand-purple font-heading font-bold text-lg px-6 py-3 bg-purple-50 rounded-full">
                  {currentPage} <span className="text-gray-400 font-normal mx-1">of</span> {totalPages}
                </span>
                
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`rounded-full px-8 py-6 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'btn-premium bg-brand-pink text-white hover:bg-[#f43f5e]'}`}
                >
                  Next Magic
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
