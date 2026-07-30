import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig = {
  turbopack: {},
  images: {
    formats: ['image/avif', 'image/webp'],
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
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
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://apis.google.com https://*.firebaseapp.com https://*.firebase.com https://checkout.razorpay.com https://cdn.razorpay.com https://*.razorpay.com https://www.googletagmanager.com https://*.clarity.ms https://www.clarity.ms https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
              "img-src 'self' data: https: https://www.google.com https://firebasestorage.googleapis.com https://*.razorpay.com https://*.firebaseapp.com https://*.firebase.com https://*.clarity.ms",
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://www.google.com https://apis.google.com https://identitytoolkit.googleapis.com https://api.razorpay.com https://cdn.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com https://www.clarity.ms https://*.clarity.ms https://*.firebaseapp.com https://*.firebase.com https://va.vercel-scripts.com",
              "frame-src 'self' https://*.firebaseapp.com https://www.google.com https://www.recaptcha.net https://*.firebase.com https://api.razorpay.com"
            ].join('; '),
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          }
        ],
      },
    ];
  },
};

const config = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig as any);

export default config;
