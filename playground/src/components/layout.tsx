import { Link, Outlet, useLocation } from "react-router-dom"

const Layout = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex items-center space-x-2"
              >
                <span className="text-2xl">🚀</span>
                <span className="text-xl font-bold text-gray-900">Expression Engine</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-8">
              <Link
                to="/"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                🎯 Playground
              </Link>
              <Link
                to="/docs"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === "/docs"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                📚 Documentation
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2024 @choiceform/expression-engine - High-performance, secure frontend expression
              engine
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
