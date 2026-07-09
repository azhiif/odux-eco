import { Metadata } from 'next'

export function generateProductMetadata(product: any): Metadata {
  return {
    title: `${product.name} | Custom Art Frame | Odux Art`,
    description: product.description || `Beautiful ${product.name} custom art frame. Perfect for gifting on special occasions. Premium quality, fast delivery across India.`,
    keywords: [
      product.name,
      'custom art frame',
      'personalized gift',
      'wall art',
      'photo frame',
      'birthday gift',
      'wedding gift',
      'anniversary gift',
      'custom artwork',
    ],
    openGraph: {
      title: product.name,
      description: product.description || `Beautiful ${product.name} custom art frame`,
      images: product.image_urls?.[0] ? [product.image_urls[0]] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `Beautiful ${product.name} custom art frame`,
      images: product.image_urls?.[0] ? [product.image_urls[0]] : [],
    },
  }
}
