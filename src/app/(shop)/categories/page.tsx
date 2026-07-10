import React from 'react'
import { Metadata } from 'next'
import CategoriesClient from './categories-client'
import { getCategories } from '@/lib/categories'
import { getProducts } from '@/lib/products'

export const revalidate = 300 // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Shop by Category | Odux Art',
  description: 'Browse our magical collections to discover personalized art pieces that capture your special moments.',
  alternates: {
    canonical: 'https://oduxart.com/categories',
  },
  openGraph: {
    title: 'Shop by Category | Odux Art',
    description: 'Browse our magical collections to discover personalized art pieces that capture your special moments.',
    url: 'https://oduxart.com/categories',
    siteName: 'Odux Art',
    locale: 'en_US',
    type: 'website',
  },
}

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts()
  ])

  // Calculate product counts
  const categoriesWithCounts = categories.map(cat => {
    const matchingProducts = products.filter(p => {
      const pCatId = String(p.category_id || '').trim().toLowerCase()
      const catId = String(cat.id || '').trim().toLowerCase()
      return pCatId === catId
    })
    return { ...cat, product_count: matchingProducts.length }
  })
  
  categoriesWithCounts.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="min-h-screen bg-background pb-16 pt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <CategoriesClient categories={categoriesWithCounts} />
    </div>
  )
}
