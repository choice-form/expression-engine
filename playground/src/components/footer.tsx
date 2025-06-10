import { memo } from "react"

export const Footer = memo(function Footer() {
  return (
    <footer className="border-default-boundary border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="text-secondary-foreground text-center">
          <p className="text-md">
            © 2024 @choiceform/expression-engine - High-performance, secure frontend expression
            engine
          </p>
        </div>
      </div>
    </footer>
  )
})
