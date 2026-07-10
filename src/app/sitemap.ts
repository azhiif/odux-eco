import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products'
import { getCategories } from '@/lib/categories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oduxart.com'

  // Fetch all dynamic data
  const products = await getProducts()
  const categories = await getCategories()

  // Static routes
  const staticRoutes = [
    '',
    '/products',
    '/categories',
    '/about',
    '/contact',
    '/custom-order',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic product routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Dynamic category routes
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
