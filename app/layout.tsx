import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LocalizationProvider } from "./components/LocalizationProvider";
import { MetricsProvider } from "./components/MetricsProvider";
import { UserStatusProvider } from "./components/UserStatusProvider";

export const metadata: Metadata = {
  title: "CherryGifts Chat - Instagram-Style Messaging",
  description: "Modern real-time messaging platform with Instagram-familiar interface",
  manifest: "/manifest.json",
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
      <body className="font-sans antialiased h-full overflow-hidden">
        <MetricsProvider>
          <LocalizationProvider>
            <UserStatusProvider>
              {children}
            </UserStatusProvider>
          </LocalizationProvider>
        </MetricsProvider>
      </body>
    </html>
  );
}
