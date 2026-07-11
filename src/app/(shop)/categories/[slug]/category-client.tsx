'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, ChevronLeft, Star, Camera, Grid3X3, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '@/lib/products'
import { Category } from '@/lib/categories'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 }
}

interface CategoryClientProps {
  category: Category
  initialProducts: Product[]
}

export default function CategoryClient({ category, initialProducts }: CategoryClientProps) {
  const [sortBy, setSortBy] = useState<string>('name')

  const products = useMemo(() => {
    const sorted = [...initialProducts]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price
        case 'price-high': return b.price - a.price
        case 'newest': return 0 
        default: return a.name.localeCompare(b.name)
      }
    })
    return sorted
  }, [initialProducts, sortBy])

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Add to cart:', productId)
  }

  return (
    <div className="container-premium relative z-10">
      
      {/* Navigation & Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 md:mb-10">
        <Link href="/categories" className="inline-flex items-center text-gray-600 hover:text-brand-pink group transition-colors">
          <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center mr-3 group-hover:bg-brand-pink group-hover:text-white transition-all duration-300">
            <ChevronLeft className="h-5 w-5" />
          </div>
          <span className="font-heading text-lg font-bold">Categories</span>
        </Link>
      </motion.div>

      {/* Category Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-brand-purple/5 border border-pink-50 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-50 to-transparent rounded-bl-full z-0"></div>
          
          <div className="flex-1 relative z-10 text-center md:text-left">
            <h1 className="text-display text-foreground mb-4">{category.name}</h1>
            <p className="text-body-large text-gray-600 mb-6 max-w-xl">{category.description}</p>
            <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-brand-purple rounded-full font-bold">
              <Grid3X3 className="w-4 h-4 mr-2" /> {products.length} {products.length === 1 ? 'Magical Item' : 'Magical Items'}
            </div>
          </div>
          
          {category.image_url && (
            <div className="w-48 h-48 md:w-64 md:h-64 relative shrink-0 rounded-full overflow-hidden border-8 border-white shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500 z-10">
              <Image src={category.image_url} alt={category.name} fill sizes="256px" className="object-cover" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-heading-2 text-foreground">Explore Collection</h2>
        <div className="relative w-full sm:w-auto max-w-xs">
          <select
            className="w-full appearance-none px-5 py-3 pr-10 border-2 border-gray-100 rounded-full focus:outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 bg-white text-gray-700 font-bold transition-all shadow-sm"
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

      {/* Products Grid */}
      {products.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-gray-200">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10 text-brand-pink opacity-50" />
          </div>
          <h3 className="text-heading-3 text-foreground mb-2">No items yet</h3>
          <p className="text-muted-foreground mb-6">We're crafting new masterpieces for this category.</p>
          <Link href="/products">
            <Button className="btn-premium-gold">Browse All Gifts</Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants} className="h-full">
              <Link href={`/products/${product.id}`} className="block group h-full">
                <article className="premium-card bg-white h-full flex flex-col group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300 border border-transparent group-hover:border-gray-100 overflow-visible">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-t-[22px] bg-gray-50">
                    {product.image_urls?.[0] ? (
                      <Image src={product.image_urls[0]} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-12 h-12 text-brand-pink/30" />
                      </div>
                    )}
                    
                    {product.featured && (
                      <div className="absolute top-4 left-4 bg-brand-orange text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center z-10">
                        <Star className="w-3 h-3 mr-1" fill="currentColor" /> Featured
                      </div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg z-10">
                        Sold Out
                      </div>
                    )}

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
                    <h3 className="text-heading-3 text-foreground mb-2 group-hover:text-brand-pink transition-colors line-clamp-2 capitalize">
                      {product.name}
                    </h3>
                    
                    <p className="text-body-small text-muted-foreground mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <p className="font-heading text-xl font-bold text-foreground">
                        {formatPrice(product.price)}
                      </p>
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
      )}
    </div>
  )
}
