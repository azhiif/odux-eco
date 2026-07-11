'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { db, storage } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Upload, X, Image as ImageIcon, Sparkles, User, Mail, Phone, PenTool, LayoutTemplate, IndianRupee, Rocket, Heart, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Modal } from '@/components/ui/modal'
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeMessage } from '@/lib/sanitization'

const InputField = ({ label, icon: Icon, type = 'text', field, placeholder, required = true, isTextarea = false, value, onChange }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center">
      <Icon className="w-4 h-4 text-brand-pink mr-2" /> {label} {required && '*'}
    </label>
    {isTextarea ? (
      <textarea
        required={required}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full px-5 py-4 border-2 border-gray-100 rounded-3xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all"
        placeholder={placeholder}
        rows={4}
      />
    ) : (
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all"
        placeholder={placeholder}
      />
    )}
  </div>
)

export default function CustomOrderPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requirements: '',
    size: '',
    budget: ''
  })
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== files.length) {
      setModalState({
        isOpen: true,
        title: 'Invalid File',
        message: 'Some files were skipped. Please select valid image files (JPG, PNG).',
        type: 'error'
      })
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
      
      const newPreviews = validFiles.map(file => {
        const reader = new FileReader()
        return new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      })
      
      Promise.all(newPreviews).then(results => {
        setPreviews(prev => [...prev, ...results])
      })
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0) {
      setModalState({
        isOpen: true,
        title: 'Missing Image',
        message: 'Please select at least one image to upload for your custom order.',
        type: 'error'
      })
      return
    }

    setUploading(true)
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `custom-orders/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const storageRef = ref(storage, fileName)
        
        await uploadBytes(storageRef, file)
        return await getDownloadURL(storageRef)
      })

      const publicUrls = await Promise.all(uploadPromises)

      // Sanitize all inputs before storing
      const orderData = {
        name: sanitizeString(formData.name),
        email: sanitizeEmail(formData.email),
        phone: sanitizePhone(formData.phone),
        requirements: sanitizeMessage(formData.requirements),
        size: sanitizeString(formData.size),
        budget: sanitizeString(formData.budget),
        image_urls: publicUrls, // Changed to array
        status: 'pending',
        created_at: new Date().toISOString()
      }

      await addDoc(collection(db, 'custom_orders'), orderData)
      
      // Trigger Admin Email Notification
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'CUSTOM_ORDER',
            data: {
              name: orderData.name,
              email: orderData.email,
              phone: orderData.phone,
              budget: orderData.budget,
              size: orderData.size,
              requirements: orderData.requirements,
              image_url: publicUrls[0] // just pass first one for notification if needed
            }
          })
        })
      } catch (err) {
        console.error('Failed to send notification email', err)
      }

      setModalState({
        isOpen: true,
        title: 'Order Received!',
        message: 'Your custom order has been submitted successfully! We will contact you soon.',
        type: 'success'
      })
      
      setFormData({ name: '', email: '', phone: '', requirements: '', size: '', budget: '' })
      setSelectedFiles([])
      setPreviews([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Error submitting custom order:', error)
      setModalState({
        isOpen: true,
        title: 'Submission Failed',
        message: 'There was an error submitting your order. Please try again.',
        type: 'error'
      })
    } finally {
      setUploading(false)
    }
  }



  return (
    <div className="min-h-screen bg-background pb-16 pt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="container-premium relative z-10 max-w-5xl">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-pink-50 rounded-full mb-4 border-2 border-pink-100">
            <Sparkles className="h-5 w-5 text-brand-pink mr-2" />
            <span className="text-brand-purple font-bold tracking-wide">Bring Your Vision to Life</span>
          </div>
          <h1 className="text-display text-foreground mb-4">Create Your <span className="text-brand-pink">Custom Art</span></h1>
          <p className="text-body-large text-gray-500 max-w-2xl mx-auto">
            Upload your favorite photo and tell us exactly how you want it transformed. Our artists will craft a masterpiece just for you!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-start">
          
          {/* Upload Section (Left, smaller col) */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <div className="premium-card bg-white p-6 md:p-8 sticky top-8 text-center">
              <h2 className="text-heading-3 text-brand-purple mb-6 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 mr-2 text-brand-pink" /> 1. Your Photo
              </h2>
              
              <div className="space-y-4">
                <div 
                  className={`relative rounded-3xl border-4 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer
                    border-gray-200 bg-gray-50 hover:bg-pink-50 hover:border-brand-pink`}
                  style={{ height: '200px' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center p-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-brand-pink">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 font-bold mb-2">Tap to upload magic</p>
                    <p className="text-xs text-gray-400 font-medium px-4">Select one or more images</p>
                  </div>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                </div>
                
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {previews.map((previewUrl, index) => (
                      <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-square rounded-2xl overflow-hidden shadow-md group">
                        <Image src={previewUrl} alt={`Preview ${index + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                            className="bg-white text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full p-2 shadow-xl"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Form Section (Right, larger col) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="premium-card bg-white p-6 md:p-10">
              <h2 className="text-heading-3 text-brand-purple mb-8 flex items-center">
                <PenTool className="w-6 h-6 mr-2 text-brand-orange" /> 2. Order Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InputField label="Your Name" icon={User} field="name" placeholder="John Doe" value={formData.name} onChange={(field: string, val: string) => setFormData({...formData, [field]: val})} />
                <InputField label="Email Address" icon={Mail} type="email" field="email" placeholder="john@example.com" value={formData.email} onChange={(field: string, val: string) => setFormData({...formData, [field]: val})} />
              </div>

              <InputField label="Phone Number" icon={Phone} type="tel" field="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={(field: string, val: string) => setFormData({...formData, [field]: val})} />

              <InputField label="Special Requirements" icon={Sparkles} field="requirements" placeholder="Tell us about the style, colors, or any text you want included..." isTextarea={true} required={false} value={formData.requirements} onChange={(field: string, val: string) => setFormData({...formData, [field]: val})} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-8">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center">
                    <LayoutTemplate className="w-4 h-4 text-brand-pink mr-2" /> Preferred Size
                  </label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all appearance-none"
                  >
                    <option value="">Select Size</option>
                    <option value="8x10">8" x 10" (20 x 25 cm)</option>
                    <option value="12x16">12" x 16" (30 x 40 cm)</option>
                    <option value="16x20">16" x 20" (40 x 50 cm)</option>
                    <option value="20x24">20" x 24" (50 x 60 cm)</option>
                    <option value="custom">Custom Size</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center">
                    <IndianRupee className="w-4 h-4 text-brand-pink mr-2" /> Budget Range
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all appearance-none"
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
                disabled={uploading || selectedFiles.length === 0}
                className="w-full btn-premium-gold py-6 text-lg rounded-full shadow-[0_10px_30px_rgba(255,71,126,0.3)] hover:shadow-[0_15px_40px_rgba(255,71,126,0.4)]"
              >
                {uploading ? (
                  <span className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Crafting Magic...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Rocket className="w-5 h-5 mr-2" /> Submit Custom Order
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* How It Works Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20">
          <h2 className="text-heading-2 text-center text-foreground mb-10">How It <span className="text-brand-pink">Works</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card bg-white p-8 text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-pink-50 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm border border-pink-100">
                <Upload className="w-8 h-8 text-brand-pink" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-800 mb-3">1. Share Your Vision</h3>
              <p className="text-gray-600 text-sm">Upload a high-quality photo and tell us exactly how you want it to look.</p>
            </div>

            <div className="premium-card bg-white p-8 text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl -rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm border border-purple-100">
                <Star className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-800 mb-3">2. Magic Happens</h3>
              <p className="text-gray-600 text-sm">Our expert artists will get to work, crafting a unique piece just for you.</p>
            </div>

            <div className="premium-card bg-white p-8 text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
                <Heart className="w-8 h-8 text-brand-orange" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-800 mb-3">3. Treasure Forever</h3>
              <p className="text-gray-600 text-sm">We securely package and ship your one-of-a-kind artwork directly to your door.</p>
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
