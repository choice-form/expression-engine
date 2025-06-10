import { type ValidationResult } from "@choiceform/expression-engine"
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { StateEffect, StateField } from "@codemirror/state"
import { oneDark } from "@codemirror/theme-one-dark"
import { Decoration, DecorationSet, EditorView } from "@codemirror/view"

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
      fontSize: "var(--text-lg)",
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

// ValidationEngine实例（保留用于未来功能）
// const validationEngine = createDefaultValidationEngine()

// 更新验证装饰器的Effect
export const updateValidationEffect = StateEffect.define<{
  template: string
  validation?: any // 使用any类型以兼容playground的validation格式
}>()

// 验证装饰器状态字段
export const validationField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes)

    for (let effect of tr.effects) {
      if (effect.is(updateValidationEffect)) {
        const { template, validation } = effect.value
        const docLength = tr.state.doc.length // 获取文档实际长度

        // 安全位置检查函数
        const safeRange = (start: number, end: number) => {
          const safeStart = Math.max(0, Math.min(start, docLength))
          const safeEnd = Math.max(safeStart, Math.min(end, docLength))
          return { from: safeStart, to: safeEnd }
        }

        try {
          // 转换playground的validation格式为ValidationResult格式
          let convertedValidation: ValidationResult | undefined = undefined
          if (validation) {
            // 识别系统级错误（覆盖整个模板的错误）
            const isSystemError = (err: any) => {
              return (
                !err.position ||
                (err.position.start === 0 && err.position.end === template.length) ||
                ["VALIDATOR_ERROR", "TOO_MANY_ERRORS", "VALIDATION_ERROR"].includes(err.code)
              )
            }

            convertedValidation = {
              isValid: validation.isValid,
              errors: (validation.errors || [])
                .filter((err: any) => err.position && !isSystemError(err))
                .map((err: any) => ({
                  code: "CUSTOM_ERROR",
                  message: err.message,
                  severity: "error" as const,
                  position: err.position,
                })),
              warnings: (validation.warnings || [])
                .filter((warn: any) => warn.position && !isSystemError(warn))
                .map((warn: any) => ({
                  code: "CUSTOM_WARNING",
                  message: warn.message,
                  severity: "warning" as const,
                  position: warn.position,
                })),
            }
          }

          // 表达式高亮 - 基于 ValidationEngine 的结果
          const marks = []

          // 1. 找到所有表达式位置
          const expressionRegex = /\{\{([\s\S]*?)\}\}/g
          let match: RegExpExecArray | null

          while ((match = expressionRegex.exec(template)) !== null) {
            const exprStart = match.index
            const exprEnd = match.index + match[0].length
            const { from: safeFrom, to: safeTo } = safeRange(exprStart, exprEnd)

            if (safeFrom < safeTo) {
              // 检查这个表达式是否有错误
              const hasError = convertedValidation?.errors?.some(
                (error) =>
                  error.position &&
                  !(error.position.end <= exprStart || error.position.start >= exprEnd), // 位置重叠检测
              )

              // 检查是否有警告
              const hasWarning = convertedValidation?.warnings?.some(
                (warning) =>
                  warning.position &&
                  !(warning.position.end <= exprStart || warning.position.start >= exprEnd), // 位置重叠检测
              )

              // 根据验证结果决定样式
              let cssClass = "expression-valid" // 默认绿色
              if (hasError) {
                cssClass = "expression-error" // 红色
              } else if (hasWarning) {
                cssClass = "expression-warning" // 黄色
              }

              marks.push(Decoration.mark({ class: cssClass }).range(safeFrom, safeTo))
            }
          }

          // 2. 检查不完整的表达式（只有 {{ 没有对应的 }}）
          const incompleteRegex = /\{\{(?![\s\S]*?\}\})/g
          let incompleteMatch: RegExpExecArray | null

          while ((incompleteMatch = incompleteRegex.exec(template)) !== null) {
            // 找到不完整表达式的结束位置
            let endPos = incompleteMatch.index + 2

            for (let i = incompleteMatch.index + 2; i < template.length; i++) {
              const char = template[i]
              if (/[\u4e00-\u9fff\n\r]/.test(char) || template.substring(i, i + 2) === "{{") {
                endPos = i
                break
              }
              endPos = i + 1
            }

            const { from: safeFrom, to: safeTo } = safeRange(incompleteMatch.index, endPos)
            if (safeFrom < safeTo) {
              marks.push(Decoration.mark({ class: "expression-error" }).range(safeFrom, safeTo))
            }
          }

          decorations = Decoration.set(marks)
        } catch {
          // 解析失败，整体标记为错误
          const { from: safeFrom, to: safeTo } = safeRange(0, template.length)

          if (safeFrom < safeTo) {
            decorations = Decoration.set([
              Decoration.mark({ class: "expression-error" }).range(safeFrom, safeTo),
            ])
          } else {
            decorations = Decoration.none
          }
        }
      }
    }

    return decorations
  },
  provide: (f) => EditorView.decorations.from(f),
})

/**
 * 获取验证状态主题
 * @param theme 主题类型
 * @param isValid 是否验证通过
 * @returns 验证状态主题扩展
 */
export const getValidationTheme = (_theme: "light" | "dark", _isValid?: boolean) => {
  // 装饰器样式已在CSS中定义，这里只提供诊断样式
  return EditorView.theme({
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
}) => {
  const { theme, language, additionalExtensions = [] } = options

  return [
    // 语法高亮（基础）
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    // 主题（包含语法高亮颜色）
    getCodeMirrorTheme(theme),
    // 编辑器样式
    getEditorStyles(theme),
    // 验证装饰器字段
    validationField,
    // 验证状态主题
    getValidationTheme(theme),
    // 语言支持
    ...(language ? [language] : []),
    // 其他扩展
    ...additionalExtensions,
  ]
}
