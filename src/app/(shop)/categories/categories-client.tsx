'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Grid3X3, MessageCircle, Mail } from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  slug: string
  image_url?: string
  product_count?: number
}

interface CategoriesClientProps {
  categories: Category[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 }
}

export default function CategoriesClient({ categories }: CategoriesClientProps) {
  return (
    <div className="container-premium relative z-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center px-4 py-2 bg-pink-50 rounded-full mb-4 border-2 border-pink-100">
          <Sparkles className="h-5 w-5 text-brand-pink mr-2" />
          <span className="text-brand-purple font-bold tracking-wide">Find the Perfect Gift</span>
        </div>
        <h1 className="text-display text-foreground mb-4">Shop by <span className="text-brand-orange">Category</span></h1>
        <p className="text-body-large text-gray-500 max-w-2xl mx-auto">
          Browse our magical collections to discover personalized art pieces that capture your special moments.
        </p>
      </motion.div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-gray-200 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Grid3X3 className="w-10 h-10 text-brand-pink opacity-50" />
          </div>
          <h3 className="text-heading-3 text-foreground mb-2">No categories yet</h3>
          <p className="text-muted-foreground mb-6">We're brewing some new magic in the back. Check back soon!</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemVariants} className="h-full">
              <Link href={`/categories/${category.slug}`} className="block group h-full">
                <div className="premium-card bg-white p-6 md:p-8 flex flex-col items-center justify-center text-center h-full hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-50 to-transparent rounded-bl-full z-0 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-pink-50 mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner relative overflow-hidden z-10 border-4 border-white shadow-lg">
                    {category.image_url ? (
                      <Image src={category.image_url} alt={category.name} fill sizes="128px" className="object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-brand-pink opacity-50">{category.name.charAt(0)}</span>
                    )}
                  </div>
                  
                  <h3 className="text-heading-3 text-foreground mb-2 group-hover:text-brand-pink transition-colors z-10">
                    {category.name}
                  </h3>
                  <p className="text-body-small text-gray-500 mb-4 line-clamp-2 z-10">
                    {category.description}
                  </p>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between w-full border-t border-gray-100 z-10">
                    <span className="text-sm font-bold text-brand-purple bg-purple-50 px-3 py-1 rounded-full">
                      {category.product_count || 0} {(category.product_count === 1) ? 'item' : 'items'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-brand-pink text-white flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Help Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="bg-gradient-to-br from-brand-purple to-[#312e81] rounded-[3rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-pink opacity-20 rounded-full blur-3xl mix-blend-overlay"></div>
        
        <h2 className="text-heading-2 text-white mb-4 relative z-10">Need Help Choosing?</h2>
        <p className="text-white/80 mb-8 max-w-2xl mx-auto relative z-10 text-lg">
          Not sure which category to explore? Contact our team for personalized recommendations based on your occasion and preferences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <a
            href="https://wa.me/9072270271"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-600 hover:scale-105 transition-all shadow-lg flex items-center justify-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp Us
          </a>
          <Link href="/contact" className="bg-white text-brand-purple px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all shadow-lg flex items-center justify-center">
            <Mail className="w-5 h-5 mr-2" /> Contact Form
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
