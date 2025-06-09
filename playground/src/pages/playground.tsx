import ExpressionPlayground from "../components/expression-playground"

const Playground = () => {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">🎯 Expression Playground</h1>
        <p className="text-lg text-gray-600">
          High-performance, secure frontend expression engine compatible with n8n syntax
        </p>
      </div>

      {/* Playground Component */}
      <ExpressionPlayground />
    </div>
  )
}

export default Playground
