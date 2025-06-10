import { createContext, useContext } from "react";

export const ThemeContext = createContext<
  | {
      theme: "light" | "dark" | "system";
      setTheme: (theme: "light" | "dark" | "system") => void;
    }
  | undefined
>(undefined);

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error(
      "useThemeContext must be used within ThemeContext.Provider",
    );
  return ctx;
};
