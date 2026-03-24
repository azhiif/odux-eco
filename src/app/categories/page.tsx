'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

interface Category {
  id: string
  name: string
  description: string
  slug: string
  image_url?: string
  product_count?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...')
      const categoriesQ = query(
        collection(db, 'categories'),
        where('is_active', '==', true)
      )
      const categoriesSnap = await getDocs(categoriesQ)
      const categoriesList = categoriesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category))
      console.log('Categories loaded:', categoriesList.length)

      console.log('Fetching all active products for counting...')
      const productsQ = query(
        collection(db, 'products'),
        where('is_active', '==', true)
      )
      const productsSnap = await getDocs(productsQ)
      const allProducts = productsSnap.docs.map(doc => doc.data())
      console.log('Total active products loaded:', allProducts.length)

      const categoriesData = categoriesList.map(cat => {
        const matchingProducts = allProducts.filter(p => {
          const pCatId = String(p.category_id || '').trim().toLowerCase()
          const catId = String(cat.id || '').trim().toLowerCase()
          return pCatId === catId
        })
        const count = matchingProducts.length
        console.log(`Matching for ${cat.name} (${cat.id}): found ${count} products`)
        return {
          ...cat,
          product_count: count
        }
      })
      
      // Sort by name
      categoriesData.sort((a, b) => a.name.localeCompare(b.name))
      
      setCategories(categoriesData)
      console.log('Categories with counts:', categoriesData.map(c => `${c.name}: ${c.product_count}`).join(', '))
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find the perfect gift for every occasion. Browse our categories to discover personalized art pieces that capture your special moments.
        </p>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No categories available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-4">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl text-gray-500">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-gray-500">{category.name}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white text-black px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                      Shop Now
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-black transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {category.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Featured Categories */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                <h4 className="font-medium mb-1">{category.name}</h4>
                <p className="text-sm text-gray-600">{category.product_count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Need Help Choosing?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Not sure which category to explore? Contact our team for personalized recommendations based on your occasion and preferences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/9072270271"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors inline-flex items-center justify-center"
          >
            WhatsApp Us
          </a>
          <Link href="/contact" className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center justify-center">
            Contact Form
          </Link>
        </div>
      </div>
    </div>
  )
}
