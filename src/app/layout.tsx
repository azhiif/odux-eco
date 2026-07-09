import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-body antialiased bg-white text-gray-900`}>
        {children}
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
