'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore'
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/modal'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('sort_order', 'asc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category))
      setCategories(data)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching categories:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const categoryData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      }

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData)
      } else {
        await addDoc(collection(db, 'categories'), {
          ...categoryData,
          created_at: new Date().toISOString()
        })
      }
      
      await fetchCategories()
      resetForm()
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Category saved successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error saving category:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Error saving category. Please try again.',
        type: 'error'
      })
    }
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', image_url: '', is_active: true, sort_order: 0 })
    setEditingCategory(null)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
      sort_order: category.sort_order
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also affect products in this category.')) return
    try {
      await deleteDoc(doc(db, 'categories', id))
      await fetchCategories()
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Category deleted successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Error deleting category. Please try again.',
        type: 'error'
      })
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'categories', id), { is_active: !isActive })
      await fetchCategories()
    } catch (error) {
      console.error(error)
    }
  }

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
            <Tag className="h-8 w-8 mr-3 text-brand-orange" />
            Categories
          </h1>
          <p className="text-gray-500 font-medium">Organize your product categories</p>
        </div>
        <Link href="/admin/categories/new">
          <button className="bg-gradient-to-r from-brand-orange to-brand-pink text-white px-6 py-3 rounded-full font-bold flex items-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <Plus className="h-5 w-5 mr-2" />
            Advanced Setup
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Add/Edit Form */}
        <div className="lg:col-span-1">
          <div className="premium-card bg-white p-6 sticky top-24">
            <h2 className="text-heading-3 text-gray-900 mb-6">{editingCategory ? 'Edit Category' : 'Quick Add'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value, slug: formData.slug || generateSlug(e.target.value)})}
                  className="form-input"
                  placeholder="e.g., Canvas Prints"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
                <input
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="form-input"
                  placeholder="canvas-prints"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="form-input rounded-2xl"
                  placeholder="Category description..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="form-input"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>
                <div className="flex items-end mb-2">
                  <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 h-[52px]">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5 text-brand-purple rounded border-gray-300 focus:ring-brand-purple mr-2"
                    />
                    <span className="text-sm font-bold text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" className="flex-1 bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 rounded-full transition-colors shadow-md hover:shadow-lg">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                {editingCategory && (
                  <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-full hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          {categories.length === 0 ? (
            <div className="premium-card bg-white p-12 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-500 font-medium">Create your first category using the quick form or advanced setup.</p>
            </div>
          ) : (
            categories.map((category) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={category.id} className="premium-card bg-white p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow border-2 border-white hover:border-orange-50">
                <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-heading font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm font-bold text-gray-400 font-mono mb-1">/{category.slug}</p>
                      {category.description && (
                        <p className="text-sm font-medium text-gray-500 line-clamp-2">{category.description}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                      category.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button onClick={() => handleEdit(category)} className="inline-flex items-center px-4 py-2 bg-blue-50 text-brand-blue font-bold rounded-xl hover:bg-brand-blue hover:text-white transition-colors text-sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button onClick={() => handleToggleActive(category.id, category.is_active)} className={`inline-flex items-center px-4 py-2 font-bold rounded-xl transition-colors text-sm ${category.is_active ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}>
                      {category.is_active ? <><EyeOff className="h-4 w-4 mr-2" /> Deactivate</> : <><Eye className="h-4 w-4 mr-2" /> Activate</>}
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="inline-flex items-center px-4 py-2 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors text-sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                    
                    <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      Sort: {category.sort_order}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
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
