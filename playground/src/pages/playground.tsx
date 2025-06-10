import ExpressionPlayground from "../components/expression-playground"

const Playground = () => {
  return (
    <>
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <h1 className="text-3xl font-bold">🎯 @choiceform/expression-engine</h1>
        <p className="text-secondary-foreground text-lg">
          High-performance, secure frontend expression engine compatible with n8n syntax
        </p>

        <p className="text-lg font-medium">Playground</p>
      </div>

      <ExpressionPlayground />
    </>
  )
}

export default Playground
