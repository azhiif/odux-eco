import Script from 'next/script'

interface OrganizationData {
  name: string
  url: string
  logo: string
  description: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  contactPoint: {
    telephone: string
    contactType: string
    email: string
  }
  sameAs: string[]
}

interface ProductData {
  name: string
  description: string
  image: string[]
  price: number
  priceCurrency: string
  availability: string
  brand: string
}

interface FAQData {
  question: string
  answer: string
}

export function OrganizationStructuredData({ data }: { data: OrganizationData }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    address: data.address,
    contactPoint: data.contactPoint,
    sameAs: data.sameAs,
  }

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function ProductStructuredData({ data }: { data: ProductData }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    image: data.image,
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.priceCurrency,
      availability: data.availability,
    },
    brand: {
      '@type': 'Brand',
      name: data.brand,
    },
  }

  return (
    <Script
      id="product-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function FAQStructuredData({ data }: { data: FAQData[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function LocalBusinessStructuredData({ data }: { data: OrganizationData }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    address: data.address,
    telephone: data.contactPoint.telephone,
    email: data.contactPoint.email,
    openingHours: 'Mo-Sa 10:00-19:00',
    priceRange: '$$',
    sameAs: data.sameAs,
  }

  return (
    <Script
      id="local-business-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
