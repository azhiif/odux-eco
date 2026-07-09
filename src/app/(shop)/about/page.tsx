'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Heart, Award, Users, Palette, Sparkles } from 'lucide-react'
import { FAQStructuredData } from '@/components/seo/StructuredData'
import { motion } from 'framer-motion'

const faqData = [
  {
    question: 'What is Odux Art?',
    answer: 'Odux Art is a premium custom art frame and personalized gift service that transforms your precious memories into stunning artwork. We specialize in birthday gifts, wedding art, anniversary presents, and custom frames for all special occasions.',
  },
  {
    question: 'How do I create custom art with Odux?',
    answer: 'Simply upload your photo through our custom order page, choose your preferred frame style and size, and our artists will transform your image into beautiful custom artwork. We offer various styles including digital art, traditional frames, and modern wall art.',
  },
  {
    question: 'What types of custom gifts do you offer?',
    answer: 'We offer a wide range of personalized gifts including custom photo frames, birthday art, wedding portraits, anniversary gifts, wall art, gift sets, photo prints, and special occasion artwork. Each piece is crafted with premium materials for lasting quality.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Our standard delivery time is 5-7 business days across India. Express delivery options are available for urgent orders. We ship from Kerala and provide tracking for all orders.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy for manufacturing defects. Since each piece is custom-made, we cannot accept returns for personal preference changes. However, we work closely with you to ensure your satisfaction before final production.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-16 pt-12 relative overflow-hidden">
      <FAQStructuredData data={faqData} />
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none z-0" />

      <div className="container-premium relative z-10">
        
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center px-6 py-2 bg-pink-50 rounded-full mb-6 border-2 border-pink-100 shadow-sm text-brand-pink font-bold">
            <Sparkles className="w-5 h-5 mr-2" /> Our Magical Story
          </div>
          <h1 className="text-display text-foreground mb-6">
            Turn Your Moments into
            <span className="text-brand-purple block mt-2">Timeless Art</span>
          </h1>
          <p className="text-body-large text-gray-500 mb-8 px-4">
            At Odux Art, we transform your precious memories into stunning custom artwork 
            that captures emotions and preserves moments forever in a truly magical way.
          </p>
          <Link href="/custom-order">
            <Button className="btn-premium-gold px-10 py-6 rounded-full text-lg shadow-xl shadow-brand-pink/20 hover:scale-105 transition-transform">
              Create Your Custom Art
            </Button>
          </Link>
        </motion.div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-24 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-heading-2 text-foreground mb-6">Where Magic <span className="text-brand-orange">Begins</span></h2>
            <div className="space-y-6 text-body text-gray-600 leading-relaxed font-medium">
              <p>
                Founded with a passion for art and memories, Odux Art began as a small 
                workshop where we transformed family photos into beautiful custom pieces. 
                Today, we're proud to be India's leading custom art destination.
              </p>
              <p>
                Every piece we create is more than just art – it's a story, a memory, 
                and an emotion captured in time. We work with skilled artists who understand 
                the importance of each moment you entrust to us.
              </p>
              <p className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-100 text-brand-orange">
                From birthday celebrations to wedding memories, from anniversary gifts to 
                personal keepsakes – we've helped thousands of families preserve their 
                most precious moments in beautiful, lasting artwork.
              </p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white transform rotate-2">
            <Image
              src="https://iili.io/FiuGFHP.jpg"
              alt="Odux Art Workshop"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-24">
          <h2 className="text-heading-2 text-center text-foreground mb-12">Our <span className="text-brand-pink">Values</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: 'Crafted with Love', color: 'pink', desc: 'Every piece is created with genuine care for your memories.' },
              { icon: Award, title: 'Premium Quality', color: 'purple', desc: 'We use only the finest materials for lasting beauty.' },
              { icon: Users, title: 'Customer First', color: 'orange', desc: 'Your satisfaction is our priority. We bring your vision to life.' },
              { icon: Palette, title: 'Artistic Excellence', color: 'blue', desc: 'Our talented artists bring creativity to every piece.' }
            ].map((value, i) => (
              <div key={i} className="premium-card bg-white p-8 text-center hover:-translate-y-2 transition-transform">
                <div className={`w-16 h-16 bg-${value.color}-50 text-brand-${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-${value.color}-100 rotate-3`}>
                  <value.icon className="w-8 h-8 -rotate-3" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-500 text-sm font-medium">{value.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Process Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[3rem] p-12 lg:p-16 mb-24 border-2 border-gray-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-50"></div>
          <h2 className="text-heading-2 text-center text-foreground mb-12 relative z-10">How It <span className="text-brand-purple">Works</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="text-center relative">
              <div className="w-16 h-16 bg-brand-pink text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-200 text-2xl font-bold rotate-6">1</div>
              <h3 className="text-xl font-heading font-bold mb-3 text-gray-900">Share Your Memory</h3>
              <p className="text-gray-500 font-medium text-sm">Upload your photo and tell us about your vision for the perfect artwork.</p>
            </div>
            
            <div className="text-center relative">
              <div className="hidden md:block absolute top-8 -left-8 w-24 border-t-4 border-dashed border-gray-200"></div>
              <div className="w-16 h-16 bg-brand-purple text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200 text-2xl font-bold -rotate-6">2</div>
              <h3 className="text-xl font-heading font-bold mb-3 text-gray-900">Artistic Creation</h3>
              <p className="text-gray-500 font-medium text-sm">Our artists carefully craft your custom piece with attention to every detail.</p>
            </div>
            
            <div className="text-center relative">
              <div className="hidden md:block absolute top-8 -left-8 w-24 border-t-4 border-dashed border-gray-200"></div>
              <div className="w-16 h-16 bg-brand-orange text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200 text-2xl font-bold rotate-6">3</div>
              <h3 className="text-xl font-heading font-bold mb-3 text-gray-900">Delivery to Door</h3>
              <p className="text-gray-500 font-medium text-sm">Your finished artwork is carefully packaged and magically delivered.</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="text-center mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '5000+', label: 'Happy Customers', color: 'pink' },
              { num: '10000+', label: 'Art Pieces', color: 'purple' },
              { num: '50+', label: 'Cities Delivered', color: 'orange' },
              { num: '4.9★', label: 'Customer Rating', color: 'blue' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm hover:border-brand-pink transition-colors">
                <div className={`text-4xl lg:text-5xl font-heading font-bold text-brand-${stat.color} mb-2`}>{stat.num}</div>
                <p className="text-gray-600 font-bold text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center bg-gradient-to-br from-brand-purple to-[#312e81] text-white rounded-[3rem] p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-pink opacity-20 rounded-full blur-3xl"></div>
          
          <h2 className="text-heading-2 text-white mb-6 relative z-10">
            Ready to Create Your Masterpiece?
          </h2>
          <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto font-medium relative z-10">
            Join thousands of happy customers who've turned their memories into magical art
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/custom-order">
              <Button className="btn-premium-gold px-8 py-6 rounded-full text-lg shadow-xl shadow-brand-pink/20 hover:scale-105 transition-transform w-full sm:w-auto">
                Start Your Order
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="bg-transparent border-2 border-white/30 text-white hover:bg-white hover:text-brand-purple px-8 py-6 rounded-full text-lg font-bold w-full sm:w-auto backdrop-blur-sm">
                Browse Gallery
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
