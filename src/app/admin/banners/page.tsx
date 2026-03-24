'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Button } from '@/components/ui/button'
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/lib/banner'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle: string
  desktop_image_url: string
  mobile_image_url: string
  button_text: string
  button_link: string
  is_active: boolean
  sort_order: number
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<{desktop: boolean, mobile: boolean}>({desktop: false, mobile: false})
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  
  const desktopInputRef = React.useRef<HTMLInputElement>(null)
  const mobileInputRef = React.useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    desktop_image_url: '',
    mobile_image_url: '',
    button_text: '',
    button_link: '',
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const data = await getBanners()
      setBanners(data)
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(prev => ({ ...prev, [type]: true }))
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `banner-${type}-${Date.now()}.${fileExt}`
      const storageRef = ref(storage, `banners/${fileName}`)
      
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      
      setFormData(prev => ({
        ...prev,
        [type === 'desktop' ? 'desktop_image_url' : 'mobile_image_url']: url
      }))
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error)
      alert(`Failed to upload ${type} image`)
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, formData)
      } else {
        await createBanner(formData)
      }
      
      await fetchBanners()
      resetForm()
    } catch (error) {
      console.error('Error saving banner:', error)
      alert('Error saving banner. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      desktop_image_url: '',
      mobile_image_url: '',
      button_text: '',
      button_link: '',
      is_active: true,
      sort_order: 0
    })
    setEditingBanner(null)
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      desktop_image_url: banner.desktop_image_url,
      mobile_image_url: banner.mobile_image_url,
      button_text: banner.button_text || '',
      button_link: banner.button_link || '',
      is_active: banner.is_active,
      sort_order: banner.sort_order
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    
    try {
      await deleteBanner(id)
      await fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert('Error deleting banner. Please try again.')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateBanner(id, { is_active: !isActive })
      await fetchBanners()
    } catch (error) {
      console.error('Error toggling banner:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Manage Banners</h1>
          <p className="text-gray-600">Control the homepage slider banners</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Banner Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-6">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Banner title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <textarea
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Banner subtitle"
                  />
                </div>

                {/* Desktop Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desktop Image *
                  </label>
                  <div className="space-y-3">
                    {formData.desktop_image_url ? (
                      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={formData.desktop_image_url} 
                          className="w-full h-full object-cover" 
                          alt="Desktop preview" 
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, desktop_image_url: ''})}
                          className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white text-red-500 shadow-sm transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => desktopInputRef.current?.click()}
                        disabled={uploading.desktop}
                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-all bg-gray-50/50"
                      >
                        {uploading.desktop ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mb-2" />
                            <span className="text-xs font-medium">Upload Desktop Image</span>
                          </>
                        )}
                      </button>
                    )}
                    <input
                      ref={desktopInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'desktop')}
                    />
                  </div>
                </div>

                {/* Mobile Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Image *
                  </label>
                  <div className="space-y-3">
                    {formData.mobile_image_url ? (
                      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={formData.mobile_image_url} 
                          className="w-full h-full object-cover" 
                          alt="Mobile preview" 
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, mobile_image_url: ''})}
                          className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white text-red-500 shadow-sm transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => mobileInputRef.current?.click()}
                        disabled={uploading.mobile}
                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-purple-500 hover:text-purple-500 transition-all bg-gray-50/50"
                      >
                        {uploading.mobile ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mb-2" />
                            <span className="text-xs font-medium">Upload Mobile Image</span>
                          </>
                        )}
                      </button>
                    )}
                    <input
                      ref={mobileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'mobile')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Shop Now"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.button_link}
                    onChange={(e) => setFormData({...formData, button_link: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="/products"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={uploading.desktop || uploading.mobile}
                    className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {editingBanner ? 'Update' : 'Create'}
                  </Button>
                  {editingBanner && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Banners List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {banners.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
                  <p className="text-gray-500 mb-4">Create your first banner to get started</p>
                </div>
              ) : (
                banners.map((banner) => (
                  <div key={banner.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="gap-6">
                      {/* Banner Preview */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={banner.desktop_image_url}
                            alt={`${banner.title} - Desktop`}
                            className="w-full h-full object-cover"
                          />
                          <p className="text-xs text-center mt-1 text-gray-600">Desktop</p>
                        </div>
                        <div className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={banner.mobile_image_url}
                            alt={`${banner.title} - Mobile`}
                            className="w-full h-full object-cover"
                          />
                          <p className="text-xs text-center mt-1 text-gray-600">Mobile</p>
                        </div>
                      </div>
                      
                      {/* Banner Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{banner.title}</h3>
                            {banner.subtitle && (
                              <p className="text-sm text-gray-600">{banner.subtitle}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            banner.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500 space-y-1">
                          {banner.button_text && (
                            <p>Button: "{banner.button_text}" → {banner.button_link}</p>
                          )}
                          <p>Sort Order: {banner.sort_order}</p>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(banner)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(banner.id, banner.is_active)}
                            className={banner.is_active ? 'text-red-600' : 'text-green-600'}
                          >
                            {banner.is_active ? (
                              <><EyeOff className="h-3 w-3 mr-1" /> Deactivate</>
                            ) : (
                              <><Eye className="h-3 w-3 mr-1" /> Activate</>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(banner.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
