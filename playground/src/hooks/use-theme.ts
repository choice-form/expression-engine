import { useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

// 从 localStorage 获取存储的主题，如果没有则默认为 system
const getStoredTheme = (): Theme => {
  try {
    const storedTheme = localStorage.getItem("icon-system-theme") as Theme
    return storedTheme ? storedTheme : "system"
  } catch (e) {
    return "system"
  }
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme

  root.classList.remove("light", "dark", "system")
  root.classList.add(theme)

  if (theme === "system") {
    root.classList.add(resolvedTheme)
  }

  root.setAttribute("data-theme", resolvedTheme)
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getStoredTheme())

  const setThemeWithStorage = (newTheme: Theme) => {
    setTheme(newTheme)
    try {
      localStorage.setItem("icon-system-theme", newTheme)
    } catch (e) {
      console.error("Failed to save theme to localStorage:", e)
    }
  }

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
    setThemeWithStorage(nextTheme)
  }

  const setSpecificTheme = (newTheme: Theme) => {
    setThemeWithStorage(newTheme)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    resolvedTheme: theme === "system" ? getSystemTheme() : theme,
  }
}
