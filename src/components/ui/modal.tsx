import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
}

export function Modal({ isOpen, onClose, title, message, type = 'info' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden border-2 border-white"
          >
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
              type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-brand-pink'
            }`} />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center relative z-10">
              <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center">
                {type === 'success' && <CheckCircle className="w-16 h-16 text-green-500" />}
                {type === 'error' && <AlertCircle className="w-16 h-16 text-red-500" />}
                {type === 'info' && <div className="w-16 h-16 rounded-full bg-brand-pink/20 flex items-center justify-center"><AlertCircle className="w-8 h-8 text-brand-pink" /></div>}
              </div>
              
              <h3 className="text-heading-3 text-foreground mb-3">{title}</h3>
              <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                {message}
              </p>
              
              <Button 
                onClick={onClose}
                className={`w-full py-6 rounded-full text-lg ${
                  type === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' : 
                  type === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : 
                  'btn-premium-gold text-white'
                } shadow-lg`}
              >
                Okay, got it
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
