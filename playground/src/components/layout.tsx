import { TooltipProvider } from "@choiceform/design-system"
import { Outlet } from "react-router-dom"
import { ThemeContext } from "../context"
import { useTheme } from "../hooks"
import { Header } from "./header"
import { Footer } from "./footer"

const Layout = () => {
  const { theme, setTheme } = useTheme()

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <TooltipProvider>
        <div className="min-h-screen">
          <Header
            theme={theme}
            onThemeChange={setTheme}
          />

          <main className="max-w-screen p-4">
            <Outlet />
          </main>

          <Footer />
        </div>
      </TooltipProvider>
    </ThemeContext.Provider>
  )
}

export default Layout
