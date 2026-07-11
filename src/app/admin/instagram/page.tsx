'use client'

import React, { useState, useEffect } from 'react'
import { db, storage } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Instagram, Save, Loader2, Image as ImageIcon, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/modal'
import Image from 'next/image'

export default function AdminInstagramPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [newPostImage, setNewPostImage] = useState('')
  const [newPostUrl, setNewPostUrl] = useState('')
  const [posts, setPosts] = useState<{ imageUrl: string, postUrl: string }[]>([])
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'))
      if (settingsDoc.exists()) {
        const data = settingsDoc.data()
        setPosts(data.instagramPosts || [])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'settings', 'general'), {
        instagramPosts: posts,
        updated_at: new Date().toISOString(),
      })
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Instagram feed updated successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update Instagram feed',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `instagram-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const storageRef = ref(storage, `instagram/${fileName}`)
      
      await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(storageRef)
      setNewPostImage(downloadUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      setModalState({
        isOpen: true,
        title: 'Upload Error',
        message: 'Failed to upload image. Please try again.',
        type: 'error'
      })
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-t-brand-purple border-r-brand-blue border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display text-gray-900 mb-2 flex items-center">
            <Instagram className="h-8 w-8 mr-3 text-brand-pink" />
            Instagram Feed
          </h1>
          <p className="text-gray-500 font-medium">Manage your Instagram posts on the homepage</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 bg-brand-pink hover:bg-pink-600 text-white font-bold rounded-full transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-5 w-5 mr-2" /> Save Changes</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
          <div className="premium-card bg-white p-6 sticky top-24">
            <h2 className="text-heading-3 text-gray-900 mb-6">Add New Post</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Image</label>
                {newPostImage ? (
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={newPostImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setNewPostImage('')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <span className="text-xs font-bold">Clear</span>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-brand-purple transition-all group">
                    {uploadingImage ? (
                      <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-brand-purple mb-2 transition-colors" />
                        <span className="text-sm font-bold text-gray-600 group-hover:text-brand-purple">Click to upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Instagram Post URL</label>
                <input
                  type="text"
                  value={newPostUrl}
                  onChange={(e) => setNewPostUrl(e.target.value)}
                  className="form-input"
                  placeholder="https://instagram.com/p/..."
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const imageUrl = newPostImage.trim()
                  const postUrl = newPostUrl.trim()
                  
                  if (imageUrl && postUrl) {
                    setPosts([...posts, { imageUrl, postUrl }])
                    setNewPostImage('')
                    setNewPostUrl('')
                  } else {
                    setModalState({ isOpen: true, title: 'Error', message: 'Please upload an image and provide the Instagram Post URL', type: 'error' })
                  }
                }}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex justify-center items-center"
              >
                <ImageIcon className="h-4 w-4 mr-2" /> Add to Feed
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <div className="premium-card bg-white p-6">
            <h2 className="text-heading-3 text-gray-900 mb-6">Current Feed</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post, idx) => (
                <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square border-2 border-gray-100 bg-gray-50">
                  <Image src={post.imageUrl} alt="Instagram" fill unoptimized className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <button
                      onClick={() => setPosts(posts.filter((_, i) => i !== idx))}
                      className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                  <Instagram className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-bold">No Instagram posts added yet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
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
