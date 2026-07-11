'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { db, storage } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ArrowLeft, Upload, X, Package } from 'lucide-react'
import { Modal } from '@/components/ui/modal'

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('id')
  
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    dimensions: '',
    material: '',
    weight: '',
    sku: '',
    featured: false
  })
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCategories()
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    if (!productId) return
    setLoading(true)
    try {
      const docSnap = await getDoc(doc(db, 'products', productId))
      if (docSnap.exists()) {
        const data = docSnap.data()
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price ? data.price.toString() : '',
          category_id: data.category_id || '',
          stock_quantity: data.stock_quantity !== undefined ? data.stock_quantity.toString() : '',
          dimensions: data.dimensions || '',
          material: data.material || '',
          weight: data.weight ? data.weight.toString() : '',
          sku: data.sku || '',
          featured: data.featured || false
        })
        if (data.image_urls) {
          setUploadedImages(data.image_urls)
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Could not load product data',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, 'categories')
      const q = query(categoriesRef, where('is_active', '==', true))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category)
      data.sort((a, b) => a.name.localeCompare(b.name))
      setCategories(data)
    } catch (error: any) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setLoading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        
        const storageRef = ref(storage, `products/${fileName}`)
        await uploadBytes(storageRef, file)
        return await getDownloadURL(storageRef)
      })

      const imageUrls = await Promise.all(uploadPromises)
      setUploadedImages(prev => [...prev, ...imageUrls])
    } catch (error) {
      console.error('Error uploading images:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Error uploading images. Please try again.',
        type: 'error'
      })
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.category_id || uploadedImages.length === 0) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please fill in all required fields and upload at least one image',
        type: 'error'
      })
      return
    }

    setLoading(true)
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        stock_quantity: parseInt(formData.stock_quantity as string) || 0,
        dimensions: formData.dimensions,
        material: formData.material,
        weight: formData.weight ? parseFloat(formData.weight as string) : null,
        sku: formData.sku,
        image_urls: uploadedImages,
        featured: formData.featured,
        is_active: true,
        ...(productId ? {} : { created_at: new Date().toISOString() }),
        updated_at: new Date().toISOString()
      }

      if (productId) {
        await updateDoc(doc(db, 'products', productId), productData)
      } else {
        await addDoc(collection(db, 'products'), productData)
      }
      
      router.push('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Error saving product. Please try again.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="mb-8">
        <Link href="/admin/products" className="inline-flex items-center text-gray-400 hover:text-brand-purple mb-4 font-bold transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
        <h1 className="text-display text-gray-900 mb-2 flex items-center">
          <Package className="h-8 w-8 mr-3 text-brand-purple" />
          {productId ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-gray-500 font-medium">{productId ? 'Update your magical product' : 'Create a new magical product for your store'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information */}
        <div className="premium-card bg-white p-8">
          <h2 className="text-heading-3 text-gray-900 mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="form-input bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="form-input rounded-2xl"
              placeholder="Describe your product..."
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="premium-card bg-white p-8">
          <h2 className="text-heading-3 text-gray-900 mb-6">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                required min="0" step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="form-input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                className="form-input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="form-input"
                placeholder="SKU-123"
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="premium-card bg-white p-8">
          <h2 className="text-heading-3 text-gray-900 mb-6">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Dimensions</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                className="form-input"
                placeholder="12x8 inches"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Material</label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({...formData, material: e.target.value})}
                className="form-input"
                placeholder="Wood, Glass"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                min="0" step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="form-input"
                placeholder="0.5"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="w-5 h-5 text-brand-purple rounded border-gray-300 focus:ring-brand-purple mr-3"
            />
            <label htmlFor="featured" className="text-sm font-bold text-yellow-800">
              Featured Product (Shows up on the homepage)
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="premium-card bg-white p-8">
          <h2 className="text-heading-3 text-gray-900 mb-6">Product Images</h2>
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 hover:border-gray-400 focus:outline-none transition-colors w-full justify-center group"
            >
              <Upload className="h-6 w-6 mr-3 text-gray-400 group-hover:text-brand-purple transition-colors" />
              <div className="text-center">
                <span className="font-bold text-gray-700 block">Click to upload images</span>
                <span className="text-sm font-medium text-gray-500">PNG, JPG, GIF up to 10MB each</span>
              </div>
            </label>
          </div>

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-40 object-cover rounded-2xl shadow-sm border border-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t-2 border-gray-100">
          <Link href="/admin/products">
            <button type="button" className="px-6 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-purple hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
          >
            {loading ? (productId ? 'Updating...' : 'Creating...') : (productId ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  )
}
