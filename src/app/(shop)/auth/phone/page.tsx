'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PhoneLogin() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth/login')
  }, [router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin mx-auto text-brand-pink mb-4" />
      <p className="text-gray-500 font-bold">Redirecting to login...</p>
    </div>
  )
}
