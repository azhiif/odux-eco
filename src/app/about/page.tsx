'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Heart, Award, Users, Palette } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 bg-background text-foreground">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Turn Your Moments into
          <span className="text-foreground"> Timeless Art</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          At Odux Art, we transform your precious memories into stunning custom artwork 
          that captures emotions and preserves moments forever.
        </p>
        <Link href="/custom-order">
          <Button className="bg-foreground text-background hover:bg-muted px-8 py-3 rounded-full text-lg">
            Create Your Custom Art
          </Button>
        </Link>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-foreground">Our Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Founded with a passion for art and memories, Odux Art began as a small 
              workshop where we transformed family photos into beautiful custom pieces. 
              Today, we&apos;re proud to be India&apos;s leading custom art destination.
            </p>
            <p>
              Every piece we create is more than just art – it's a story, a memory, 
              and an emotion captured in time. We work with skilled artists who understand 
              the importance of each moment you entrust to us.
            </p>
            <p>
              From birthday celebrations to wedding memories, from anniversary gifts to 
              personal keepsakes – we've helped thousands of families preserve their 
              most precious moments in beautiful, lasting artwork.
            </p>
          </div>
        </div>
        
        <div className="relative h-96 rounded-lg overflow-hidden">
          <Image
            src="https://iili.io/FiuGFHP.jpg"
            alt="Odux Art Workshop"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Crafted with Love</h3>
            <p className="text-gray-600">
              Every piece is created with attention to detail and genuine care for your memories.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Premium Quality</h3>
            <p className="text-gray-600">
              We use only the finest materials and printing techniques to ensure lasting beauty.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Customer First</h3>
            <p className="text-gray-600">
              Your satisfaction is our priority. We're here to bring your vision to life.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Artistic Excellence</h3>
            <p className="text-gray-600">
              Our talented artists bring creativity and expertise to every custom piece.
            </p>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-gray-50 rounded-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Share Your Memory</h3>
            <p className="text-gray-600">
              Upload your photo and tell us about your vision for the perfect artwork.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Artistic Creation</h3>
            <p className="text-gray-600">
              Our artists carefully craft your custom piece with attention to every detail.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Delivery to Your Door</h3>
            <p className="text-gray-600">
              Your finished artwork is carefully packaged and delivered to your home.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-12">By the Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-bold text-black mb-2">5000+</div>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-black mb-2">10000+</div>
            <p className="text-gray-600">Art Pieces Created</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-black mb-2">50+</div>
            <p className="text-gray-600">Cities Delivered</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-black mb-2">4.9★</div>
            <p className="text-gray-600">Customer Rating</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-black text-white rounded-lg p-12">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Create Your Masterpiece?
        </h2>
        <p className="text-xl mb-8">
          Join thousands of happy customers who've turned their memories into art
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/custom-order">
            <Button className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-full text-lg">
              Start Your Order
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-full text-lg">
              Browse Gallery
            </Button>
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
        <p className="text-gray-600 mb-8">
          Have questions? We'd love to hear from you!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-2">WhatsApp</h3>
            <p className="text-gray-600">+91 9072270271</p>
            <p className="text-sm text-gray-500">Mon-Sat, 10AM-7PM</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-gray-600">support@odux.art</p>
            <p className="text-sm text-gray-500">24/7 Support</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Instagram</h3>
            <p className="text-gray-600">@odux.art</p>
            <p className="text-sm text-gray-500">Daily Inspiration</p>
          </div>
        </div>
      </div>
    </div>
  )
}
