import React from 'react'
import { Metadata } from 'next'
import ProductsClient from './products-client'
import { getProducts } from '@/lib/products'
import { getCategories } from '@/lib/categories'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export const revalidate = 300 // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Our Collection | Odux Art Masterpieces',
  description: 'Browse our magical assortment of custom frames, gifts, and masterpieces. Find the perfect gift for every occasion.',
  alternates: {
    canonical: 'https://oduxart.com/products',
  },
  openGraph: {
    title: 'Our Collection | Odux Art Masterpieces',
    description: 'Browse our magical assortment of custom frames, gifts, and masterpieces.',
    url: 'https://oduxart.com/products',
    siteName: 'Odux Art',
    images: [
      {
        url: 'https://oduxart.com/og-collection.jpg',
        width: 1200,
        height: 630,
        alt: 'Odux Art Collection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  // Sort categories alphabetically as was done in client
  categories.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background pt-8 pb-16 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0 pointer-events-none"></div>
        <div className="absolute top-96 left-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0 pointer-events-none"></div>

        <ProductsClient 
          initialProducts={products} 
          categories={categories} 
        />
      </div>
    </ErrorBoundary>
  )
}
