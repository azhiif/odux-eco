'use client'

import React, { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Save, Sparkles, LogOut, Package, Shield, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Modal } from '@/components/ui/modal'

const InputField = ({ label, icon: Icon, type = 'text', field, disabled = false, value, onChange }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center">
      <Icon className="w-4 h-4 text-brand-pink mr-2" /> {label}
    </label>
    <input
      type={type}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className={`w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 transition-all text-gray-900 font-medium ${
        disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-gray-50'
      }`}
    />
  </div>
)

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  })
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      // Firebase auth initialization might take a moment
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const profileDoc = await getDoc(doc(db, 'user_profiles', user.uid))
          if (profileDoc.exists()) {
            const data = profileDoc.data()
            setProfile({
              first_name: data.first_name || '',
              last_name: data.last_name || '',
              phone: data.phone || '',
              email: user.email || '',
            })
          } else {
            setProfile(prev => ({ ...prev, email: user.email || '' }))
          }
          setLoading(false)
        } else {
          router.push('/auth/login')
        }
      })
      return () => unsubscribe()
    } catch (error) {
      console.error('Error fetching profile:', error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const user = auth.currentUser
      if (user) {
        await updateDoc(doc(db, 'user_profiles', user.uid), {
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        })
        setModalState({
          isOpen: true,
          title: 'Profile Updated',
          message: 'Profile updated successfully! ✨',
          type: 'success'
        })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setModalState({
        isOpen: true,
        title: 'Update Failed',
        message: 'Oops! Something went wrong while saving.',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 border-4 border-t-brand-pink border-r-brand-orange border-b-brand-purple border-l-brand-blue rounded-full mx-auto mb-6"
          />
          <p className="text-brand-purple font-heading text-xl animate-pulse">Loading your profile...</p>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-background pb-16 pt-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="container-premium relative z-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Sidebar / Profile Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="premium-card bg-white p-8 text-center sticky top-8 border-2 border-white">
              <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-[2rem] mx-auto mb-6 flex items-center justify-center rotate-3 border-4 border-white shadow-xl">
                <User className="w-16 h-16 text-brand-pink -rotate-3" />
              </div>
              
              <h2 className="text-heading-3 text-foreground mb-1 line-clamp-1">
                {profile.first_name || 'Magic User'} {profile.last_name}
              </h2>
              <p className="text-sm font-bold text-gray-500 bg-gray-50 rounded-full inline-block px-4 py-1 mb-6">
                {profile.email}
              </p>
              
              <div className="space-y-3">
                <Link href="/orders" className="flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-50 hover:text-brand-pink text-gray-700 font-bold transition-colors group">
                  <Package className="w-5 h-5 mr-3 text-gray-400 group-hover:text-brand-pink" /> My Orders
                </Link>
                <Link href="/profile" className="flex items-center p-4 bg-brand-pink text-white rounded-2xl font-bold shadow-md">
                  <Settings className="w-5 h-5 mr-3" /> Profile Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white font-bold transition-colors group"
                >
                  <LogOut className="w-5 h-5 mr-3 text-red-400 group-hover:text-white" /> Sign Out
                </button>
              </div>
            </div>
          </motion.div>

          {/* Settings Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <div className="premium-card bg-white p-8 md:p-10 border-2 border-white">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-heading-2 text-foreground flex items-center">
                  Profile Details <Sparkles className="w-6 h-6 ml-2 text-brand-orange" />
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <InputField label="First Name" icon={User} field="first_name" value={profile.first_name} onChange={(field: string, val: string) => setProfile({...profile, [field]: val})} />
                <InputField label="Last Name" icon={User} field="last_name" value={profile.last_name} onChange={(field: string, val: string) => setProfile({...profile, [field]: val})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                <InputField label="Email Address" icon={Mail} type="email" field="email" disabled={true} value={profile.email} onChange={() => {}} />
                <InputField label="Phone Number" icon={Phone} type="tel" field="phone" value={profile.phone} onChange={(field: string, val: string) => setProfile({...profile, [field]: val})} />
              </div>

              <div className="mt-8 flex items-center justify-between pt-8 border-t-2 border-gray-100">
                <div className="flex items-center text-sm font-bold text-gray-400">
                  <Shield className="w-4 h-4 mr-2 text-green-500" /> Information is secure
                </div>
                
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="btn-premium-gold px-8 py-6 rounded-full shadow-lg text-lg"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="w-5 h-5 mr-2" /> Save Changes
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
          
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
