'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { Plus, Edit, Trash2, Loader2, Package, Search, Image as ImageIcon } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_urls: string[]
  category_id: string
  featured: boolean
  stock_quantity: number
  is_active: boolean
  variants?: any[]
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'))
      const snapshot = await getDocs(q)
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))
      setProducts(productsData)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching products:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    setDeleting(productId)
    try {
      await deleteDoc(doc(db, 'products', productId))
      setProducts(products.filter(p => p.id !== productId))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting product:', error)
      }
    } finally {
      setDeleting(null)
    }
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-t-brand-purple border-r-brand-blue border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-display text-gray-900 mb-2 flex items-center">
            <Package className="h-8 w-8 mr-3 text-brand-purple" />
            Products
          </h1>
          <p className="text-gray-500 font-medium">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <button className="bg-gradient-to-r from-brand-purple to-brand-blue text-white px-6 py-3 rounded-full font-bold flex items-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </Link>
      </div>

      <div className="premium-card bg-white p-6 mb-8 flex items-center">
        <Search className="h-5 w-5 text-gray-400 mr-3" />
        <input 
          type="text" 
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-gray-700 font-medium"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6 font-medium">Get started by adding your first product to the store.</p>
          <Link href="/admin/products/new">
            <button className="bg-brand-purple text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              Add Product
            </button>
          </Link>
        </div>
      ) : (
        <div className="premium-card bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 font-bold text-sm text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        {(product.image_urls?.[0] || product.variants?.[0]?.images?.[0]) ? (
                          <img
                            src={product.image_urls?.[0] || product.variants?.[0]?.images?.[0] || ''}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl object-cover mr-4 shadow-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mr-4">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900">{product.name}</div>
                          <div className="text-sm font-medium text-gray-500 truncate max-w-[200px]">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      {product.stock_quantity}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                          product.is_active
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/products/new?id=${product.id}`}
                        className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-brand-blue rounded-xl hover:bg-brand-blue hover:text-white transition-colors mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="inline-flex items-center justify-center w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                      >
                        {deleting === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
