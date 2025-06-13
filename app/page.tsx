'use client'

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-instagram-gray-50 via-white to-instagram-gray-100" dir="ltr">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        {/* Logo/Brand Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white shadow-lg shadow-instagram-blue/25 flex items-center justify-center overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="CherryGifts Logo" 
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CherryGifts Chat</h1>
          <p className="text-gray-600">Instagram-style messaging platform</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/users" className="block">
            <button className="w-full py-4 px-6 bg-gradient-to-r from-instagram-blue to-instagram-blue-dark text-white rounded-2xl font-medium shadow-lg shadow-instagram-blue/25 hover:shadow-xl hover:shadow-instagram-blue/30 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Start Chatting</span>
              </div>
              <p className="text-sm text-instagram-blue-light mt-1">Connect instantly</p>
            </button>
          </Link>

          <Link href="/admin" className="block">
            <button className="w-full py-4 px-6 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-2xl font-medium shadow-sm hover:shadow-md transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Admin Portal</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">System administration</p>
            </button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-instagram-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-instagram-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">Real-time messaging</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-instagram-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-instagram-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">Read receipts</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-instagram-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-instagram-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">Mobile friendly</p>
          </div>
        </div>
      </div>
    </div>
  );
}