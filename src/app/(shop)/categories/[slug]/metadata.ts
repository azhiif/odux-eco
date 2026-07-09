import { Metadata } from 'next'

export function generateCategoryMetadata(category: any): Metadata {
  return {
    title: `${category.name} | Custom Art Frames | Odux Art`,
    description: `Explore our ${category.name} collection. Premium custom art frames perfect for gifting on birthdays, weddings, anniversaries, and special occasions. Handcrafted with love.`,
    keywords: [
      category.name,
      'custom art frames',
      'personalized gifts',
      'wall art',
      'photo frames',
      'birthday gifts',
      'wedding gifts',
      'anniversary gifts',
      'custom artwork',
    ],
    openGraph: {
      title: category.name,
      description: `Explore our ${category.name} collection of custom art frames`,
      images: category.image_url ? [category.image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: category.name,
      description: `Explore our ${category.name} collection of custom art frames`,
      images: category.image_url ? [category.image_url] : [],
    },
  }
}
