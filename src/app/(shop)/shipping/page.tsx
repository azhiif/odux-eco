'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Package, Clock, Shield } from 'lucide-react'

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shipping & Delivery Information</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Standard Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We deliver across India with standard shipping taking 5-7 business days.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Free shipping on orders above ₹999</li>
                <li>₹49 shipping fee for orders below ₹999</li>
                <li>Order processing time: 1-2 business days</li>
                <li>Tracking available for all orders</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Express Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Need your order faster? Choose express delivery for 2-3 business day shipping.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>₹149 express shipping fee</li>
                <li>Priority processing</li>
                <li>Faster delivery to major cities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Order Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Custom artwork requires additional processing time:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Standard products: 1-2 business days</li>
                <li>Custom artwork: 3-5 business days</li>
                <li>You'll receive tracking info via email</li>
                <li>Contact us for urgent orders</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Secure Packaging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All orders are carefully packaged to ensure your custom artwork arrives in perfect condition.
                We use premium packaging materials and take extra care with fragile items.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
