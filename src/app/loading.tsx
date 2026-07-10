import React from 'react'

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-brand-pink border-r-brand-orange border-b-brand-purple border-l-brand-blue rounded-full mx-auto mb-6 animate-spin"></div>
        <p className="text-brand-purple font-heading text-xl animate-pulse">
          Wrapping your magic...
        </p>
      </div>
    </div>
  )
}
