'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { getBanners } from '@/lib/banner'
import { formatPrice } from '@/lib/utils'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { OrganizationStructuredData, LocalBusinessStructuredData } from '@/components/seo/StructuredData'
import { 
  Heart, 
  ArrowRight,
  Sparkles,
  Gift,
  Star,
  Camera,
  ShoppingBag
} from 'lucide-react'
import '@/lib/env'
import { motion, AnimatePresence, Variants } from 'framer-motion'

interface Category {
  id: string
  name: string
  slug: string
  image_url?: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_urls: string[]
  category_id: string
  featured: boolean
  stock_quantity: number
}

interface Banner {
  id: string
  title: string
  subtitle?: string
  desktop_image_url: string
  mobile_image_url: string
  button_text?: string
  button_link?: string
  is_active: boolean
  sort_order: number
}

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

export default function Home() {
  const [categories, setCategories] = useState<any[]>([
    { id: 1, name: 'Birthday Gifts', slug: 'birthday', image_url: null, is_active: true },
    { id: 2, name: 'Wedding Art', slug: 'wedding', image_url: null, is_active: true },
    { id: 3, name: 'Anniversary', slug: 'anniversary', image_url: null, is_active: true },
    { id: 4, name: 'Custom Frames', slug: 'custom-frames', image_url: null, is_active: true },
  ])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [banners.length])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch categories
      try {
        const categoriesRef = collection(db, 'categories')
        const q = query(categoriesRef, where('is_active', '==', true), limit(8))
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        const snapshot = await Promise.race([getDocs(q), timeoutPromise]) as any
        const categoriesData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
        if (categoriesData.length > 0) setCategories(categoriesData)
      } catch (error) {
        console.error('Categories query failed:', error)
      }
      
      // Fetch products
      try {
        const productsRef = collection(db, 'products')
        const pq = query(productsRef, where('is_active', '==', true), where('featured', '==', true), limit(8))
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        const snapshot = await Promise.race([getDocs(pq), timeoutPromise]) as any
        const productsData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
        setFeaturedProducts(productsData)
      } catch (error) {
        console.error('Products query failed:', error)
      }

      // Fetch banners
      try {
        const bannersData = await getBanners()
        if (bannersData && bannersData.length > 0) {
          setBanners(bannersData)
        }
      } catch (error) {
        console.error('Banners query failed:', error)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center min-h-screen bg-background">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 border-4 border-t-brand-pink border-r-brand-orange border-b-brand-purple border-l-brand-blue rounded-full mx-auto mb-6"
            />
            <p className="text-brand-purple font-heading text-xl animate-pulse">Unwrapping awesomeness...</p>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <OrganizationStructuredData
          data={{
            name: 'Odux Art',
            url: 'https://oduxart.com',
            logo: 'https://oduxart.com/logo.png',
            description: 'Transform your precious memories into stunning custom art frames.',
            address: {
              streetAddress: 'Thayyalingal',
              addressLocality: 'Malappuram',
              addressRegion: 'Kerala',
              postalCode: '676517',
              addressCountry: 'IN',
            },
            contactPoint: {
              telephone: '+91 9072270271',
              contactType: 'customer service',
              email: 'support@odux.art',
            },
            sameAs: ['https://instagram.com/odux.art', 'https://facebook.com/odux.art'],
          }}
        />
        <LocalBusinessStructuredData
          data={{
            name: 'Odux Art',
            url: 'https://oduxart.com',
            logo: 'https://oduxart.com/logo.png',
            description: 'Transform your precious memories into stunning custom art frames.',
            address: {
              streetAddress: 'Thayyalingal',
              addressLocality: 'Malappuram',
              addressRegion: 'Kerala',
              postalCode: '676517',
              addressCountry: 'IN',
            },
            contactPoint: {
              telephone: '+91 9072270271',
              contactType: 'customer service',
              email: 'support@odux.art',
            },
            sameAs: ['https://instagram.com/odux.art', 'https://facebook.com/odux.art'],
          }}
        />

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
                    <Link href={banners[currentSlide].button_link || '/products'} className="block w-full h-full">
                      {/* Mobile Image */}
                      <img
                        src={banners[currentSlide].mobile_image_url || banners[currentSlide].desktop_image_url}
                        alt={banners[currentSlide].title}
                        className="md:hidden absolute top-0 left-0 w-full h-full object-cover"
                      />
                      {/* Desktop Image */}
                      <img
                        src={banners[currentSlide].desktop_image_url || banners[currentSlide].mobile_image_url}
                        alt={banners[currentSlide].title}
                        className="hidden md:block absolute top-0 left-0 w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay for Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-16">
                        <motion.h2 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-white text-heading-1 mb-2 drop-shadow-lg"
                        >
                          {banners[currentSlide].title}
                        </motion.h2>
                        {banners[currentSlide].subtitle && (
                          <motion.p 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/90 text-body-large mb-6 max-w-2xl drop-shadow-md"
                          >
                            {banners[currentSlide].subtitle}
                          </motion.p>
                        )}
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                          <Button className="btn-premium-gold shadow-xl shadow-brand-pink/30 hover:scale-105 active:scale-95 transition-all text-lg px-8 py-6 rounded-full border-2 border-white/20 backdrop-blur-sm">
                            {banners[currentSlide].button_text || 'Shop Now'} <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
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
                      <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-pink-50 mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 overflow-hidden shadow-inner">
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <Gift className="w-10 h-10 md:w-12 md:h-12 text-brand-pink" />
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
                    <article className="premium-card bg-white h-full flex flex-col group-hover:-translate-y-2 transition-all duration-300">
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
                        {product.featured && (
                          <div className="absolute top-4 left-4 bg-brand-orange text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center">
                            <Star className="w-3 h-3 mr-1" fill="currentColor" /> Bestseller
                          </div>
                        )}
                        {/* Quick Add Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-center bg-gradient-to-t from-black/50 to-transparent">
                          <Button 
                            className="btn-premium-gold w-full max-w-[200px] shadow-2xl"
                            onClick={(e) => { e.preventDefault(); /* Add to cart logic */ }}
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" /> Quick Add
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
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
                          <div className="flex items-center bg-pink-50 px-2 py-1 rounded-md text-brand-pink">
                            <Star className="w-3.5 h-3.5 mr-1" fill="currentColor" />
                            <span className="text-sm font-bold">4.9</span>
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
      </div>
    </ErrorBoundary>
  )
}
