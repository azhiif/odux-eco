'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MessageCircle, MapPin, Send, Instagram, HelpCircle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/modal'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

const InputField = ({ label, type = 'text', field, placeholder, required = false, isTextarea = false, value, onChange }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
      {label} {required && '*'}
    </label>
    {isTextarea ? (
      <textarea
        required={required}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full px-5 py-4 border-2 border-gray-100 rounded-3xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all"
        placeholder={placeholder}
        rows={5}
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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const messageData = {
        ...formData,
        status: 'unread',
        created_at: new Date().toISOString()
      }

      await addDoc(collection(db, 'contact_messages'), messageData)

      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'CONTACT_MESSAGE', data: formData })
        })
      } catch (notifyErr) {
        console.error('Failed to send notification email', notifyErr)
      }

      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setModalState({
        isOpen: true,
        title: 'Submission Failed',
        message: 'There was an error sending your message. Please try again.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-background pb-16 pt-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="container-premium relative z-10 max-w-6xl">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-50 text-brand-pink rounded-[2rem] mb-6 rotate-3 shadow-sm border border-white">
            <MessageCircle className="w-10 h-10 -rotate-3" />
          </div>
          <h1 className="text-display text-foreground mb-4">Get in <span className="text-brand-pink">Touch</span></h1>
          <p className="text-body-large text-gray-500 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a question about our magical products,
            want to discuss a custom order, or just want to say hello.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="premium-card bg-white p-8 md:p-10 border-2 border-white">
              <h2 className="text-heading-3 text-foreground mb-6">Send a Message</h2>
              
              {success ? (
                <div className="bg-green-50 text-green-600 rounded-3xl p-8 text-center border-2 border-green-100 flex flex-col items-center justify-center h-64">
                  <CheckCircle2 className="w-16 h-16 mb-4 text-green-500" />
                  <h3 className="font-heading text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-sm">Thank you for reaching out. We will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InputField label="Your Name" field="name" required={true} placeholder="John Doe" value={formData.name} onChange={handleInputChange} />
                    <InputField label="Email Address" type="email" field="email" required={true} placeholder="john@example.com" value={formData.email} onChange={handleInputChange} />
                  </div>

                  <InputField label="Phone Number" type="tel" field="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} />

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Subject *</label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-5 py-3 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-brand-pink focus:ring-4 focus:ring-brand-pink/10 bg-gray-50 text-gray-900 font-medium transition-all appearance-none"
                    >
                      <option value="">Select a subject</option>
                      <option value="custom-order">Custom Order Inquiry</option>
                      <option value="product-question">Product Question</option>
                      <option value="shipping">Shipping & Delivery</option>
                      <option value="payment">Payment Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <InputField label="Message" field="message" required={true} isTextarea={true} placeholder="Tell us more about your inquiry..." value={formData.message} onChange={handleInputChange} />

                  <Button type="submit" disabled={loading} className="w-full btn-premium-gold py-6 text-lg rounded-full mt-4">
                    {loading ? (
                      <span className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div> Sending...
                      </span>
                    ) : (
                      <span className="flex items-center"><Send className="w-5 h-5 mr-2" /> Send Message</span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Info & Links */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
            
            <div className="premium-card bg-white p-8">
              <h2 className="text-heading-3 text-foreground mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-pink-50 text-brand-pink rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-sm">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Phone & WhatsApp</h4>
                    <p className="text-gray-600 font-medium">{process.env.NEXT_PUBLIC_CONTACT_PHONE || '+91 9072270271'}</p>
                    <p className="text-xs text-gray-400 font-bold mt-1">Mon-Sat, 10AM-7PM</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-sm">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Email</h4>
                    <p className="text-gray-600 font-medium">{process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@odux.art'}</p>
                    <p className="text-xs text-gray-400 font-bold mt-1">24/7 Support</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-50 text-brand-purple rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Studio</h4>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed">
                      Odux Art Studio<br />
                      Creative District<br />
                      New Delhi, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card bg-gradient-to-br from-brand-purple to-[#312e81] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <h2 className="text-xl font-heading font-bold mb-6 relative z-10">Quick Links</h2>
              <div className="space-y-4 relative z-10">
                <a href="https://wa.me/9072270271" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-[#25D366] text-white px-6 py-4 rounded-full font-bold hover:bg-[#128C7E] hover:scale-105 transition-all shadow-lg">
                  <MessageCircle className="w-5 h-5 mr-2" /> Chat on WhatsApp
                </a>
                <a href="https://instagram.com/odux.art" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] text-white px-6 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-lg">
                  <Instagram className="w-5 h-5 mr-2" /> Follow on Instagram
                </a>
              </div>
            </div>

          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="text-center mb-10">
            <h2 className="text-heading-2 text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-brand-pink transition-colors">
              <div className="flex items-start">
                <HelpCircle className="w-6 h-6 text-brand-pink mr-3 shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">How long does a custom order take?</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">Custom orders typically take 5-7 business days to complete, plus shipping time.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-brand-orange transition-colors">
              <div className="flex items-start">
                <HelpCircle className="w-6 h-6 text-brand-orange mr-3 shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Do you ship internationally?</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">Currently we ship within India. International shipping is coming very soon!</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-brand-purple transition-colors">
              <div className="flex items-start">
                <HelpCircle className="w-6 h-6 text-brand-purple mr-3 shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">We accept all major credit/debit cards, UPI, net banking, and popular wallets securely.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-brand-blue transition-colors">
              <div className="flex items-start">
                <HelpCircle className="w-6 h-6 text-brand-blue mr-3 shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Can I track my order?</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">Yes! You'll receive tracking details immediately once your order ships.</p>
                </div>
              </div>
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
