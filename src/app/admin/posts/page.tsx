'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { storage, auth } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getPosts, createPost, updatePost, deletePost, generateSlug } from '@/lib/posts'
import { Plus, Edit, Trash2, Eye, EyeOff, FileText, Upload, X, Loader2, Calendar, Tag, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '@/components/ui/modal'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image_url: string
  author_id: string
  author_name: string
  category: string
  tags: string[]
  is_published: boolean
  is_featured: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  })
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  
  const imageInputRef = React.useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    category: '',
    tags: '',
    is_published: false,
    is_featured: false
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const data = await getPosts()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `post-${Date.now()}.${fileExt}`
      const storageRef = ref(storage, `posts/${fileName}`)
      
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      
      setFormData(prev => ({ ...prev, featured_image_url: url }))
    } catch (error) {
      console.error('Error uploading image:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to upload image',
        type: 'error'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const user = auth.currentUser
    if (!user) {
      setModalState({
        isOpen: true,
        title: 'Authentication Required',
        message: 'You must be logged in to create posts',
        type: 'error'
      })
      return
    }

    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        author_id: user.uid,
        author_name: user.displayName || user.email || 'Admin'
      }

      if (editingPost) {
        await updatePost(editingPost.id, postData)
      } else {
        await createPost(postData)
      }
      
      await fetchPosts()
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Post saved successfully!',
        type: 'success'
      })
      resetForm()
    } catch (error) {
      console.error('Error saving post:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Error saving post. Please try again.',
        type: 'error'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featured_image_url: '',
      category: '',
      tags: '',
      is_published: false,
      is_featured: false
    })
    setEditingPost(null)
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image_url: post.featured_image_url,
      category: post.category,
      tags: post.tags.join(', '),
      is_published: post.is_published,
      is_featured: post.is_featured
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      await deletePost(id)
      await fetchPosts()
      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Post deleted successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error deleting post:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: 'Error deleting post. Please try again.',
        type: 'error'
      })
    }
  }

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      await updatePost(id, { is_published: !isPublished })
      await fetchPosts()
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await updatePost(id, { is_featured: !isFeatured })
      await fetchPosts()
    } catch (error) {
      console.error(error)
    }
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title)
    })
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
            <FileText className="h-8 w-8 mr-3 text-brand-blue" />
            Posts
          </h1>
          <p className="text-gray-500 font-medium">Create and manage blog posts and content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Post Form */}
        <div className="xl:col-span-1">
          <div className="premium-card bg-white p-6 sticky top-24">
            <h2 className="text-heading-3 text-gray-900 mb-6">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="form-input"
                  placeholder="Post title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Slug *</label>
                <input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="form-input"
                  placeholder="post-url-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                <input
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="form-input"
                  placeholder="News, Tutorial, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows={2}
                  className="form-input rounded-2xl"
                  placeholder="Brief description..."
                />
              </div>

              {/* Featured Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Featured Image</label>
                <div className="space-y-3">
                  {formData.featured_image_url ? (
                    <div className="relative w-full h-40 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                      <img src={formData.featured_image_url} className="w-full h-full object-cover" alt="Featured preview" />
                      <button type="button" onClick={() => setFormData({...formData, featured_image_url: ''})} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-sm transition-colors hover:bg-red-500 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading} className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/50 transition-all bg-gray-50/50 group">
                      {uploading ? <Loader2 className="h-8 w-8 animate-spin text-brand-blue" /> : (
                        <>
                          <Upload className="h-8 w-8 mb-2 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-xs font-bold">Upload Featured Image</span>
                        </>
                      )}
                    </button>
                  )}
                  <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="form-input"
                  placeholder="react, tutorial, web"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Content *</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={6}
                  className="form-input rounded-2xl font-mono text-sm"
                  placeholder="Write your post content here..."
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex-1">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                    className="w-5 h-5 text-brand-purple rounded border-gray-300 focus:ring-brand-purple mr-2"
                  />
                  <span className="text-sm font-bold text-gray-700">Published</span>
                </label>
                <label className="flex items-center cursor-pointer bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex-1">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="w-5 h-5 text-brand-orange rounded border-gray-300 focus:ring-brand-orange mr-2"
                  />
                  <span className="text-sm font-bold text-gray-700">Featured</span>
                </label>
              </div>

              <div className="flex space-x-2 pt-2">
                <button type="submit" disabled={uploading} className="flex-1 bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 rounded-full transition-colors shadow-md hover:shadow-lg">
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </button>
                {editingPost && (
                  <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-full hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Posts List */}
        <div className="xl:col-span-2 space-y-4">
          {posts.length === 0 ? (
            <div className="premium-card bg-white p-12 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 font-medium">Create your first post to get started.</p>
            </div>
          ) : (
            posts.map((post, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={post.id} className="premium-card bg-white p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                {/* Post Image */}
                {post.featured_image_url && (
                  <div className="w-full md:w-48 h-48 md:h-auto bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Post Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-heading font-bold text-gray-900 truncate">{post.title}</h3>
                          {post.is_featured && (
                            <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-wider rounded-full border border-yellow-200">Featured</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {post.author_name}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> {post.category}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border flex-shrink-0 ${post.is_published ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {post.excerpt && (
                      <p className="text-sm font-medium text-gray-500 mb-4 line-clamp-2">{post.excerpt}</p>
                    )}

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t-2 border-gray-50">
                    <button onClick={() => handleEdit(post)} className="inline-flex items-center px-4 py-2 bg-blue-50 text-brand-blue font-bold rounded-xl hover:bg-brand-blue hover:text-white transition-colors text-sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </button>
                    <button onClick={() => handleTogglePublish(post.id, post.is_published)} className={`inline-flex items-center px-4 py-2 font-bold rounded-xl transition-colors text-sm ${post.is_published ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}>
                      {post.is_published ? <><EyeOff className="h-4 w-4 mr-2" /> Unpublish</> : <><Eye className="h-4 w-4 mr-2" /> Publish</>}
                    </button>
                    <button onClick={() => handleToggleFeatured(post.id, post.is_featured)} className={`inline-flex items-center px-4 py-2 font-bold rounded-xl transition-colors text-sm ${post.is_featured ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      <Tag className="h-4 w-4 mr-2" /> {post.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="inline-flex items-center px-4 py-2 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors text-sm ml-auto">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </button>
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
