'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore'
import { MessageCircle, Mail, Phone, Calendar, User, Eye, XCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied'
  created_at: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all')

  useEffect(() => {
    fetchMessages()
  }, [filter])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const messagesRef = collection(db, 'contact_messages')
      const q = query(messagesRef, orderBy('created_at', 'desc'))
      
      const messagesSnap = await getDocs(q)
      let docsToProcess = messagesSnap.docs

      if (filter !== 'all') {
        docsToProcess = docsToProcess.filter(doc => doc.data().status === filter)
      }

      const messagesData = docsToProcess.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactMessage[]

      setMessages(messagesData)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'contact_messages', messageId), {
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      await fetchMessages()
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus as any } : null)
      }
    } catch (error) {
      console.error('Error updating message status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-brand-pink text-white border-pink-200 shadow-md'
      case 'read': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'replied': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-t-brand-purple border-r-brand-pink border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-display text-gray-900 mb-2 flex items-center">
            <MessageCircle className="h-8 w-8 mr-3 text-brand-pink" />
            Inbox Messages
          </h1>
          <p className="text-gray-500 font-medium">View and reply to customer inquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'unread', 'read', 'replied'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-colors ${
                filter === status 
                  ? 'bg-brand-pink text-white shadow-md' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="premium-card bg-white p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-10 w-10 text-brand-pink" />
            </div>
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-500 font-medium">When customers send inquiries, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.map((msg, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={msg.id} className="premium-card bg-white p-6 hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer" onClick={() => {
                setSelectedMessage(msg)
                if (msg.status === 'unread') {
                  updateMessageStatus(msg.id, 'read')
                }
              }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold font-heading text-lg">
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-gray-900 text-lg">{msg.name}</h3>
                      <p className="text-xs font-bold text-gray-400">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border shadow-sm ${getStatusBadge(msg.status)}`}>
                    {msg.status}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-brand-purple mb-2">Subject: {msg.subject.replace('-', ' ')}</p>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{msg.message}</p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-4 text-xs font-bold text-gray-400">
                  <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {msg.email}</span>
                  {msg.phone && <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {msg.phone}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b-2 border-gray-50 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                <Mail className="h-5 w-5 text-brand-purple" /> Message Details
              </h2>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold font-heading text-xl shadow-md shrink-0">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-xl">{selectedMessage.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm font-medium text-gray-500">
                    <span className="flex items-center"><Mail className="w-4 h-4 mr-1 text-gray-400" /> {selectedMessage.email}</span>
                    {selectedMessage.phone && <span className="flex items-center"><Phone className="w-4 h-4 mr-1 text-gray-400" /> {selectedMessage.phone}</span>}
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-400" /> {new Date(selectedMessage.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="premium-card bg-pink-50 border-pink-100 p-6">
                <p className="text-sm font-bold text-brand-pink uppercase tracking-wider mb-2">Subject: {selectedMessage.subject.replace('-', ' ')}</p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-gray-100 pt-6">
                <div className="flex gap-2">
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                    className="inline-flex items-center px-6 py-3 bg-brand-purple text-white hover:bg-[#7c3aed] rounded-full font-bold transition-all shadow-md"
                  >
                    Reply via Email
                  </a>
                  {selectedMessage.phone && (
                    <a 
                      href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-[#25D366] text-white hover:bg-[#128C7E] rounded-full font-bold transition-all shadow-md"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
                {selectedMessage.status !== 'replied' && (
                  <button 
                    onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                    className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Mark as Replied
                  </button>
                )}
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
