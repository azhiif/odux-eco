'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore'
import { Users, Shield, ShieldAlert, Mail, Calendar, Search, User as UserIcon, Phone, Key, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/modal'

interface UserProfile {
  id: string
  display_name: string
  email: string
  is_admin: boolean
  created_at: any
  phone_number?: string
  phone?: string
  provider?: string
  last_login?: any
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'user_profiles'), orderBy('created_at', 'desc'))
      const snapshot = await getDocs(q)
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[]
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'user_profiles', userId), {
        is_admin: !currentStatus
      })
      await fetchUsers()
      setModalState({
        isOpen: true,
        title: 'Success',
        message: `User is ${currentStatus ? 'no longer' : 'now'} an Admin`,
        type: 'success'
      })
    } catch (error) {
      console.error('Error toggling admin status:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update admin status',
        type: 'error'
      })
    }
  }

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number?.includes(searchTerm)
  )

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
            <Users className="h-8 w-8 mr-3 text-brand-pink" />
            Users
          </h1>
          <p className="text-gray-500 font-medium">Manage registered accounts and admin roles</p>
        </div>
      </div>

      <div className="premium-card bg-white p-6 flex items-center mb-8">
        <Search className="h-5 w-5 text-gray-400 mr-3" />
        <input 
          type="text" 
          placeholder="Search users by name, email, or phone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-gray-700 font-medium"
        />
      </div>

      <div className="premium-card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-100">
                <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider">User Details</th>
                <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Role</th>
                <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Activity & Auth</th>
                <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-gray-500 font-bold">No users found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-pink-50 text-brand-pink flex items-center justify-center font-bold text-lg mr-4 shadow-sm">
                          {user.display_name?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.display_name || 'Anonymous User'}</div>
                          <div className="text-sm font-medium text-gray-500 flex flex-col mt-1 space-y-1">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email || 'No email'}
                            </span>
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone || user.phone_number || 'No phone'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.is_admin ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-brand-purple border border-purple-200">
                          <Shield className="h-3 w-3 mr-1" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                          User
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-500">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center" title="Joined Date">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {user.created_at ? (user.created_at.seconds ? new Date(user.created_at.seconds * 1000).toLocaleDateString() : new Date(user.created_at).toLocaleDateString()) : 'N/A'}
                        </div>
                        <div className="flex items-center" title="Last Login">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {user.last_login ? (user.last_login.seconds ? new Date(user.last_login.seconds * 1000).toLocaleDateString() : new Date(user.last_login).toLocaleDateString()) : 'Never'}
                        </div>
                        <div className="flex items-center" title="Sign-in Provider">
                          <Key className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="capitalize">{user.provider || 'Phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                        className={`inline-flex items-center justify-center px-4 py-2 font-bold rounded-xl transition-colors text-sm ${
                          user.is_admin 
                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' 
                            : 'bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white'
                        }`}
                      >
                        {user.is_admin ? (
                          <><ShieldAlert className="h-4 w-4 mr-2" /> Revoke Admin</>
                        ) : (
                          <><Shield className="h-4 w-4 mr-2" /> Make Admin</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
