import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      }
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // TypeScript and ESLint configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Experimental features for optimization
  experimental: {
    // Optimize package imports for better tree shaking
    optimizePackageImports: [
      '@supabase/supabase-js',
      'lucide-react',
      'react-hot-toast',
    ],
  },

  // Turbopack configuration (stable in Next.js 15+)
  turbopack: {
    rules: {
      // Handle SVG files as React components
      '*.svg': ['@svgr/webpack'],
      // Handle YAML files
      '*.yaml': ['yaml-loader'],
      '*.yml': ['yaml-loader'],
    },
    resolveAlias: {
      // Common aliases for better imports
      '@': './app',
      '@/components': './app/components',
      '@/lib': './lib',
      '@/hooks': './hooks',
      '@/types': './types',
      '@/utils': './utils',
      // Handle canvas module issues
      'canvas': './empty-module.js',
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.mjs'],
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Development indicators
  devIndicators: {
    position: 'bottom-right',
  },


  // Output configuration for deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
