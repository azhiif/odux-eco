import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 section-spacing-sm">
      <div className="container-premium">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img 
                src="https://iili.io/FP5RC4R.png" 
                alt="Odux Art Logo" 
                className="h-10 mb-4" 
              />
              <h3 className="font-heading text-heading-3 text-gray-900 mb-3">Odux Art</h3>
            </div>
            <p className="text-body text-gray-600 mb-6 leading-relaxed">
              Transform your precious moments into timeless art pieces with our custom frames and personalized gifts.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://wa.me/9072270271" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-[#C5A46D] transition-colors duration-300 group"
              >
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-body-small font-medium">WhatsApp</span>
                </div>
              </a>
              <a 
                href="https://instagram.com/odux.art" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-[#C5A46D] transition-colors duration-300 group"
              >
                <div className="flex items-center space-x-2">
                  <Instagram className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-body-small font-medium">Instagram</span>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-heading-3 text-gray-900 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-body text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-body text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-body text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="text-body text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                  Custom Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-body text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-heading text-heading-3 text-gray-900 mb-6">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories/birthday" className="text-body text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                  Birthday Gifts
                </Link>
              </li>
              <li>
                <Link href="/categories/wedding" className="text-body text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                  Wedding Art
                </Link>
              </li>
              <li>
                <Link href="/categories/anniversary" className="text-body text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                  Anniversary
                </Link>
              </li>
              <li>
                <Link href="/categories/gift" className="text-body text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                  Special Gifts
                </Link>
              </li>
              <li>
                <Link href="/categories/festival" className="text-body text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                  Festival Art
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-heading-3 text-gray-900 mb-6">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="h-5 w-5 text-[#C5A46D]" />
                <div>
                  <p className="text-body font-medium">WhatsApp</p>
                  <p className="text-body-small">+91 9072270271</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Instagram className="h-5 w-5 text-[#C5A46D]" />
                <div>
                  <p className="text-body font-medium">Instagram</p>
                  <p className="text-body-small">@odux.art</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <MapPin className="h-5 w-5 text-[#C5A46D]" />
                <div>
                  <p className="text-body font-medium">Location</p>
                  <p className="text-body-small">Thayyalingal, Malappuram</p>
                  <p className="text-body-small">Kerala, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-body-small text-gray-600">
              &copy; 2025 Odux Art. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-body-small text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-body-small text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/shipping" className="text-body-small text-gray-600 hover:text-[#C5A46D] transition-colors duration-300">
                Shipping Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
