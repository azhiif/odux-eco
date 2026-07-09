'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { db, auth, storage } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, limit, getDocs, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, ArrowLeft, Heart, Share2, Star, Upload, Camera, Gift, Sparkles, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/modal'

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
  weight?: number
  sku?: string
  categories?: {
    id: string
    name: string
    slug: string
  }
}

interface RelatedProduct {
  id: string
  name: string
  price: number
  image_urls: string[]
  slug?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchRelatedProducts()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, 'products', productId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        console.error('Product not found')
        return
      }

      setProduct({ id: docSnap.id, ...docSnap.data() } as Product)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const q = query(
        collection(db, 'products'),
        where('featured', '==', true),
        limit(5)
      )
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as RelatedProduct))
        .filter(p => p.id !== productId)
        .slice(0, 4)

      setRelatedProducts(data)
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setModalState({
        isOpen: true,
        title: 'Invalid File',
        message: 'Please upload an image file (JPG, PNG).',
        type: 'error'
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalState({
        isOpen: true,
        title: 'File Too Large',
        message: 'Image size should be less than 5MB.',
        type: 'error'
      })
      return
    }

    setUploading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        setModalState({
          isOpen: true,
          title: 'Authentication Required',
          message: 'Please sign in to upload images.',
          type: 'info'
        })
        return
      }

      const fileName = `${Date.now()}_${file.name}`
      const storageRef = ref(storage, `custom_images/${user.uid}/${fileName}`)
      
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      
      setUploadedImage(downloadURL)
    } catch (error) {
      console.error('Error uploading image:', error)
      setModalState({
        isOpen: true,
        title: 'Upload Failed',
        message: 'Failed to upload image. Please try again.',
        type: 'error'
      })
    } finally {
      setUploading(false)
    }
  }

  const addToCart = async () => {
    if (!product) return

    try {
      const user = auth.currentUser
      if (!user) {
        setModalState({
          isOpen: true,
          title: 'Authentication Required',
          message: 'Please sign in to add items to cart.',
          type: 'info'
        })
        return
      }

      await addDoc(collection(db, 'shopping_cart'), {
        user_id: user.uid,
        product_id: product.id,
        quantity: quantity,
        custom_image: uploadedImage
      })

      try {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'ADD_TO_CART', 
            data: { product_id: product.id, quantity, custom_image: uploadedImage } 
          })
        })
      } catch (notifyErr) {
        console.error('Failed to send notification email', notifyErr)
      }

      if (uploadedImage) {
        setModalState({
          isOpen: true,
          title: 'Added to Cart!',
          message: 'Product added to cart with your custom photo! 🎁',
          type: 'success'
        })
      } else {
        setModalState({
          isOpen: true,
          title: 'Added to Cart!',
          message: 'Product added to cart!',
          type: 'success'
        })
      }

      setUploadedImage(null)
      setShowUploadModal(false)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setModalState({
        isOpen: true,
        title: 'Failed to Add',
        message: 'Failed to add item to cart. Please try again.',
        type: 'error'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 border-4 border-t-brand-pink border-r-brand-orange border-b-brand-purple border-l-brand-blue rounded-full mx-auto mb-6"
          />
          <p className="text-brand-purple font-heading text-xl animate-pulse">Unwrapping product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-center px-4">
        <div>
          <h1 className="text-display text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-body-large text-gray-600 mb-8">The magic item you're looking for vanished!</p>
          <Button onClick={() => router.push('/products')} className="btn-premium-gold px-8 py-6 rounded-full text-lg">
            Back to Collection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16 pt-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="container-premium relative z-10">
        {/* Navigation */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 md:mb-10">
          <button onClick={() => router.back()} className="inline-flex items-center text-gray-600 hover:text-brand-pink group transition-colors">
            <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center mr-3 group-hover:bg-brand-pink group-hover:text-white transition-all duration-300">
              <ChevronLeft className="h-5 w-5" />
            </div>
            <span className="font-heading text-lg font-bold">Back</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {/* Product Gallery */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="relative aspect-square bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-brand-pink/10 overflow-hidden border-4 border-white">
              {product.image_urls[selectedImage] ? (
                <Image
                  src={product.image_urls[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <Camera className="h-16 w-16 text-gray-300" />
                </div>
              )}
              {product.featured && (
                <div className="absolute top-6 left-6 bg-brand-orange text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg flex items-center z-10">
                  <Star className="w-4 h-4 mr-2" fill="currentColor" /> Bestseller
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.image_urls.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar justify-center">
                {product.image_urls.map((url, index) => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${
                      selectedImage === index
                        ? 'border-brand-pink shadow-[0_0_15px_rgba(255,71,126,0.3)]'
                        : 'border-white shadow-md hover:border-pink-100'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Information */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-8 flex flex-col justify-center">
            
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-brand-purple/5 border-2 border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-pink/10 to-transparent rounded-bl-full z-0"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4 space-x-2">
                  <div className="flex text-brand-orange">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < 4 ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-gray-500 font-bold">(4.9)</span>
                </div>

                <h1 className="text-heading-1 text-foreground mb-4 leading-tight">{product.name}</h1>
                <p className="text-body-large text-gray-600 mb-8 leading-relaxed">{product.description}</p>
                
                <div className="text-4xl md:text-5xl font-heading font-bold text-brand-purple mb-8">
                  {formatPrice(product.price)}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex-1 bg-gray-50 rounded-full p-2 flex items-center border-2 border-gray-100">
                    <span className="text-gray-500 font-bold px-4">Qty</span>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold text-brand-purple cursor-pointer pl-2 appearance-none"
                    >
                      {[...Array(Math.min(10, product.stock_quantity))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={addToCart}
                    disabled={product.stock_quantity === 0}
                    className="flex-[2] btn-premium-gold text-lg py-4 rounded-full shadow-[0_10px_30px_rgba(255,71,126,0.3)] hover:shadow-[0_15px_40px_rgba(255,71,126,0.4)]"
                  >
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>

                {/* Info Pills */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pink-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Gift className="h-6 w-6 text-brand-pink mb-2" />
                    <span className="text-sm font-bold text-gray-700">Perfect Gift</span>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                    <Sparkles className="h-6 w-6 text-brand-purple mb-2" />
                    <span className="text-sm font-bold text-gray-700">Handcrafted</span>
                  </div>
                  {product.dimensions && (
                    <div className="bg-orange-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
                      <span className="text-xs text-gray-500 font-bold uppercase mb-1">Dimensions</span>
                      <span className="text-sm font-bold text-gray-700">{product.dimensions}</span>
                    </div>
                  )}
                  {product.material && (
                    <div className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
                      <span className="text-xs text-gray-500 font-bold uppercase mb-1">Material</span>
                      <span className="text-sm font-bold text-gray-700">{product.material}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Photo Upload Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-brand-pink to-brand-orange p-1 rounded-[2rem] shadow-2xl"
            >
              <div className="bg-white rounded-[1.8rem] p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                  <Camera className="w-8 h-8 text-brand-pink" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Make it Yours</h3>
                  <p className="text-sm text-gray-600">Upload your own photo for a fully personalized art piece!</p>
                </div>
                <Button onClick={() => setShowUploadModal(true)} className="btn-outline-premium rounded-full px-6 py-4 w-full sm:w-auto shrink-0">
                  Upload Photo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mt-20 md:mt-32"
          >
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-heading-1 text-foreground mb-4">You Might Also <span className="text-brand-purple">Love</span></h2>
              <p className="text-body-large text-gray-500">Discover more magical gifts hand-picked just for you.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div 
                  key={relatedProduct.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/products/${relatedProduct.id}`} className="block group h-full">
                    <article className="premium-card bg-white h-full flex flex-col group-hover:-translate-y-2 transition-all duration-400">
                      <div className="aspect-square relative overflow-hidden rounded-t-[22px] bg-gray-50">
                        {relatedProduct.image_urls?.[0] ? (
                          <Image src={relatedProduct.image_urls[0]} alt={relatedProduct.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 text-center flex-1 flex flex-col justify-center">
                        <h3 className="font-heading text-lg font-bold text-gray-800 group-hover:text-brand-pink transition-colors line-clamp-1 mb-2">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-xl font-bold text-brand-purple">
                          {formatPrice(relatedProduct.price)}
                        </p>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Upload Modal (Animated) */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-brand-pink" />
                </div>
                <h3 className="text-heading-2 text-gray-800 mb-2">Upload Your Photo</h3>
                <p className="text-gray-500">Add a personal touch to your magical gift.</p>
              </div>

              {/* Upload Area */}
              <div className="border-4 border-dashed border-pink-100 rounded-2xl p-8 text-center mb-8 bg-gray-50 transition-colors hover:bg-pink-50/50 hover:border-pink-200">
                {uploadedImage ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-white">
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-green-600 font-bold">✨ Magic Captured!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-300 mx-auto" />
                    <p className="text-gray-500 font-medium">Click to choose a photo</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="inline-block px-6 py-3 bg-white border-2 border-gray-200 rounded-full font-bold text-gray-600 cursor-pointer hover:border-brand-pink hover:text-brand-pink transition-all shadow-sm">
                      {uploading ? 'Uploading magic...' : 'Choose Photo'}
                    </label>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => setShowUploadModal(false)} variant="outline" className="flex-1 rounded-full py-6 text-gray-500 border-2">
                  Cancel
                </Button>
                {uploadedImage && (
                  <Button onClick={() => { setShowUploadModal(false); addToCart(); }} className="flex-1 btn-premium-gold py-6 rounded-full">
                    <Gift className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  )
}
