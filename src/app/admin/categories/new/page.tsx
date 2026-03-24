'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { db, storage } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react'

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
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
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
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = () => {
    setUploadedImage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.slug) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      console.log('Creating category with data:', formData)
      console.log('Uploaded image:', uploadedImage)
      
      const categoryData = {
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        image_url: uploadedImage || null,
        is_active: true,
        created_at: new Date().toISOString()
      }

      console.log('Final category data:', categoryData)

      // Only check slug for duplicates in Firestore standard setup safely
      const q = query(collection(db, 'categories'), where('slug', '==', formData.slug))
      const duplicateSnap = await getDocs(q)
      if (!duplicateSnap.empty) {
        alert('A category with this slug already exists')
        setLoading(false)
        return
      }

      const docRef = await addDoc(collection(db, 'categories'), categoryData)

      console.log('Category created successfully:', docRef.id)
      router.push('/admin')
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Error creating category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-black mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Add New Category</h1>
          <p className="text-gray-600">Create a new category for your products</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Category Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g., Birthday Gifts"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="birthday-gifts"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be used in the URL: /categories/{formData.slug}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Describe this category and what types of products it contains..."
                />
              </div>
            </div>
          </div>

          {/* Category Image */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Category Image</h2>
            
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
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Category Image
              </label>
              <p className="text-sm text-gray-500 mt-2">Recommended size: 800x600px, PNG or JPG</p>
            </div>

            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Category preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No image uploaded</p>
                <p className="text-sm text-gray-500 mt-2">Upload an image to represent this category</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link href="/admin">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
