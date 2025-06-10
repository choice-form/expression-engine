import { Button, IconButton, Segmented } from "@choiceform/design-system"
import { memo, useMemo } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  ThemeSunBright,
  ThemeMoonDark,
  ThemeSystem,
  Choiceform,
  Github,
} from "@choiceform/icons-react"

type Theme = "light" | "dark" | "system"

interface HeaderProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

export const Header = memo(function Header(props: HeaderProps) {
  const { theme, onThemeChange } = props
  const location = useLocation()

  const themeOptionsData = useMemo(
    () => [
      {
        Icon: ThemeSunBright,
        text: "Light",
        value: "light",
      },
      {
        Icon: ThemeMoonDark,
        text: "Dark",
        value: "dark",
      },
      {
        Icon: ThemeSystem,
        text: "System",
        value: "system",
      },
    ],
    [],
  )

  const activeOption = useMemo(
    () => themeOptionsData.find((option) => option.value === theme) || themeOptionsData[0],
    [themeOptionsData, theme],
  )

  return (
    <header className="bg-default-background sticky top-0 z-10 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 text-lg font-medium">
            <Link to="/">
              <Button variant="ghost">
                <Choiceform
                  width={32}
                  height={32}
                />
                @choiceform/expression-engine
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 justify-end gap-4">
            <Link to="/">
              <Button
                variant="ghost"
                active={location.pathname === "/"}
              >
                Playground
              </Button>
            </Link>
            <Link to="/docs">
              <Button
                variant="ghost"
                active={location.pathname === "/docs"}
              >
                Documentation
              </Button>
            </Link>
          </nav>

          <Segmented
            value={activeOption.value}
            onChange={(value) => onThemeChange(value as Theme)}
          >
            {themeOptionsData.map((option) => (
              <Segmented.Item
                key={option.value}
                value={option.value}
                tooltip={{
                  content: option.text,
                }}
              >
                <option.Icon />
              </Segmented.Item>
            ))}
          </Segmented>

          <IconButton asChild>
            <a
              href="https://github.com/choice-form/expression-engine"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
            </a>
          </IconButton>
        </div>
      </div>
    </header>
  )
})
