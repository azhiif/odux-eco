'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { db, storage } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ArrowLeft, Upload, X, Package, Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { Modal } from '@/components/ui/modal'

import { ProductVariant } from '@/lib/products'

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
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    category_id: '',
    stock_quantity: '',
    dimensions: '',
    material: '',
    weight: '',
    sku: '',
    featured: false,
    on_sale: false,
    order: undefined as number | undefined,
    customization_required: {
      text: false,
      images: false
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          price: data.price !== undefined && data.price !== null ? data.price.toString() : '',
          mrp: data.mrp !== undefined && data.mrp !== null ? data.mrp.toString() : '',
          category_id: data.category_id || '',
          stock_quantity: data.stock_quantity !== undefined && data.stock_quantity !== null ? data.stock_quantity.toString() : '',
          dimensions: data.dimensions || '',
          material: data.material || '',
          weight: data.weight !== undefined && data.weight !== null ? data.weight.toString() : '',
          sku: data.sku || '',
          featured: data.featured || false,
          on_sale: data.on_sale || false,
          order: data.order,
          customization_required: data.customization_required || {
            text: false,
            images: false
          }
        })
        if (data.image_urls) {
          setUploadedImages(data.image_urls)
        }
        if (data.variants) {
          setVariants(data.variants)
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

  const moveImageUp = (index: number) => {
    if (index === 0) return
    const newImages = [...uploadedImages]
    const temp = newImages[index]
    newImages[index] = newImages[index - 1]
    newImages[index - 1] = temp
    setUploadedImages(newImages)
  }

  const moveImageDown = (index: number) => {
    if (index === uploadedImages.length - 1) return
    const newImages = [...uploadedImages]
    const temp = newImages[index]
    newImages[index] = newImages[index + 1]
    newImages[index + 1] = temp
    setUploadedImages(newImages)
  }

  const addVariant = () => {
    setVariants([...variants, {
      id: Math.random().toString(36).substr(2, 9),
      type: '',
      size: '',
      price: parseInt(formData.price || '0', 10),
      mrp: parseInt(formData.mrp || '0', 10),
      images: [],
      stock: 0,
      isActive: true
    }])
  }

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  const removeVariant = (id: string) => {
    if (confirm('Are you sure you want to remove this variant?')) {
      setVariants(variants.filter(v => v.id !== id))
    }
  }

  const handleVariantImageUpload = async (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    setLoading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        const storageRef = ref(storage, `products/variants/${fileName}`)
        await uploadBytes(storageRef, file)
        return await getDownloadURL(storageRef)
      })
      const imageUrls = await Promise.all(uploadPromises)
      setVariants(variants.map(v => v.id === id ? { ...v, images: [...v.images, ...imageUrls] } : v))
    } catch (error) {
      console.error('Error uploading variant images:', error)
      alert('Error uploading variant images')
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }
  
  const removeVariantImage = (variantId: string, imageIndex: number) => {
    setVariants(variants.map(v => v.id === variantId ? {
      ...v,
      images: v.images.filter((_, idx) => idx !== imageIndex)
    } : v))
  }

  const moveVariantImageUp = (variantId: string, imageIndex: number) => {
    if (imageIndex === 0) return
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const newImages = [...v.images]
        const temp = newImages[imageIndex]
        newImages[imageIndex] = newImages[imageIndex - 1]
        newImages[imageIndex - 1] = temp
        return { ...v, images: newImages }
      }
      return v
    }))
  }

  const moveVariantImageDown = (variantId: string, imageIndex: number) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        if (imageIndex === v.images.length - 1) return v
        const newImages = [...v.images]
        const temp = newImages[imageIndex]
        newImages[imageIndex] = newImages[imageIndex + 1]
        newImages[imageIndex + 1] = temp
        return { ...v, images: newImages }
      }
      return v
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const hasAnyImage = uploadedImages.length > 0 || variants.some(v => v.images && v.images.length > 0)

    if (!formData.name || !formData.price || !formData.category_id || !hasAnyImage) {
      setModalState({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please fill in all required fields and upload at least one image (either main or variant)',
        type: 'error'
      })
      return
    }

    setLoading(true)
    try {
      let finalImages = uploadedImages
      if (finalImages.length === 0) {
        const firstVariantWithImage = variants.find(v => v.images && v.images.length > 0)
        if (firstVariantWithImage) {
          finalImages = [firstVariantWithImage.images[0]]
        }
      }

      // Get current product count for order
      const productsSnapshot = await getDocs(collection(db, 'products'))
      const order = productId ? formData.order : productsSnapshot.size

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price, 10),
        mrp: formData.mrp ? parseInt(formData.mrp, 10) : null,
        on_sale: formData.on_sale,
        category_id: formData.category_id,
        stock_quantity: parseInt(formData.stock_quantity as string) || 0,
        dimensions: formData.dimensions,
        material: formData.material,
        weight: formData.weight ? parseFloat(formData.weight as string) : null,
        sku: formData.sku,
        image_urls: finalImages,
        variants: variants,
        featured: formData.featured,
        is_active: true,
        order: order,
        customization_required: formData.customization_required,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Selling Price (₹) *</label>
              <input
                type="number"
                required min="0" step="1"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="form-input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">MRP (₹) - Optional</label>
              <input
                type="number"
                min="0" step="1"
                value={formData.mrp}
                onChange={(e) => setFormData({...formData, mrp: e.target.value})}
                className="form-input"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if same as selling price</p>
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
          <div className="mt-6 flex items-center bg-red-50 p-4 rounded-2xl border border-red-100">
            <input
              type="checkbox"
              id="on_sale"
              checked={formData.on_sale}
              onChange={(e) => setFormData({...formData, on_sale: e.target.checked})}
              className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-600 mr-3"
            />
            <label htmlFor="on_sale" className="text-sm font-bold text-red-800">
              On Sale (Shows &quot;Sale&quot; tag on product cards)
            </label>
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
                min="0" step="1"
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

        {/* Customization Requirements */}
        <div className="premium-card bg-white p-8">
          <h2 className="text-heading-3 text-gray-900 mb-6">Customer Customization Requirements</h2>
          <p className="text-sm text-gray-600 mb-4">Select what customers need to provide when ordering this product</p>
          <div className="space-y-4">
            <div className="flex items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <input
                type="checkbox"
                id="custom_text"
                checked={formData.customization_required.text}
                onChange={(e) => setFormData({
                  ...formData,
                  customization_required: {
                    ...formData.customization_required,
                    text: e.target.checked
                  }
                })}
                className="w-5 h-5 text-brand-blue rounded border-gray-300 focus:ring-brand-blue mr-3"
              />
              <label htmlFor="custom_text" className="text-sm font-bold text-blue-800">
                Custom Text (Customer needs to provide custom text/names)
              </label>
            </div>
            <div className="flex items-center bg-green-50 p-4 rounded-2xl border border-green-100">
              <input
                type="checkbox"
                id="custom_images"
                checked={formData.customization_required.images}
                onChange={(e) => setFormData({
                  ...formData,
                  customization_required: {
                    ...formData.customization_required,
                    images: e.target.checked
                  }
                })}
                className="w-5 h-5 text-brand-green rounded border-gray-300 focus:ring-brand-green mr-3"
              />
              <label htmlFor="custom_images" className="text-sm font-bold text-green-800">
                Custom Images (Customer needs to upload images)
              </label>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="premium-card bg-white p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-heading-3 text-gray-900">Product Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center px-4 py-2 bg-brand-purple text-white rounded-full font-bold text-sm hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Variant
            </button>
          </div>
          
          {variants.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No variants added yet. Add variants for different types, sizes, or colors.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {variants.map((variant, index) => (
                <div key={variant.id} className="p-6 bg-gray-50/80 rounded-3xl border border-gray-200 relative shadow-sm hover:shadow-md transition-shadow">
                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Type / Design / Color</label>
                      <input
                        type="text"
                        value={variant.type}
                        onChange={(e) => updateVariant(variant.id, 'type', e.target.value)}
                        className="form-input text-base rounded-xl"
                        placeholder="e.g., Glossy, Red, Mug"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Size (Optional)</label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                        className="form-input text-base rounded-xl"
                        placeholder="e.g., 12x12, XL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Variant Price (₹)</label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, 'price', parseInt(e.target.value, 10) || 0)}
                        className="form-input text-base rounded-xl"
                        placeholder="0"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Variant MRP (₹)</label>
                      <input
                        type="number"
                        value={variant.mrp || ''}
                        onChange={(e) => updateVariant(variant.id, 'mrp', parseInt(e.target.value, 10) || 0)}
                        className="form-input text-base rounded-xl"
                        placeholder="0"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                      <input
                        type="number"
                        value={variant.stock || 0}
                        onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))}
                        className="form-input text-base rounded-xl"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="inline-flex items-center cursor-pointer bg-white px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
                      <input
                        type="checkbox"
                        checked={variant.isActive !== false}
                        onChange={(e) => updateVariant(variant.id, 'isActive', e.target.checked)}
                        className="w-5 h-5 text-brand-green rounded border-gray-300 focus:ring-brand-green mr-3"
                      />
                      <span className="text-sm font-bold text-gray-700">Active (Visible to customers)</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Variant Images</label>
                    <div className="flex flex-wrap gap-3">
                      {variant.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative group">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img src={img} alt={`Variant ${index} img ${imgIdx}`} className="w-full h-full object-cover" />
                            {imgIdx === 0 && (
                              <div className="absolute top-1 left-1 bg-brand-purple text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                Main
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeVariantImage(variant.id, imgIdx)}
                              className="absolute top-1 right-1 w-6 h-6 bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex justify-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => moveVariantImageUp(variant.id, imgIdx)}
                              disabled={imgIdx === 0}
                              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                              title="Move up"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveVariantImageDown(variant.id, imgIdx)}
                              disabled={imgIdx === variant.images.length - 1}
                              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                              title="Move down"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-brand-purple hover:text-brand-purple transition-all bg-white hover:bg-purple-50 group">
                        <Upload className="w-5 h-5 mb-1 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="text-[10px] font-bold">Upload</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleVariantImageUpload(variant.id, e)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  <div className="relative">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-40 object-cover rounded-2xl shadow-sm border border-gray-100"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-brand-purple text-white text-xs font-bold px-2 py-1 rounded-full">
                        Main
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex justify-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => moveImageUp(index)}
                      disabled={index === 0}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImageDown(index)}
                      disabled={index === uploadedImages.length - 1}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
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
