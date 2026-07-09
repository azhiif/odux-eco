export function generateCanonicalUrl(path: string): string {
  const baseUrl = 'https://oduxart.com'
  return `${baseUrl}${path}`
}

export function generateAIFriendlyContent(content: string): string {
  // Add clear structure for AI understanding
  const structuredContent = `
    ## Overview
    ${content}

    ## Key Features
    - Premium quality materials
    - Custom artwork creation
    - Fast delivery across India
    - Secure payment options

    ## Why Choose Us
    Expert craftsmanship with attention to detail
  `
  return structuredContent
}

export function generateGeoTargetedContent(location: string): string {
  const geoContent = `
    Serving customers across India with special focus on ${location}.
    Our custom art frames are crafted with love and delivered to your doorstep.
  `
  return geoContent
}

export function generateProductSchema(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_urls,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Odux Art',
        url: 'https://oduxart.com',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
    },
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
