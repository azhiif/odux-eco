import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductClient from './product-client'
import { getProductById, getProducts, getRelatedProducts } from '@/lib/products'
import { ProductStructuredData } from '@/components/seo/StructuredData'

export const revalidate = 300 // Revalidate every 5 minutes

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    id: product.id,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const images = product.image_urls?.length 
    ? product.image_urls.map(url => ({
        url,
        width: 1200,
        height: 1200,
        alt: product.name,
      }))
    : []

  return {
    title: `${product.name} | Odux Art`,
    description: product.description,
    alternates: {
      canonical: `https://oduxart.com/products/${product.id}`,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      url: `https://oduxart.com/products/${product.id}`,
      siteName: 'Odux Art',
      images: images,
      locale: 'en_US',
      type: 'website',
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  
  const [product, relatedProducts] = await Promise.all([
    getProductById(id),
    getRelatedProducts(id)
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pb-16 pt-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="container-premium relative z-10">
        <ProductStructuredData
          data={{
            name: product.name,
            description: product.description,
            image: product.image_urls,
            sku: product.sku || product.id,
            brand: 'Odux Art',
            price: product.price,
            priceCurrency: 'INR',
            availability: product.stock_quantity > 0 ? 'InStock' : 'OutOfStock',
            category: product.categories?.name,
          }}
        />
        
        <ProductClient 
          product={product} 
          relatedProducts={relatedProducts} 
        />
      </div>
    </div>
  )
}
