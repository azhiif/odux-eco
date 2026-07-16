'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Filter, ShoppingBag, Star, Camera, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Product } from '@/lib/products'
import { Category } from '@/lib/categories'

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

interface ProductsClientProps {
  initialProducts: Product[]
  categories: Category[]
}

export default function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [currentPage, setCurrentPage] = useState(1)

  // Debug: Log first product to check MRP and on_sale values
  useEffect(() => {
    if (initialProducts.length > 0) {
      console.log('First product data:', initialProducts[0])
    }
  }, [initialProducts])

  const productsPerPage = 12

  // Filter and Sort in memory since we have all active products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts]

    // Filter
    if (selectedCategory) {
      result = result.filter(p => p.category_id === selectedCategory)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price
        case 'price-high': return b.price - a.price
        case 'name':
        default: return a.name.localeCompare(b.name)
      }
    })

    return result
  }, [initialProducts, selectedCategory, sortBy])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage)
  
  const currentProducts = useMemo(() => {
    const from = (currentPage - 1) * productsPerPage
    const to = from + productsPerPage
    return filteredAndSortedProducts.slice(from, to)
  }, [filteredAndSortedProducts, currentPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, sortBy])

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    // Implement cart logic
    console.log('Add to cart:', productId)
  }

  return (
    <div className="overflow-hidden">
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
                onChange={(e) => setSelectedCategory(e.target.value)}
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
        {currentProducts.length === 0 ? (
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
              {currentProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants} className="h-full">
                  <Link href={`/products/${product.id}`} className="block group h-full">
                    <article className="premium-card bg-white h-full flex flex-col group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300 border border-transparent group-hover:border-gray-100 overflow-visible">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[22px] bg-gray-50">
                        {(product.image_urls?.[0] || product.variants?.[0]?.images?.[0]) ? (
                          <Image
                            src={product.image_urls?.[0] || product.variants?.[0]?.images?.[0] || ''}
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
                        {product.on_sale && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg z-10">
                            Sale
                          </div>
                        )}
                        {!product.on_sale && product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                          <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg z-10">
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
                        
                        <h3 className="text-heading-3 text-foreground mb-2 group-hover:text-brand-pink transition-colors line-clamp-2 capitalize">
                          {product.name}
                        </h3>
                        
                        <p className="text-body-small text-muted-foreground mb-4 line-clamp-2 flex-1">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <div className="flex flex-col">
                            {product.mrp && product.mrp > product.price ? (
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold text-gray-400 line-through">
                                  {formatPrice(product.mrp)}
                                </span>
                                <span className="font-heading text-xl font-bold text-foreground">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                            ) : (
                              <p className="font-heading text-xl font-bold text-foreground">
                                {formatPrice(product.price)}
                              </p>
                            )}
                          </div>
                          {/* Mobile quick add button */}
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

            {/* Pagination */}
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
