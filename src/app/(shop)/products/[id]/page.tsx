'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { db, auth, storage } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, limit, getDocs, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, ArrowLeft, Heart, Share2, Star, Upload, Camera, Gift, Sparkles } from 'lucide-react'

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
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setUploading(true)
    try {
      // Upload to Firebase Storage
      const user = auth.currentUser
      if (!user) {
        alert('Please sign in to upload images')
        return
      }

      const fileName = `${Date.now()}_${file.name}`
      const storageRef = ref(storage, `custom_images/${user.uid}/${fileName}`)
      
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      
      setUploadedImage(downloadURL)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const addToCart = async () => {
    if (!product) return

    try {
      const user = auth.currentUser
      if (!user) {
        alert('Please sign in to add items to cart')
        return
      }

      await addDoc(collection(db, 'shopping_cart'), {
        user_id: user.uid,
        product_id: product.id,
        quantity: quantity,
        custom_image: uploadedImage // Store the uploaded image
      })

      // Show success message with custom image info
      if (uploadedImage) {
        alert('Product added to cart with your custom photo! 🎁')
      } else {
        alert('Product added to cart!')
      }

      // Reset upload after adding to cart
      setUploadedImage(null)
      setShowUploadModal(false)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading amazing product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you&apos;re looking for doesn&apos;t exist</p>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link href="/products" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4 md:mb-6 group transition-colors">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm md:text-base">Back to Products</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Product Images */}
          <div className="space-y-3 md:space-y-4">
            <div className="relative aspect-square bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl overflow-hidden">
              {product.image_urls[selectedImage] ? (
                <Image
                  src={product.image_urls[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Camera className="h-12 w-12 md:h-16 md:w-16 text-purple-400" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.image_urls.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === index
                        ? 'border-purple-600 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Custom Image Upload */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 border border-purple-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl mb-3 md:mb-4">
                  <Upload className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2">Add Your Photo</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Upload your photo to create a personalized gift</p>
                
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 md:space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">{product.description}</p>
              
              <div className="flex items-center mb-4 md:mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 md:h-5 md:w-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600 text-sm md:text-base">(4.9)</span>
              </div>

              <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
                {formatPrice(product.price)}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm md:text-base"
                  >
                    {[...Array(Math.min(10, product.stock_quantity))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600">
                    ({product.stock_quantity} available)
                  </span>
                </div>

                <Button
                  onClick={addToCart}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 md:py-4 rounded-lg md:rounded-xl text-base md:text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Add to Cart
                  {uploadedImage && (
                    <span className="ml-2 text-yellow-300">✨</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">Product Features</h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center text-xs md:text-sm text-gray-600">
                  <Gift className="h-4 w-4 text-purple-600 mr-2 md:mr-3" />
                  <span>Personalized with your photos</span>
                </div>
                <div className="flex items-center text-xs md:text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 text-pink-600 mr-2 md:mr-3" />
                  <span>Handcrafted with love</span>
                </div>
                {product.dimensions && (
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <span className="font-medium mr-2 md:mr-3">Dimensions:</span>
                    <span>{product.dimensions}</span>
                  </div>
                )}
                {product.material && (
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <span className="font-medium mr-2 md:mr-3">Material:</span>
                    <span>{product.material}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 md:mb-8 text-center">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group block bg-white rounded-lg md:rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="aspect-square relative">
                    {relatedProduct.image_urls?.[0] ? (
                      <Image
                        src={relatedProduct.image_urls[0]}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <Camera className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-gray-800 text-xs md:text-sm group-hover:text-purple-600 transition-colors line-clamp-1 md:line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-base md:text-lg font-bold text-gray-800 mt-1">
                      {formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <div className="text-center mb-4 md:mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-2xl mb-3 md:mb-4">
                <Upload className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">Upload Your Photo</h3>
              <p className="text-gray-600 text-sm md:text-base">Add a personal touch to your gift</p>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-purple-300 rounded-lg md:rounded-xl p-4 md:p-8 text-center mb-4 md:mb-6">
              {uploadedImage ? (
                <div className="space-y-3 md:space-y-4">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto rounded-lg overflow-hidden">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-green-600 font-medium text-sm md:text-base">✓ Photo uploaded successfully!</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <Upload className="h-10 w-10 md:h-12 md:w-12 text-purple-400 mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg md:rounded-xl font-semibold cursor-pointer transition-all duration-300 text-sm md:text-base"
                  >
                    {uploading ? (
                      <>
                        <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Photo
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 md:space-x-4">
              <Button
                onClick={() => setShowUploadModal(false)}
                variant="outline"
                className="flex-1 text-sm md:text-base"
              >
                Cancel
              </Button>
              {uploadedImage && (
                <Button
                  onClick={() => {
                    setShowUploadModal(false)
                    addToCart()
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm md:text-base"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
