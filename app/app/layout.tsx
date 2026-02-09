import Providers from "./provider";
import Link from "next/link";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50 text-gray-800 antialiased min-h-screen">
        <Providers>
          {/* Navigation */}
          <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300">
                    <span className="text-white text-xl">🛠</span>
                  </div>
                  <h1 className="font-bold text-xl bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    AI Support Hub
                  </h1>
                </Link>

                {/* Navigation Links */}
                <div className="flex gap-1">
                  <Link
                    href="/"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Submit Ticket
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-sm text-gray-500">
                © 2024 AI Support Hub. Powered by AI assistance.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}