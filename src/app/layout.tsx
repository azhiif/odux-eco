import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Poppins, Fredoka } from "next/font/google";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const fredoka = Fredoka({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://oduxart.com'),
  title: {
    default: "Odux Art - Custom Art Frames & Personalized Gifts | Turn Your Moments into Timeless Art",
    template: "%s | Odux Art"
  },
  description: "Transform your precious memories into stunning custom art frames. Perfect for birthdays, weddings, anniversaries, and special occasions. Premium quality, fast delivery across India.",
  keywords: ["custom art frames", "personalized gifts", "birthday gifts", "wedding gifts", "anniversary gifts", "photo frames", "custom artwork", "wall art", "gift sets", "photo prints", "custom frames India", "personalized art"],
  authors: [{ name: "Odux Art" }],
  creator: "Odux Art",
  publisher: "Odux Art",
  alternates: {
    canonical: 'https://oduxart.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://oduxart.com',
    siteName: 'Odux Art',
    title: 'Odux Art - Custom Art Frames & Personalized Gifts',
    description: 'Transform your precious memories into stunning custom art frames. Perfect for birthdays, weddings, anniversaries, and special occasions.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Odux Art - Custom Art Frames',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Odux Art - Custom Art Frames & Personalized Gifts',
    description: 'Transform your precious memories into stunning custom art frames. Perfect for birthdays, weddings, anniversaries, and special occasions.',
    images: ['/og-image.jpg'],
    creator: '@odux_art',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${fredoka.variable} font-body antialiased bg-background text-foreground`}>
        {children}
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

        {/* Microsoft Clarity Tracking - Replays & Heatmaps */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
            `}
          </Script>
        )}

        {/* Google Analytics - Traffic Monitoring */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
