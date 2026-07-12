export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // For Firebase Storage images, append width parameter to satisfy Next.js requirements
  // Firebase Storage ignores unknown parameters so this won't break the image
  if (src.includes('firebasestorage.googleapis.com')) {
    const separator = src.includes('?') ? '&' : '?'
    return `${src}${separator}w=${width}${quality ? `&q=${quality}` : ''}`
  }
  
  // For other images, use default Next.js optimization
  const params = [`w=${width}`]
  if (quality) {
    params.push(`q=${quality}`)
  }
  return `${src}?${params.join('&')}`
}
