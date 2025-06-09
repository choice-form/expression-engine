const Documentation = () => {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">📚 Documentation</h1>
        <p className="text-lg text-gray-600">Complete guide for @choiceform/expression-engine</p>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-4 text-6xl">🚧</div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">Documentation Coming Soon</h2>
          <p className="mb-6 text-gray-600">我们正在努力完善文档内容，敬请期待！</p>

          {/* Quick Links */}
          <div className="space-y-2 text-left">
            <h3 className="mb-3 text-lg font-medium text-gray-900">🔗 Quick Links</h3>
            <div className="rounded-md bg-white p-4 shadow-sm">
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-medium">🎯 Playground:</span>
                  <span className="ml-1 text-gray-600">
                    Interactive expression testing environment
                  </span>
                </li>
                <li>
                  <span className="font-medium">📖 Syntax Guide:</span>
                  <span className="ml-1 text-gray-600">
                    Expression syntax and template patterns
                  </span>
                </li>
                <li>
                  <span className="font-medium">🔧 API Reference:</span>
                  <span className="ml-1 text-gray-600">Complete API documentation</span>
                </li>
                <li>
                  <span className="font-medium">💡 Examples:</span>
                  <span className="ml-1 text-gray-600">Real-world usage examples</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Future Sections Preview */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">🚀 Getting Started</h3>
          <p className="text-sm text-gray-600">
            Installation, basic setup, and your first expression
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">📝 Syntax Reference</h3>
          <p className="text-sm text-gray-600">
            Complete syntax guide with examples and best practices
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">🔒 Security & Validation</h3>
          <p className="text-sm text-gray-600">Security features and validation system overview</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">⚡ Performance</h3>
          <p className="text-sm text-gray-600">Performance optimization and caching strategies</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">🧩 API Reference</h3>
          <p className="text-sm text-gray-600">Complete API documentation with TypeScript types</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">💡 Examples</h3>
          <p className="text-sm text-gray-600">Real-world examples and common use cases</p>
        </div>
      </div>
    </div>
  )
}

export default Documentation
