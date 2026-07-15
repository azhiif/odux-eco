'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { 
  Heart, 
  ArrowRight,
  Sparkles,
  Gift,
  Star,
  Camera,
  ShoppingBag
} from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Product } from '@/lib/products'
import { Category } from '@/lib/categories'
import { Banner } from '@/lib/banners'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Instagram } from 'lucide-react'

// Framer Motion Variants
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

interface HomeClientProps {
  categories: Category[]
  featuredProducts: Product[]
  banners: Banner[]
}

export default function HomeClient({ categories, featuredProducts, banners }: HomeClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [instagramPosts, setInstagramPosts] = useState<{imageUrl: string, postUrl: string}[]>([])
  const [reviewWidgetHtml, setReviewWidgetHtml] = useState<string>('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'general'))
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          if (data.instagramPosts && Array.isArray(data.instagramPosts)) {
            setInstagramPosts(data.instagramPosts)
          }
          if (data.reviewWidgetHtml) {
            setReviewWidgetHtml(data.reviewWidgetHtml)
          }
        }
      } catch (error) {
        console.error('Error fetching instagram posts:', error)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [banners.length])

  return (
    <div className="overflow-x-hidden">
      {/* Dynamic Hero Section */}
      {banners.length > 0 && (
        <section className="relative px-4 pt-4 md:pt-8 pb-12 w-full max-w-[1600px] mx-auto">
          <div className="relative w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-gradient-to-br from-pink-100 via-purple-100 to-orange-50 aspect-square md:aspect-[21/9]">
            
            {/* Decorative Floating Elements */}
            <motion.div className="absolute top-10 left-10 text-brand-pink opacity-50 hidden md:block" animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}><Sparkles size={48} /></motion.div>
            <motion.div className="absolute bottom-20 right-20 text-brand-orange opacity-50 hidden md:block" animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }}><Heart size={64} fill="currentColor" /></motion.div>

            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full relative"
                >
                  <Link href={banners[currentSlide].button_link || '/products'} className="block w-full h-full relative">
                    {/* Mobile Image */}
                    <Image
                      src={banners[currentSlide].mobile_image_url || banners[currentSlide].desktop_image_url}
                      alt={banners[currentSlide].title}
                      fill
                      priority
                      sizes="(max-width: 1600px) 92vw, 1472px"
                      className="md:hidden object-cover"
                    />
                    {/* Desktop Image */}
                    <Image
                      src={banners[currentSlide].desktop_image_url || banners[currentSlide].mobile_image_url}
                      alt={banners[currentSlide].title}
                      fill
                      priority
                      sizes="(max-width: 1600px) 92vw, 1472px"
                      className="hidden md:block object-cover"
                    />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 pb-16 md:p-16">
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white text-3xl md:text-heading-1 mb-2 drop-shadow-lg"
                        style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                      >
                        {banners[currentSlide].title}
                      </motion.h2>
                      {banners[currentSlide].subtitle && (
                        <motion.p 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="hidden md:block text-white/90 text-sm md:text-body-large mb-4 md:mb-6 max-w-2xl drop-shadow-md line-clamp-2 md:line-clamp-none"
                          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}
                        >
                          {banners[currentSlide].subtitle}
                        </motion.p>
                      )}
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                        <div className="inline-flex items-center justify-center btn-premium-gold shadow-xl shadow-brand-pink/30 hover:scale-105 active:scale-95 transition-all text-sm md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-full border-2 border-white/20 backdrop-blur-sm">
                          {banners[currentSlide].button_text || 'Shop Now'} <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                        </div>
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Bubbly Navigation Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? 'w-10 h-3 bg-brand-pink shadow-[0_0_10px_rgba(255,71,126,0.8)]'
                        : 'w-3 h-3 bg-white/60 hover:bg-white hover:scale-125'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Playful Categories Section */}
      <section className="section-spacing relative overflow-hidden">
        <div className="container-premium">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-heading-1 text-foreground mb-4">
              Shop By <span className="text-brand-purple">Occasion</span>
            </h2>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Find the exact vibe you are looking for. Because every moment deserves its own spotlight.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            {categories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Link href={`/categories/${category.slug}`} className="block group">
                  <div className="premium-card p-6 md:p-8 text-center bg-white hover:bg-brand-pink/5 flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-pink-50 mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 overflow-hidden shadow-inner relative">
                      {category.image_url ? (
                        <Image src={category.image_url} alt={category.name} fill className="object-cover" sizes="(max-width: 768px) 5rem, 7rem" />
                      ) : (
                        <Gift className="w-10 h-10 md:w-12 md:h-12 text-brand-pink relative z-10" />
                      )}
                    </div>
                    <h3 className="text-heading-3 text-foreground group-hover:text-brand-pink transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Masterpieces */}
      <section className="section-spacing bg-pink-50/50 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="container-premium relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6"
          >
            <div>
              <h2 className="text-heading-1 text-foreground mb-4">
                Curated <span className="gradient-text-vibrant">Masterpieces</span>
              </h2>
              <p className="text-body-large text-muted-foreground max-w-xl">
                Hand-picked gifts that guarantee smiles, hugs, and happy tears.
              </p>
            </div>
            <Link href="/products" className="hidden md:block">
              <Button className="btn-outline-premium rounded-full text-lg px-8 py-6">
                See All Gifts <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
          >
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <Link href={`/products/${product.id}`} className="block group">
                  <article className="premium-card bg-white h-full flex flex-col group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300 border border-transparent group-hover:border-gray-100">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-t-[22px]">
                      {product.image_urls[0] ? (
                        <Image
                          src={product.image_urls[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      {/* Quick Add Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-center bg-gradient-to-t from-black/50 to-transparent z-20">
                        <Button 
                          className="btn-premium-gold w-full max-w-[200px] shadow-2xl"
                          onClick={(e) => { e.preventDefault(); /* Add to cart logic here */ }}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" /> Quick Add
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
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
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-12 md:hidden">
            <Link href="/products">
              <Button className="btn-outline-premium rounded-full w-full text-lg py-6">
                See All Gifts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Vibrant CTA Section */}
      <section className="section-spacing relative overflow-hidden mx-4 md:mx-8 mb-8 md:mb-16 rounded-[2rem] md:rounded-[3rem] bg-brand-purple">
        {/* Animated Background blobs */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-64 -right-64 w-[500px] h-[500px] bg-brand-pink rounded-full mix-blend-multiply filter blur-3xl opacity-70"></motion.div>
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-64 -left-64 w-[500px] h-[500px] bg-brand-orange rounded-full mix-blend-multiply filter blur-3xl opacity-70"></motion.div>

        <div className="container-premium relative z-10 text-center px-4 py-12 md:py-20">
          <motion.h2 
            initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
            className="text-display text-white mb-6 drop-shadow-xl"
          >
            Bring Your Ideas <br /> <span className="text-brand-orange">To Life!</span>
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-body-large text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md"
          >
            Can't find exactly what you're looking for? Let's create a custom masterpiece from your favorite photos.
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/custom-order" className="w-full sm:w-auto">
              <Button className="btn-premium bg-white text-brand-purple hover:bg-gray-50 text-lg px-10 py-7 shadow-2xl shadow-black/20 w-full sm:w-auto">
                Start Custom Order
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      {reviewWidgetHtml && (
        <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
          <div className="container-premium text-center mb-10 md:mb-16">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}>
              <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 mx-auto mb-4" />
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-heading-2 text-gray-900 mb-4"
            >
              What Our Customers Say
            </motion.h2>
          </div>
          <div className="container-premium relative z-10 w-full max-w-6xl mx-auto overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: reviewWidgetHtml }} />
          </div>
        </section>
      )}

      {/* Instagram Banner Section */}
      {instagramPosts.length > 0 && (
        <section className="bg-white relative overflow-hidden pt-12 md:pt-16 border-t border-gray-100">
          <div className="text-center mb-10 md:mb-12">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3 flex items-center justify-center gap-3"
            >
              <Instagram className="w-8 h-8 md:w-10 md:h-10 text-brand-pink" />
              Find us on Instagram
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-body-large text-gray-500 font-medium"
            >
              @odux.art
            </motion.p>
          </div>
          
          {/* Full-width Grid Wrapper without spacing */}
          <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0">
              {instagramPosts.slice(0, 12).map((post, idx) => (
                <a 
                  href={post.postUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  key={idx}
                  className="relative aspect-square group block overflow-hidden bg-gray-100"
                >
                  <Image src={post.imageUrl} alt="Instagram Post" fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 33vw" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Instagram className="text-white w-8 h-8 md:w-10 md:h-10 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
