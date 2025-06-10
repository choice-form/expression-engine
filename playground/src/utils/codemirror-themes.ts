import { defaultHighlightStyle, syntaxHighlighting, HighlightStyle } from "@codemirror/language"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"

// 尝试导入语法标签
let tags: any
try {
  // 尝试从 @codemirror/language 导入
  const langModule = require("@codemirror/language")
  tags = langModule.tags || {}
} catch {
  // 如果失败，创建基本的标签映射
  tags = {
    keyword: "keyword",
    string: "string",
    number: "number",
    comment: "comment",
    operator: "operator",
    bracket: "bracket",
    property: "property",
    variable: "variable",
    variableName: "variableName",
    literal: "literal",
    punctuation: "punctuation",
  }
}

/**
 * 自定义basicSetup，排除行号和折叠功能
 * 基于basicSetup但移除lineNumbers和foldGutter
 */
export const customBasicSetup = [
  // 语法高亮支持
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

  // 基础编辑器样式
  EditorView.theme({
    ".cm-scroller": {
      fontFamily: "inherit",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#d2f4ff",
    },
    // 语法高亮颜色
    ".cm-keyword": { color: "#0066cc" },
    ".cm-string": { color: "#009900" },
    ".cm-number": { color: "#cc6600" },
    ".cm-operator": { color: "#333333" },
    ".cm-bracket": { color: "#666666" },
    ".cm-comment": { color: "#888888", fontStyle: "italic" },
  }),
  // 注意：不包含lineNumbers和foldGutter
]

// 自定义亮色主题
const lightTheme = EditorView.theme(
  {
    "&": {
      color: "#374151",
      backgroundColor: "#ffffff",
    },
    ".cm-content": {
      caretColor: "#374151",
    },
    ".cm-focused .cm-cursor": {
      borderLeftColor: "#374151",
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "#e0e7ff",
    },
    ".cm-focused .cm-selectionBackground": {
      backgroundColor: "#e0e7ff",
    },
    ".cm-gutters": {
      backgroundColor: "#f9fafb",
      color: "#6b7280",
      border: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "#f9fafb",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#f3f4f6",
    },
    // 语法高亮颜色（亮色主题）
    ".cm-keyword": {
      color: "#7c3aed",
    },
    ".cm-string": {
      color: "#059669",
    },
    ".cm-number": {
      color: "#dc2626",
    },
    ".cm-comment": {
      color: "#6b7280",
      fontStyle: "italic",
    },
    ".cm-operator": {
      color: "#374151",
    },
    ".cm-bracket": {
      color: "#6366f1",
    },
    ".cm-property": {
      color: "#0891b2",
    },
    ".cm-variable": {
      color: "#374151",
    },
  },
  { dark: false },
)

/**
 * 获取 CodeMirror 主题
 * @param theme 主题类型 ('light' | 'dark')
 * @returns CodeMirror 主题扩展
 */
export const getCodeMirrorTheme = (theme: "light" | "dark") => {
  return theme === "dark" ? oneDark : lightTheme
}

/**
 * 获取编辑器通用样式主题
 * @param theme 主题类型
 * @returns 样式主题扩展
 */
export const getEditorStyles = (theme: "light" | "dark") => {
  return EditorView.theme({
    "&": {
      fontSize: "var(--text-md)",
    },
    ".cm-focused": {
      outline: "none",
    },
    ".cm-editor": {},
    ".cm-content": {
      padding: "12px",
    },
    ".cm-completions": {
      zIndex: "1000",
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
      borderRadius: "6px",
      boxShadow:
        theme === "dark"
          ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
          : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
    ".cm-completions .cm-completionLabel": {
      color: theme === "dark" ? "#f9fafb" : "#374151",
    },
    ".cm-completions .cm-completionDetail": {
      color: theme === "dark" ? "#9ca3af" : "#6b7280",
    },
    ".cm-tooltip": {
      zIndex: "1001",
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
      borderRadius: "6px",
      color: theme === "dark" ? "#f9fafb" : "#374151",
      boxShadow:
        theme === "dark"
          ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
          : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
    ".cm-diagnostic": {
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
    },
    ".cm-diagnostic.cm-diagnostic-error": {
      backgroundColor: theme === "dark" ? "#7f1d1d" : "#fef2f2",
      borderLeft: `3px solid #dc2626`,
      color: theme === "dark" ? "#fca5a5" : "#dc2626",
    },
    ".cm-diagnostic.cm-diagnostic-warning": {
      backgroundColor: theme === "dark" ? "#78350f" : "#fffbeb",
      borderLeft: `3px solid #d97706`,
      color: theme === "dark" ? "#fbbf24" : "#d97706",
    },
  })
}

/**
 * 获取边框颜色
 * @param theme 主题类型
 * @param isValid 是否验证通过
 * @returns 边框颜色
 */
export const getBorderColor = (theme: "light" | "dark", isValid: boolean) => {
  return isValid ? (theme === "dark" ? "#374151" : "#d1d5db") : "#ef4444"
}

/**
 * 获取验证状态主题
 * @param theme 主题类型
 * @param isValid 是否验证通过
 * @returns 验证状态主题扩展
 */
export const getValidationTheme = (_theme: "light" | "dark", _isValid?: boolean) => {
  // 完全移除验证状态的颜色覆盖，让语法高亮正常显示
  // 错误标记通过 linter 系统精确处理，不需要全局颜色改变
  return EditorView.theme({
    // 只保留一些基础的验证相关样式，不覆盖文本颜色
    ".cm-diagnostic-error": {
      textDecoration: "underline wavy",
      textDecorationColor: "#dc2626",
    },
    ".cm-diagnostic-warning": {
      textDecoration: "underline wavy",
      textDecorationColor: "#d97706",
    },
  })
}

/**
 * 创建编辑器扩展数组（不包含行号和折叠）
 * @param options 配置选项
 * @returns CodeMirror 扩展数组
 */
export const createEditorExtensions = (options: {
  theme: "light" | "dark"
  language?: any | null
  additionalExtensions?: any[]
  isValid?: boolean
}) => {
  const { theme, language, additionalExtensions = [], isValid } = options

  return [
    // 语法高亮（仅基础，不包含语言特定规则）
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    // 主题（包含语法高亮颜色）
    getCodeMirrorTheme(theme),
    // 编辑器样式
    getEditorStyles(theme),
    // 验证状态颜色
    getValidationTheme(theme, isValid),
    // 语言支持（仅在提供时使用，避免与Expression Engine验证冲突）
    ...(language ? [language] : []),
    // 其他扩展
    ...additionalExtensions,
  ]
}
