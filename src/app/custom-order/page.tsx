'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { db, storage } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

export default function CustomOrderPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requirements: '',
    size: '',
    budget: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        alert('Please select an image file')
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('Please select an image to upload')
      return
    }

    setUploading(true)
    try {
      // Upload image to Firebase Storage
      const fileExt = selectedFile.name.split('.').pop() || 'jpg'
      const fileName = `custom-orders/${Date.now()}.${fileExt}`
      const storageRef = ref(storage, fileName)
      
      await uploadBytes(storageRef, selectedFile)
      const publicUrl = await getDownloadURL(storageRef)

      // Save order details to Firestore
      const orderData = {
        ...formData,
        image_url: publicUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      }

      await addDoc(collection(db, 'custom_orders'), orderData)

      console.log('Custom order submitted:', orderData)
      
      // Show success message
      alert('Custom order submitted successfully! We will contact you soon.')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        requirements: '',
        size: '',
        budget: ''
      })
      removeFile()
    } catch (error) {
      console.error('Error submitting custom order:', error)
      alert('Error submitting order. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Create Your Custom Art Piece</h1>
          <p className="text-xl text-gray-600">
            Upload your photo and we'll transform it into a beautiful custom artwork
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Upload Your Image</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    className="absolute top-2 right-2 bg-white hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="py-12">
                  <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
            </div>
            
            {!preview && (
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-4"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            )}
          </div>

          {/* Form Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Order Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Describe any special requirements (colors, style, text, etc.)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Size
                  </label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  >
                    <option value="">Select Size</option>
                    <option value="8x10">8" x 10" (20 x 25 cm)</option>
                    <option value="12x16">12" x 16" (30 x 40 cm)</option>
                    <option value="16x20">16" x 20" (40 x 50 cm)</option>
                    <option value="20x24">20" x 24" (50 x 60 cm)</option>
                    <option value="custom">Custom Size</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  >
                    <option value="">Select Budget</option>
                    <option value="500-1000">₹500 - ₹1,000</option>
                    <option value="1000-2000">₹1,000 - ₹2,000</option>
                    <option value="2000-5000">₹2,000 - ₹5,000</option>
                    <option value="5000+">Above ₹5,000</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full bg-black text-white hover:bg-gray-800 py-3"
              >
                {uploading ? 'Submitting...' : 'Submit Custom Order'}
              </Button>
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Upload Your Image</h4>
              <p className="text-sm text-gray-600">Share your precious photo that you want to transform into art</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Add Requirements</h4>
              <p className="text-sm text-gray-600">Tell us about size, style, colors, and any special requests</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Get Your Artwork</h4>
              <p className="text-sm text-gray-600">We'll create your custom piece and deliver it to your doorstep</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
