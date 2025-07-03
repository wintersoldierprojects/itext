import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocalizationProvider } from "./components/LocalizationProvider";
import { UserStatusProvider } from "./components/UserStatusProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CherryGifts Chat - Instagram-Style Messaging",
  description: "Modern real-time messaging platform with Instagram-familiar interface",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CherryGifts Chat",
    startupImage: "/icons/icon-512x512.png",
  },
  applicationName: "CherryGifts Chat",
  keywords: ["chat", "messaging", "instagram", "customer support", "real-time"],
  authors: [{ name: "CherryGifts Team" }],
  creator: "CherryGifts",
  publisher: "CherryGifts",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ABAB5' },
    { media: '(prefers-color-scheme: dark)', color: '#0ABAB5' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <LocalizationProvider>
          <UserStatusProvider>
            {children}
          </UserStatusProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
