import React from 'react'
import { Metadata } from 'next'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { OrganizationStructuredData, LocalBusinessStructuredData } from '@/components/seo/StructuredData'
import HomeClient from './home-client'
import { getFeaturedProducts, getProductsByCategory } from '@/lib/products'
import { getCategories } from '@/lib/categories'
import { getActiveBanners } from '@/lib/banners'

export const revalidate = 300 // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Odux Art | Custom Masterpieces & Gifts',
  description: 'Transform your precious memories into stunning custom art frames. Perfect gifts for birthdays, weddings, and anniversaries.',
  alternates: {
    canonical: 'https://oduxart.com',
  },
  openGraph: {
    title: 'Odux Art | Custom Masterpieces & Gifts',
    description: 'Transform your precious memories into stunning custom art frames. Perfect gifts for birthdays, weddings, and anniversaries.',
    url: 'https://oduxart.com',
    siteName: 'Odux Art',
    images: [
      {
        url: 'https://oduxart.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Odux Art',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default async function Home() {
  const [categories, featuredProducts, banners] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getActiveBanners(),
  ])

  // Fetch products for each category
  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      products: await getProductsByCategory(category.id, 10)
    }))
  )

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <OrganizationStructuredData
          data={{
            name: 'Odux Art',
            url: 'https://oduxart.com',
            logo: 'https://oduxart.com/logo.png',
            description: 'Transform your precious memories into stunning custom art frames.',
            address: {
              streetAddress: 'Thayyalingal',
              addressLocality: 'Malappuram',
              addressRegion: 'Kerala',
              postalCode: '676517',
              addressCountry: 'IN',
            },
            contactPoint: {
              telephone: '+91 9072270271',
              contactType: 'customer service',
              email: 'support@odux.art',
            },
            sameAs: ['https://instagram.com/odux.art', 'https://facebook.com/odux.art'],
          }}
        />
        <LocalBusinessStructuredData
          data={{
            name: 'Odux Art',
            url: 'https://oduxart.com',
            logo: 'https://oduxart.com/logo.png',
            description: 'Transform your precious memories into stunning custom art frames.',
            address: {
              streetAddress: 'Thayyalingal',
              addressLocality: 'Malappuram',
              addressRegion: 'Kerala',
              postalCode: '676517',
              addressCountry: 'IN',
            },
            contactPoint: {
              telephone: '+91 9072270271',
              contactType: 'customer service',
              email: 'support@odux.art',
            },
            sameAs: ['https://instagram.com/odux.art', 'https://facebook.com/odux.art'],
          }}
        />

        <HomeClient 
          categories={categories} 
          featuredProducts={featuredProducts} 
          banners={banners}
          categoriesWithProducts={categoriesWithProducts}
        />
      </div>
    </ErrorBoundary>
  )
}
