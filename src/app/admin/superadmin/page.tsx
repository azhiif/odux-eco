'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Shield, UserPlus, UserMinus, Crown, Loader2, Search, Mail } from 'lucide-react'
import { getAllSuperAdmins, makeUserSuperAdmin, removeSuperAdminRole } from '@/lib/roles'
import { motion } from 'framer-motion'

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
      console.error('Error fetching users:', error)
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
    } catch {
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
    } catch {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="mb-8">
        <h1 className="text-display text-gray-900 mb-2 flex items-center">
          <Crown className="h-8 w-8 mr-3 text-brand-orange" />
          SuperAdmin
        </h1>
        <p className="text-gray-500 font-medium">Manage superadmin privileges for admin users</p>
      </div>

      <div className="premium-card bg-orange-50/50 border-2 border-orange-100 p-6 flex items-start gap-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
          <Shield className="h-6 w-6 text-brand-orange" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-bold text-gray-900 mb-1">SuperAdmin Privileges</h3>
          <p className="text-gray-600 font-medium text-sm">
            SuperAdmins have full access to all administrative features including banner management, post management, and user role management. Grant these privileges carefully.
          </p>
        </div>
      </div>

      <div className="premium-card bg-white p-6 flex items-center">
        <Search className="h-5 w-5 text-gray-400 mr-3" />
        <input 
          placeholder="Search admins by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-gray-700 font-medium"
        />
      </div>

      <div className="premium-card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-100">
                <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Admin User</th>
                <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Email</th>
                <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold">
                    No admins found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, i) => {
                  const isSuperAdmin = superAdmins.includes(user.uid);
                  return (
                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${isSuperAdmin ? 'bg-gradient-to-br from-brand-orange to-brand-pink' : 'bg-gray-800'}`}>
                            {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-base">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs font-bold text-gray-400 font-mono mt-0.5">ID: {user.uid.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-blue-50 text-brand-blue border border-blue-200">
                            Admin
                          </span>
                          {isSuperAdmin && (
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-orange-50 text-brand-orange border border-orange-200">
                              SuperAdmin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {isSuperAdmin ? (
                          <button
                            onClick={() => handleRemoveSuperAdmin(user.uid)}
                            disabled={actionLoading === user.uid}
                            className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors text-sm"
                          >
                            {actionLoading === user.uid ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <><UserMinus className="h-4 w-4 mr-2" /> Remove</>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMakeSuperAdmin(user.uid)}
                            disabled={actionLoading === user.uid}
                            className="inline-flex items-center justify-center px-4 py-2 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-600 hover:text-white transition-colors text-sm"
                          >
                            {actionLoading === user.uid ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <><UserPlus className="h-4 w-4 mr-2" /> Make SuperAdmin</>
                            )}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
