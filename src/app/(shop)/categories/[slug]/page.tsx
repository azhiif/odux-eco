import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryClient from './category-client'
import { getCategories } from '@/lib/categories'
import { getProducts } from '@/lib/products'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'

export const revalidate = 300 // Revalidate every 5 minutes

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const categories = await getCategories()
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} | Odux Art`,
    description: category.description,
    alternates: {
      canonical: `https://oduxart.com/categories/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} | Odux Art`,
      description: category.description,
      url: `https://oduxart.com/categories/${category.slug}`,
      siteName: 'Odux Art',
      images: category.image_url ? [
        {
          url: category.image_url,
          width: 1200,
          height: 630,
          alt: category.name,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts()
  ])

  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    notFound()
  }

  // Filter products by category
  const products = allProducts.filter(p => {
    const pCatId = String(p.category_id || '').trim().toLowerCase()
    const catId = String(category.id || '').trim().toLowerCase()
    return pCatId === catId
  })

  return (
    <div className="min-h-screen bg-background pb-16 pt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute top-[40%] left-0 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <BreadcrumbStructuredData
        data={{
          itemListElement: [
            {
              position: 1,
              name: 'Home',
              item: 'https://oduxart.com'
            },
            {
              position: 2,
              name: 'Categories',
              item: 'https://oduxart.com/categories'
            },
            {
              position: 3,
              name: category.name,
              item: `https://oduxart.com/categories/${category.slug}`
            }
          ]
        }}
      />

      <CategoryClient 
        category={category}
        initialProducts={products}
      />
    </div>
  )
}
