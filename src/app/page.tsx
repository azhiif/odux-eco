'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { getBanners } from '@/lib/banner'
import { formatPrice } from '@/lib/utils'
import { validateAndSanitize } from '@/lib/validation'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { 
  Heart, 
  Star, 
  Gift, 
  Palette, 
  Camera, 
  Sparkles, 
  ArrowRight, 
  ShoppingCart, 
  Crown, 
  Diamond, 
  Zap,
  TrendingUp,
  Award,
  Users,
  Clock,
  Shield,
  Truck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle
} from 'lucide-react'
import Head from 'next/head'
import '../lib/env' // Validate environment on import

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

export default function Home() {
  const [categories, setCategories] = useState<any[]>([
    { id: 1, name: 'Birthday Gifts', slug: 'birthday', image_url: null, is_active: true },
    { id: 2, name: 'Wedding Art', slug: 'wedding', image_url: null, is_active: true },
    { id: 3, name: 'Anniversary', slug: 'anniversary', image_url: null, is_active: true },
    { id: 4, name: 'Custom Frames', slug: 'custom-frames', image_url: null, is_active: true },
    { id: 5, name: 'Wall Art', slug: 'wall-art', image_url: null, is_active: true },
    { id: 6, name: 'Gift Sets', slug: 'gift-sets', image_url: null, is_active: true },
    { id: 7, name: 'Photo Prints', slug: 'photo-prints', image_url: null, is_active: true },
    { id: 8, name: 'Special Occasions', slug: 'special-occasions', image_url: null, is_active: true },
  ])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    fetchData()
    // Simulate loading for premium feel
    setTimeout(() => setIsLoaded(true), 100)
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
      console.log('Starting data fetch...')
      
      // Fetch categories
      console.log('Fetching categories...')
      try {
        const categoriesRef = collection(db, 'categories')
        const q = query(categoriesRef, where('is_active', '==', true), limit(8))
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Categories query timeout')), 5000)
        )
        
        const snapshot = await Promise.race([getDocs(q), timeoutPromise]) as any
        const categoriesData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
        console.log('Categories loaded:', categoriesData.length)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Categories query failed:', error)
        setCategories([])
      }
      
      // Fetch products
      console.log('Fetching products...')
      try {
        const productsRef = collection(db, 'products')
        const pq = query(productsRef, where('is_active', '==', true), where('featured', '==', true), limit(8))
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Products query timeout')), 5000)
        )
        
        const snapshot = await Promise.race([getDocs(pq), timeoutPromise]) as any
        const productsData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
        console.log('Products loaded:', productsData.length)
        setFeaturedProducts(productsData)
      } catch (error) {
        console.error('Products query failed:', error)
        setFeaturedProducts([])
      }

      // Fetch banners
      console.log('Fetching banners...')
      try {
        const bannersData = await getBanners()
        console.log('Raw banners from getBanners():', bannersData)
        if (bannersData && bannersData.length > 0) {
          console.log('Active banners found:', bannersData.length)
          setBanners(bannersData)
        } else {
          console.warn('No active banners found in database. Check is_active field.')
          setBanners([])
        }
      } catch (error) {
        console.error('Banners query failed:', error)
        setBanners([])
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading amazing content...</p>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <>
        <div className={`min-h-screen bg-white ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-all duration-1000`}>
        {/* Hero Banner - Match Live Site */}
        <section className="relative -mt-4">
          <div className="relative w-full" style={{ paddingBottom: '40%' }}>
            {banners.length > 0 ? (
              <div className="absolute inset-0 overflow-hidden">
                <div className="flex h-full transition-transform duration-500 ease-in-out"
                     style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {banners.map((banner, index) => (
                    <div
                      key={banner.id}
                      className="min-w-full w-full h-full relative overflow-hidden"
                    >
                      <Link href="/products" className="block w-full h-full">
                        {banner.desktop_image_url || banner.mobile_image_url ? (
                          <>
                            {/* Desktop Image */}
                            <img
                              src={banner.desktop_image_url || banner.mobile_image_url}
                              alt={banner.title}
                              className="hidden md:block absolute top-0 left-0 w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                            />
                            {/* Mobile Image */}
                            <img
                              src={banner.mobile_image_url || banner.desktop_image_url}
                              alt={banner.title}
                              className="md:hidden absolute top-0 left-0 w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                            />
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-100 relative overflow-hidden cursor-pointer">
                            {/* Empty placeholder when no banners */}
                          </div>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Navigation Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`transition-all duration-300 ${
                        index === currentSlide
                          ? 'w-8 h-2 bg-gray-900 rounded-full'
                          : 'w-2 h-2 bg-gray-400 rounded-full hover:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gray-100 relative overflow-hidden">
                {/* Empty placeholder when no banners */}
              </div>
            )}
          </div>
        </section>

        {/* Premium Categories Section */}
        <section className="section-spacing relative overflow-hidden">
          <div className="container-premium">
            <div className="text-center mb-16">
              <h2 className="font-heading text-heading-1 text-gray-900 mb-6">
                Explore Categories
              </h2>
              <p className="text-body-large text-gray-600 max-w-3xl mx-auto">
                Discover our curated collection of premium custom artwork categories
              </p>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
                <h3 className="font-heading text-2xl text-gray-900 mb-3">Categories Coming Soon</h3>
                <p className="text-body text-gray-600 mb-8">We're preparing amazing categories for you</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {categories.map((category, index) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group block animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="premium-card p-8 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-6 group-hover:bg-[#C5A46D] transition-all duration-300 group-hover:scale-110">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                      
                      <h3 className="font-heading text-heading-3 text-gray-900 mb-3 group-hover:text-[#C5A46D] transition-colors">
                        {category.name}
                      </h3>
                      
                      <div className="flex items-center justify-center text-[#C5A46D] opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="font-medium text-body-small">Explore</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Premium Featured Products Section */}
        <section className="section-spacing relative overflow-hidden">
          <div className="container-premium">
            <div className="text-center mb-16">
              <h2 className="font-heading text-heading-1 text-gray-900 mb-6">
                Featured Collection
              </h2>
              <p className="text-body-large text-gray-600 max-w-3xl mx-auto">
                Handpicked masterpieces that showcase our artistic excellence
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <Link 
                  key={product.id} 
                  href={`/products/${product.id}`}
                  className="group animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <article className="premium-card overflow-hidden hover-lift">
                    <div className="aspect-[4/5] relative bg-gray-50 overflow-hidden image-hover-zoom">
                      {product.image_urls[0] && (
                        <Image
                          src={product.image_urls[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      )}
                      {product.featured && (
                        <div className="absolute top-4 left-4 bg-[#C5A46D] text-white px-3 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-heading text-heading-3 text-gray-900 mb-3 group-hover:text-[#C5A46D] transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-body text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="font-heading text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center text-[#C5A46D]">
                          <div className="w-4 h-4 bg-[#C5A46D] rounded-full mr-1"></div>
                          <span className="text-body-small font-medium">4.8</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/products">
                <Button className="btn-premium-gold">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Premium CTA Section */}
        <section className="section-spacing bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
          <div className="container-premium text-center">
            <h2 className="font-heading text-heading-1 text-gray-900 mb-6">
              Create Your Custom Art
            </h2>
            <p className="text-body-large text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your precious memories into stunning art pieces that last forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/custom-order">
                <Button className="btn-premium-gold">
                  Upload Your Photo
                </Button>
              </Link>
              <Link href="/about">
                <Button className="btn-outline-premium">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      </>
      </ErrorBoundary>
  )
}
