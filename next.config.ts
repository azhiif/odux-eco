import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iili.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'esdttbjfgknqxejxhdvr.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://apis.google.com https://*.firebaseapp.com https://*.firebase.com https://checkout.razorpay.com https://cdn.razorpay.com https://*.razorpay.com https://www.googletagmanager.com https://*.clarity.ms https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https: https://www.google.com https://firebasestorage.googleapis.com https://*.razorpay.com https://*.firebaseapp.com https://*.firebase.com https://*.clarity.ms https://esdttbjfgknqxejxhdvr.supabase.co; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://www.google.com https://apis.google.com https://identitytoolkit.googleapis.com https://api.razorpay.com https://cdn.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.clarity.ms https://www.clarity.ms https://*.firebaseapp.com https://*.firebase.com https://esdttbjfgknqxejxhdvr.supabase.co; frame-src 'self' https://*.firebaseapp.com https://www.google.com https://*.firebase.com https://api.razorpay.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
