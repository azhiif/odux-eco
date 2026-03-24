import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
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
  title: "Odux Art - Turn Your Moments into Timeless Art",
  description: "Custom art frames, personalized gifts, and unique pieces for every occasion. Birthday, wedding, anniversary gifts and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-body antialiased bg-white text-gray-900`}>
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
