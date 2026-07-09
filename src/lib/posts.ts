import { db } from './firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore'

export interface Post {
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

export async function getPosts(): Promise<Post[]> {
  try {
    const postsRef = collection(db, 'posts')
    const querySnapshot = await getDocs(postsRef)
    const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))
    
    // Sort by published date (newest first) then created date
    return posts.sort((a, b) => {
      const aDate = a.published_at || a.created_at
      const bDate = b.published_at || b.created_at
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching posts:', error)
    }
    return []
  }
}

export async function getPublishedPosts(): Promise<Post[]> {
  try {
    const q = query(collection(db, 'posts'), where('is_published', '==', true))
    const querySnapshot = await getDocs(q)
    const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))
    
    return posts.sort((a, b) => {
      const aDate = a.published_at || a.created_at
      const bDate = b.published_at || b.created_at
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching published posts:', error)
    }
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const q = query(collection(db, 'posts'), where('slug', '==', slug))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as Post
    }
    return null
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching post by slug:', error)
    }
    return null
  }
}

export async function createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
  try {
    const now = new Date().toISOString()
    const postData = {
      ...post,
      created_at: now,
      updated_at: now,
      published_at: post.is_published ? now : undefined
    }
    
    const docRef = await addDoc(collection(db, 'posts'), postData)
    return { id: docRef.id, ...postData }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating post:', error)
    }
    throw error
  }
}

export async function updatePost(id: string, post: Partial<Post>): Promise<Post> {
  try {
    const postData = {
      ...post,
      updated_at: new Date().toISOString(),
      published_at: post.is_published && !post.published_at ? new Date().toISOString() : post.published_at
    }
    
    const postRef = doc(db, 'posts', id)
    await updateDoc(postRef, postData)
    return { id, ...postData } as Post
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating post:', error)
    }
    throw error
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'posts', id))
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting post:', error)
    }
    throw error
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100)
}
