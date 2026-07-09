'use client'

import React, { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Settings, Save, Loader2, Shield, Bell, Palette } from 'lucide-react'

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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching settings:', error)
      }
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
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving settings:', error)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Settings className="h-8 w-8 mr-3" />
          Settings
        </h1>
        <p className="text-gray-600">Manage your site configuration</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Site Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Email</label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Phone</label>
              <Input
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instagram Handle</label>
              <Input
                value={settings.socialInstagram}
                onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Facebook URL</label>
              <Input
                value={settings.socialFacebook}
                onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable Notifications</h3>
                <p className="text-sm text-gray-600">Receive email notifications for new orders</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
