'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { db, storage } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ArrowLeft, Upload, X, Image as ImageIcon, Tag } from 'lucide-react'

export default function NewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `category-${Date.now()}.${fileExt}`
      const storageRef = ref(storage, `categories/${fileName}`)
      
      await uploadBytes(storageRef, file)
      const publicUrl = await getDownloadURL(storageRef)
      setUploadedImage(publicUrl)
    } catch (error) {
      alert('Error uploading image. Please try again.')
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = () => {
    setUploadedImage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.slug) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const categoryData = {
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        image_url: uploadedImage || null,
        is_active: true,
        created_at: new Date().toISOString()
      }

      const q = query(collection(db, 'categories'), where('slug', '==', formData.slug))
      const duplicateSnap = await getDocs(q)
      if (!duplicateSnap.empty) {
        alert('A category with this slug already exists')
        setLoading(false)
        return
      }

      await addDoc(collection(db, 'categories'), categoryData)
      router.push('/admin/categories')
    } catch (error) {
      alert('Error creating category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div className="mb-8">
        <Link href="/admin/categories" className="inline-flex items-center text-gray-400 hover:text-brand-orange mb-4 font-bold transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Link>
        <h1 className="text-display text-gray-900 mb-2 flex items-center">
          <Tag className="h-8 w-8 mr-3 text-brand-orange" />
          Add Category
        </h1>
        <p className="text-gray-500 font-medium">Create a new section for your products.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="premium-card bg-white p-8">
          <h2 className="text-heading-3 text-gray-900 mb-6">Category Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                className="form-input"
                placeholder="e.g., Birthday Gifts"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="form-input"
                placeholder="birthday-gifts"
              />
              <p className="text-sm font-bold text-gray-400 mt-2 font-mono">
                /categories/{formData.slug || 'slug'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="form-input rounded-2xl"
                placeholder="Describe this category..."
              />
            </div>
          </div>
        </div>

        <div className="premium-card bg-white p-8">
          <h2 className="text-heading-3 text-gray-900 mb-6">Category Image</h2>
          
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="category-image-upload"
            />
            <label
              htmlFor="category-image-upload"
              className="cursor-pointer inline-flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 hover:border-brand-orange focus:outline-none transition-colors w-full group"
            >
              <Upload className="h-8 w-8 mb-3 text-gray-400 group-hover:text-brand-orange transition-colors" />
              <span className="font-bold text-gray-700 mb-1">Click to upload image</span>
              <span className="text-sm font-medium text-gray-500">Recommended size: 800x600px</span>
            </label>
          </div>

          {uploadedImage ? (
            <div className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <img
                src={uploadedImage}
                alt="Category preview"
                className="w-full h-64 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center bg-white">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-bold mb-1">No image uploaded</p>
              <p className="text-sm font-medium text-gray-400">Upload a banner image to represent this category</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t-2 border-gray-100">
          <Link href="/admin/categories">
            <button type="button" className="px-6 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  )
}
