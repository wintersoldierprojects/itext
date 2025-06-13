import Link from "next/link"
import Image from "next/image"

export default function TestIndexPage() {
  const testSuites = [
    {
      title: "Real-time Testing Suite",
      description: "Comprehensive testing for WebSocket connections, message delivery, and real-time subscriptions",
      href: "/test/realtime",
      icon: "🔄",
      features: [
        "WebSocket connection testing",
        "Message delivery latency",
        "Real-time subscriptions",
        "Performance benchmarks"
      ]
    },
    {
      title: "Message Status Testing",
      description: "Visual and functional testing for message status indicators (sent/delivered/read)",
      href: "/test/status",
      icon: "✓",
      features: [
        "Status indicator visualization",
        "Interactive status updates",
        "Performance measurement",
        "Visual design testing"
      ]
    },
    {
      title: "Typing Indicators Testing",
      description: "Performance and behavior testing for real-time typing indicators",
      href: "/test/typing",
      icon: "⌨️",
      features: [
        "Multi-user typing simulation",
        "Latency measurement",
        "Animation performance",
        "Auto-timeout testing"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-tiffany-50 via-white to-hotpink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white shadow-lg shadow-tiffany-500/25 flex items-center justify-center overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="CherryGifts Logo" 
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CherryGifts Chat Testing Suite</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive testing tools for real-time messaging features, performance benchmarks, and user experience validation
          </p>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Performance Targets</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-tiffany-50 rounded-lg">
              <div className="text-3xl font-bold text-tiffany-600">&lt;100ms</div>
              <div className="text-sm text-gray-600">Message Delivery</div>
            </div>
            <div className="text-center p-4 bg-hotpink-50 rounded-lg">
              <div className="text-3xl font-bold text-hotpink-600">&lt;50ms</div>
              <div className="text-sm text-gray-600">Status Updates</div>
            </div>
            <div className="text-center p-4 bg-tiffany-50 rounded-lg">
              <div className="text-3xl font-bold text-tiffany-600">&lt;500ms</div>
              <div className="text-sm text-gray-600">Typing Indicators</div>
            </div>
            <div className="text-center p-4 bg-hotpink-50 rounded-lg">
              <div className="text-3xl font-bold text-hotpink-600">99.9%</div>
              <div className="text-sm text-gray-600">Sync Accuracy</div>
            </div>
          </div>
        </div>

        {/* Test Suites */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testSuites.map((suite) => (
            <div key={suite.href} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="text-4xl mb-4">{suite.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{suite.title}</h3>
                <p className="text-gray-600 mb-4">{suite.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {suite.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-tiffany-500 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={suite.href}>
                  <button className="w-full py-3 px-4 bg-gradient-to-r from-tiffany-500 to-tiffany-600 text-white rounded-lg font-medium hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02]">
                    Launch Test Suite
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/" className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-2xl mb-2">🏠</div>
              <div className="text-sm font-medium">Home</div>
            </Link>
            <Link href="/users" className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-2xl mb-2">💬</div>
              <div className="text-sm font-medium">User Chat</div>
            </Link>
            <Link href="/admin" className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="text-sm font-medium">Admin Portal</div>
            </Link>
            <Link href="/admin/dashboard" className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium">Dashboard</div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p>CherryGifts Chat Testing Suite - Day 9 Real-time Integration Complete</p>
          <p className="text-sm mt-1">Performance testing, status indicators, typing indicators, and logo integration</p>
        </div>
      </div>
    </div>
  )
}