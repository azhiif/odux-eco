'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/lib/banner'
import { Image as ImageIcon, Plus, Edit, Trash2, Camera, Upload, Eye, EyeOff, X, Loader2, PlaySquare, ChevronUp, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/modal'

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
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })
  
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
      // Sort banners by sort_order
      setBanners(data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const moveBannerUp = async (index: number) => {
    if (index === 0) return
    const newBanners = [...banners]
    const temp = newBanners[index]
    newBanners[index] = newBanners[index - 1]
    newBanners[index - 1] = temp
    
    newBanners.forEach((banner, idx) => {
      banner.sort_order = idx
    })
    
    setBanners(newBanners)
    
    try {
      await updateBanner(newBanners[index].id, { sort_order: index })
      await updateBanner(newBanners[index - 1].id, { sort_order: index - 1 })
    } catch (error) {
      console.error('Error updating banner order:', error)
    }
  }

  const moveBannerDown = async (index: number) => {
    if (index === banners.length - 1) return
    const newBanners = [...banners]
    const temp = newBanners[index]
    newBanners[index] = newBanners[index + 1]
    newBanners[index + 1] = temp
    
    newBanners.forEach((banner, idx) => {
      banner.sort_order = idx
    })
    
    setBanners(newBanners)
    
    try {
      await updateBanner(newBanners[index].id, { sort_order: index })
      await updateBanner(newBanners[index + 1].id, { sort_order: index + 1 })
    } catch (error) {
      console.error('Error updating banner order:', error)
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
      
      setFormData(prev => ({ ...prev, [type === 'desktop' ? 'desktop_image_url' : 'mobile_image_url']: url }))
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: `Failed to upload ${type} image`,
        type: 'error'
      })
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
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Banner saved successfully!',
        type: 'success'
      })
      resetForm()
    } catch (error) {
      console.error('Error saving banner:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Error saving banner. Please try again.',
        type: 'error'
      })
    } finally { }
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
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Banner deleted successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error deleting banner:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Error deleting banner. Please try again.',
        type: 'error'
      })
    } finally { }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateBanner(id, { is_active: !isActive })
      await fetchBanners()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-t-brand-purple border-r-brand-blue border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-display text-gray-900 mb-2 flex items-center">
            <PlaySquare className="h-8 w-8 mr-3 text-brand-purple" />
            Banners
          </h1>
          <p className="text-gray-500 font-medium">Control the homepage slider banners</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Banner Form */}
        <div className="xl:col-span-1">
          <div className="premium-card bg-white p-6 sticky top-24">
            <h2 className="text-heading-3 text-gray-900 mb-6">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  placeholder="Banner title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle</label>
                <textarea
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  rows={2}
                  className="form-input rounded-2xl"
                  placeholder="Banner subtitle"
                />
              </div>

              {/* Desktop Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Desktop Image *</label>
                <div className="space-y-3">
                  {formData.desktop_image_url ? (
                    <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                      <img src={formData.desktop_image_url} className="w-full h-full object-cover" alt="Desktop preview" />
                      <button type="button" onClick={() => setFormData({...formData, desktop_image_url: ''})} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-sm transition-colors hover:bg-red-500 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => desktopInputRef.current?.click()} disabled={uploading.desktop} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-brand-purple hover:text-brand-purple hover:bg-purple-50/50 transition-all bg-gray-50/50 group">
                      {uploading.desktop ? <Loader2 className="h-8 w-8 animate-spin text-brand-purple" /> : (
                        <>
                          <Upload className="h-8 w-8 mb-2 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-xs font-bold">Upload Desktop Image</span>
                        </>
                      )}
                    </button>
                  )}
                  <input ref={desktopInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'desktop')} />
                </div>
              </div>

              {/* Mobile Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Image *</label>
                <div className="space-y-3">
                  {formData.mobile_image_url ? (
                    <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                      <img src={formData.mobile_image_url} className="w-full h-full object-cover" alt="Mobile preview" />
                      <button type="button" onClick={() => setFormData({...formData, mobile_image_url: ''})} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-sm transition-colors hover:bg-red-500 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => mobileInputRef.current?.click()} disabled={uploading.mobile} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-brand-purple hover:text-brand-purple hover:bg-purple-50/50 transition-all bg-gray-50/50 group">
                      {uploading.mobile ? <Loader2 className="h-8 w-8 animate-spin text-brand-purple" /> : (
                        <>
                          <Upload className="h-8 w-8 mb-2 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-xs font-bold">Upload Mobile Image</span>
                        </>
                      )}
                    </button>
                  )}
                  <input ref={mobileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'mobile')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Button Text</label>
                  <input
                    value={formData.button_text}
                    onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                    className="form-input"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Button Link</label>
                  <input
                    value={formData.button_link}
                    onChange={(e) => setFormData({...formData, button_link: e.target.value})}
                    className="form-input"
                    placeholder="/products"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>
                <div className="flex items-end mb-2">
                  <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 h-[52px]">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5 text-brand-purple rounded border-gray-300 focus:ring-brand-purple mr-2"
                    />
                    <span className="text-sm font-bold text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" disabled={uploading.desktop || uploading.mobile} className="flex-1 bg-brand-purple hover:bg-purple-700 text-white font-bold py-3 rounded-full transition-colors shadow-md hover:shadow-lg">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
                {editingBanner && (
                  <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-full hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Banners List */}
        <div className="xl:col-span-2 space-y-4">
          {banners.length === 0 ? (
            <div className="premium-card bg-white p-12 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No banners yet</h3>
              <p className="text-gray-500 font-medium">Create your first banner to feature on the homepage.</p>
            </div>
          ) : (
            banners.map((banner, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={banner.id} className="premium-card bg-white p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Banner Preview */}
                  <div className="w-full md:w-64 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 flex-shrink-0">
                    <div className="w-full h-32 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative group">
                      <img src={banner.desktop_image_url} alt={`${banner.title} - Desktop`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-xs uppercase tracking-wider">Desktop</span>
                      </div>
                    </div>
                    <div className="w-full h-32 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative group sm:hidden md:block">
                      <img src={banner.mobile_image_url} alt={`${banner.title} - Mobile`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-xs uppercase tracking-wider">Mobile</span>
                      </div>
                    </div>
                  </div>

                  {/* Banner Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-2xl font-heading font-bold text-gray-900 mb-1">{banner.title}</h3>
                          {banner.subtitle && <p className="text-gray-500 font-medium">{banner.subtitle}</p>}
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${banner.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {banner.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        {banner.button_text && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Link:</span>
                            <span className="bg-white px-3 py-1 rounded-lg text-sm font-bold text-brand-purple border border-gray-200">
                              {banner.button_text} → {banner.button_link}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order:</span>
                          <span className="text-sm font-bold text-gray-900 mr-4">{banner.sort_order}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveBannerUp(i)}
                              disabled={i === 0}
                              className="w-7 h-7 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-md flex items-center justify-center transition-colors border border-gray-200"
                              title="Move up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => moveBannerDown(i)}
                              disabled={i === banners.length - 1}
                              className="w-7 h-7 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-md flex items-center justify-center transition-colors border border-gray-200"
                              title="Move down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-6">
                      <button onClick={() => handleEdit(banner)} className="inline-flex items-center px-4 py-2 bg-blue-50 text-brand-blue font-bold rounded-xl hover:bg-brand-blue hover:text-white transition-colors text-sm">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </button>
                      <button onClick={() => handleToggleActive(banner.id, banner.is_active)} className={`inline-flex items-center px-4 py-2 font-bold rounded-xl transition-colors text-sm ${banner.is_active ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}>
                        {banner.is_active ? <><EyeOff className="h-4 w-4 mr-2" /> Deactivate</> : <><Eye className="h-4 w-4 mr-2" /> Activate</>}
                      </button>
                      <button onClick={() => handleDelete(banner.id)} className="inline-flex items-center px-4 py-2 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors text-sm ml-auto">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

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
