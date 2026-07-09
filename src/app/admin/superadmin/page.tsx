'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'
import { Shield, UserPlus, UserMinus, Crown, Loader2, Search, Mail, Check, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getAllSuperAdmins, makeUserSuperAdmin, removeSuperAdminRole, getUserProfile } from '@/lib/roles'

interface UserProfile {
  uid: string
  email: string
  first_name: string
  last_name: string
  is_admin: boolean
  is_superadmin: boolean
  created_at: string
}

export default function SuperAdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [superAdmins, setSuperAdmins] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchSuperAdmins()
  }, [])

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'user_profiles'), where('is_admin', '==', true))
      const snapshot = await getDocs(q)
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile)
      setUsers(usersData)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching users:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchSuperAdmins = async () => {
    const superAdmins = await getAllSuperAdmins()
    setSuperAdmins(superAdmins.map(sa => sa.uid))
  }

  const handleMakeSuperAdmin = async (uid: string) => {
    setActionLoading(uid)
    try {
      await makeUserSuperAdmin(uid)
      await fetchSuperAdmins()
      await fetchUsers()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error making superadmin:', error)
      }
      alert('Error making user superadmin')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveSuperAdmin = async (uid: string) => {
    if (!confirm('Are you sure you want to remove superadmin privileges from this user?')) return
    
    setActionLoading(uid)
    try {
      await removeSuperAdminRole(uid)
      await fetchSuperAdmins()
      await fetchUsers()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing superadmin:', error)
      }
      alert('Error removing superadmin role')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">SuperAdmin Management</h1>
        </div>
        <p className="text-gray-600">Manage superadmin privileges for admin users</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users List */}
      <Card>
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-600">
          <div className="col-span-4">User</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Admin</div>
          <div className="col-span-2">SuperAdmin</div>
          <div className="col-span-1">Actions</div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No users found matching your search
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.uid}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 items-center"
            >
              <div className="col-span-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-xs text-gray-500">ID: {user.uid.slice(0, 8)}...</div>
                  </div>
                </div>
              </div>

              <div className="col-span-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>

              <div className="col-span-2">
                {user.is_admin ? (
                  <Badge variant="success">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </div>

              <div className="col-span-2">
                {superAdmins.includes(user.uid) ? (
                  <Badge variant="warning">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </div>

              <div className="col-span-1">
                {superAdmins.includes(user.uid) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveSuperAdmin(user.uid)}
                    disabled={actionLoading === user.uid}
                    className="text-red-600"
                  >
                    {actionLoading === user.uid ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMakeSuperAdmin(user.uid)}
                    disabled={actionLoading === user.uid}
                    className="text-green-600"
                  >
                    {actionLoading === user.uid ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Info Box */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">SuperAdmin Privileges</p>
              <p className="text-xs">
                SuperAdmins have full access to all administrative features including banner management, post management, and user role management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
