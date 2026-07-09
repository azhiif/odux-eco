'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { storage, auth } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getPosts, createPost, updatePost, deletePost, generateSlug } from '@/lib/posts'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, FileText, Upload, X, Loader2, Calendar, Tag, User } from 'lucide-react'

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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching posts:', error)
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error uploading image:', error)
      }
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const user = auth.currentUser
    if (!user) {
      alert('You must be logged in to create posts')
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
      resetForm()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving post:', error)
      }
      alert('Error saving post. Please try again.')
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
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting post:', error)
      }
      alert('Error deleting post. Please try again.')
    }
  }

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      await updatePost(id, { is_published: !isPublished })
      await fetchPosts()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling post publish status:', error)
      }
    }
  }

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await updatePost(id, { is_featured: !isFeatured })
      await fetchPosts()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling post featured status:', error)
      }
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/dashboard" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-4 group transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Manage Posts</span>
            </h1>
            <p className="text-gray-600">Create and manage blog posts and content</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Post Form */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <Input
                        required
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Post title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug *
                      </label>
                      <Input
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        placeholder="post-url-slug"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <Input
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        placeholder="News, Tutorial, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Excerpt
                      </label>
                      <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description of the post"
                      />
                    </div>

                    {/* Featured Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image
                      </label>
                      <div className="space-y-3">
                        {formData.featured_image_url ? (
                          <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <img 
                              src={formData.featured_image_url} 
                              className="w-full h-full object-cover" 
                              alt="Featured preview" 
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, featured_image_url: ''})}
                              className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white text-red-500 shadow-sm transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={uploading}
                            className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all bg-gray-50/50"
                          >
                            {uploading ? (
                              <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                              <>
                                <Upload className="h-8 w-8 mb-2" />
                                <span className="text-xs font-medium">Upload Featured Image</span>
                              </>
                            )}
                          </button>
                        )}
                        <input
                          ref={imageInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                      </label>
                      <Input
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="react, tutorial, web"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <textarea
                        required
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        rows={8}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Write your post content here..."
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_published}
                          onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Published</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Featured</span>
                      </label>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={uploading}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        {editingPost ? 'Update' : 'Publish'}
                      </Button>
                      {editingPost && (
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Posts List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                      <p className="text-gray-500 mb-4">Create your first post to get started</p>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          {/* Post Image */}
                          {post.featured_image_url && (
                            <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={post.featured_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Post Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold truncate">{post.title}</h3>
                                  {post.is_featured && (
                                    <Badge variant="warning">Featured</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {post.author_name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(post.created_at).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {post.category}
                                  </span>
                                </div>
                              </div>
                              <Badge variant={post.is_published ? 'success' : 'secondary'}>
                                {post.is_published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>

                            {post.excerpt && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                            )}

                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {post.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{post.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(post)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTogglePublish(post.id, post.is_published)}
                                className={post.is_published ? 'text-gray-600' : 'text-green-600'}
                              >
                                {post.is_published ? (
                                  <><EyeOff className="h-3 w-3 mr-1" /> Unpublish</>
                                ) : (
                                  <><Eye className="h-3 w-3 mr-1" /> Publish</>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleFeatured(post.id, post.is_featured)}
                                className={post.is_featured ? 'text-yellow-600' : 'text-gray-600'}
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {post.is_featured ? 'Unfeature' : 'Feature'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(post.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
