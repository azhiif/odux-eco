'use client';

import Image from 'next/image';

export default function WhatsAppButton() {
  const phoneNumber = process.env.NEXT_PUBLIC_CONTACT_PHONE?.replace(/\s/g, '') || '';
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="Chat on WhatsApp"
    >
      <Image 
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
        alt="WhatsApp" 
        width={32}
        height={32}
        className="w-8 h-8"
      />
    </a>
  );
}
