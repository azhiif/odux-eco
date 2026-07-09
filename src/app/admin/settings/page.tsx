'use client'

import React, { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Settings, Save, Loader2, Shield, Bell, Palette, Globe, Mail, Phone, Instagram, Facebook } from 'lucide-react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/modal'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'Odux Art',
    contactEmail: 'support@odux.art',
    contactPhone: '+91 9072270271',
    socialInstagram: '@odux.art',
    socialFacebook: '',
    enableNotifications: true,
  })
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
        setSettings(settingsDoc.data() as any)
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
        ...settings,
        updated_at: new Date().toISOString(),
      })
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Settings saved successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save settings',
        type: 'error'
      })
    } finally {
      setSaving(false)
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
            <Settings className="h-8 w-8 mr-3 text-brand-purple" />
            Settings
          </h1>
          <p className="text-gray-500 font-medium">Manage your site configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 bg-brand-purple hover:bg-purple-700 text-white font-bold rounded-full transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-5 w-5 mr-2" /> Save Settings</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="premium-card bg-white p-6 h-full">
            <h2 className="text-heading-3 text-gray-900 mb-6 flex items-center">
              <div className="w-10 h-10 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center mr-4">
                <Palette className="h-5 w-5" />
              </div>
              General Information
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-gray-400" /> Site Name
                </label>
                <input
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" /> Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" /> Contact Phone
                </label>
                <input
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Social Settings */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="premium-card bg-white p-6">
              <h2 className="text-heading-3 text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-pink-50 text-brand-pink rounded-xl flex items-center justify-center mr-4">
                  <Bell className="h-5 w-5" />
                </div>
                Social Media
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <Instagram className="h-4 w-4 mr-2 text-gray-400" /> Instagram Handle
                  </label>
                  <input
                    value={settings.socialInstagram}
                    onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                    className="form-input"
                    placeholder="@username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <Facebook className="h-4 w-4 mr-2 text-gray-400" /> Facebook URL
                  </label>
                  <input
                    value={settings.socialFacebook}
                    onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                    className="form-input"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security & Notifications */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="premium-card bg-white p-6">
              <h2 className="text-heading-3 text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center mr-4">
                  <Shield className="h-5 w-5" />
                </div>
                Preferences
              </h2>
              
              <label className="flex items-start cursor-pointer bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                    className="w-5 h-5 text-brand-purple rounded border-gray-300 focus:ring-brand-purple mr-4"
                  />
                </div>
                <div>
                  <span className="text-base font-bold text-gray-900 block mb-1">Enable Notifications</span>
                  <span className="text-sm font-medium text-gray-500">Receive email notifications for new orders, customer inquiries, and system alerts.</span>
                </div>
              </label>
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
