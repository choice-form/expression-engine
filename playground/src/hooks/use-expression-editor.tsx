import { ExpressionEngine } from "@choiceform/expression-engine"
import {
  autocompletion,
  CompletionContext,
  CompletionResult,
  startCompletion,
} from "@codemirror/autocomplete"
import { Diagnostic, linter, lintGutter } from "@codemirror/lint"
import { hoverTooltip, keymap } from "@codemirror/view"
import { useMemo } from "react"

interface ValidationInfo {
  isValid: boolean
  errors: Array<{
    message: string
    position?: { start: number; end: number }
  }>
  warnings: Array<{
    message: string
    position?: { start: number; end: number }
  }>
}

interface UseExpressionEditorProps {
  validation: ValidationInfo
}

export const useExpressionEditor = ({ validation }: UseExpressionEditorProps) => {
  // 创建引擎实例用于自动补全
  const engine = useMemo(() => new ExpressionEngine(), [])

  // 自动括号闭合和模板补全
  const autoCloseExtension = useMemo(() => {
    return keymap.of([
      {
        key: "{",
        run: (view: any) => {
          const { state } = view
          const pos = state.selection.main.head
          const beforeText = state.doc.sliceString(Math.max(0, pos - 1), pos)

          if (beforeText === "{") {
            // 如果前面已经有一个 {，插入第二个 { 和结束的 }}，形成 {{ }}
            view.dispatch({
              changes: { from: pos, insert: "{ }}" },
              selection: { anchor: pos + 2 }, // 光标定位在两个 } 之间
            })

            // 直接触发自动补全，不使用 setTimeout
            startCompletion(view)

            return true // 阻止默认的 { 输入
          }
          return false // 允许正常输入第一个 {
        },
      },
      {
        key: "Ctrl-Space",
        run: (view: any) => {
          startCompletion(view)
          return true
        },
      },
    ])
  }, [])

  // 智能自动补全
  const autoCompleteExtension = useMemo(() => {
    const completionSource = (context: CompletionContext): CompletionResult | null => {
      const doc = context.state.doc.toString()
      const pos = context.pos

      // 简化检查：查找最近的 {{ 和 }}
      const beforeCursor = doc.substring(0, pos)

      // 找到最后一个 {{ 的位置
      const lastOpenIndex = beforeCursor.lastIndexOf("{{")

      // 检查是否在模板内部
      const inTemplate =
        lastOpenIndex !== -1 && beforeCursor.substring(lastOpenIndex).indexOf("}}") === -1

      console.log("🔍 Auto-completion check:", {
        pos,
        doc: doc.substring(Math.max(0, pos - 20), pos + 10),
        inTemplate,
        lastOpenIndex,
      })

      if (!inTemplate) {
        console.log("❌ Not in template, skipping completion")
        return null
      }

      // 提取当前正在输入的词
      const wordMatch = context.matchBefore(/\$?[a-zA-Z_][a-zA-Z0-9_.]*/)
      const word = wordMatch?.text || ""

      console.log("🔍 Word match:", { word, wordMatch })

      console.log("🚀 Calling engine.getCompletions with:", {
        template: doc,
        position: pos,
        context: {},
      })

      // 直接调用API，不使用try-catch，让错误暴露
      const completions = engine.getCompletions({
        template: doc,
        position: pos,
        context: {},
      })

      console.log("✅ Engine completions received:", {
        count: completions.length,
        completions: completions,
        firstFew: completions.slice(0, 5),
      })

      const options = completions.map((item) => ({
        label: item.label,
        type:
          item.kind === 1
            ? "variable"
            : item.kind === 2
              ? "function"
              : item.kind === 3
                ? "method"
                : item.kind === 4
                  ? "property"
                  : "keyword",
        info: item.detail || "",
        detail: item.documentation || "",
        boost: item.sortText ? parseInt(item.sortText) : 50,
        apply: (view: any, completion: any, from: number, to: number) => {
          let insert = item.insertText || item.label
          let cursorOffset = insert.length

          // 智能插入逻辑
          if (item.kind === 2 && !insert.includes("(")) {
            // Function
            insert = `${insert}()`
            cursorOffset = insert.length - 1 // 光标在括号中间
          } else if (item.kind === 3 && insert.startsWith(".") && !insert.includes("(")) {
            // Method
            insert = `${insert}()`
            cursorOffset = insert.length - 1
          }

          console.log("🎯 Applying completion:", { insert, cursorOffset })

          view.dispatch({
            changes: { from, to, insert },
            selection: { anchor: from + cursorOffset },
          })
        },
      }))

      // 根据输入过滤
      const filtered = options.filter((option) => {
        if (!word) return true
        const label = option.label.toLowerCase()
        const query = word.toLowerCase()
        return label.startsWith(query) || label.includes(query)
      })

      console.log("📋 Filtered completion options:", {
        count: filtered.length,
        labels: filtered.map((o) => o.label),
        wordFilter: word,
      })

      return {
        from: wordMatch ? wordMatch.from : pos,
        options: filtered.slice(0, 20),
        validFor: /^[\w$.]*/,
      }
    }

    return autocompletion({
      override: [completionSource],
      closeOnBlur: false,
      maxRenderedOptions: 20,
      activateOnTyping: true,
      defaultKeymap: true,
      tooltipClass: () => "cm-completions-tooltip",
    })
  }, [engine])

  // 验证和错误提示
  const validationExtension = useMemo(() => {
    const linterSource = () => {
      const diagnostics: Diagnostic[] = []

      // 添加错误
      validation.errors.forEach((error) => {
        diagnostics.push({
          from: error.position?.start || 0,
          to: error.position?.end || 0,
          severity: "error",
          message: error.message,
        })
      })

      // 添加警告
      validation.warnings.forEach((warning) => {
        diagnostics.push({
          from: warning.position?.start || 0,
          to: warning.position?.end || 0,
          severity: "warning",
          message: warning.message,
        })
      })

      return diagnostics
    }

    const tooltipSource = hoverTooltip((view: any, pos: number, side: any) => {
      // 查找位置相关的错误或警告
      const error = validation.errors.find(
        (e) => e.position && pos >= e.position.start && pos <= e.position.end,
      )

      const warning = validation.warnings.find(
        (w) => w.position && pos >= w.position.start && pos <= w.position.end,
      )

      const message = error?.message || warning?.message
      if (!message) return null

      return {
        pos,
        above: true,
        create: () => {
          const dom = document.createElement("div")
          dom.className = error ? "cm-tooltip-error" : "cm-tooltip-warning"
          dom.style.cssText = `
            padding: 10px 14px;
            background: ${error ? "#fef2f2" : "#fffbeb"};
            border: 1px solid ${error ? "#fecaca" : "#fed7aa"};
            border-radius: 6px;
            color: ${error ? "#dc2626" : "#d97706"};
            font-size: 13px;
            max-width: 320px;
            white-space: pre-wrap;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
          `

          // 添加图标
          const icon = error ? "❌" : "⚠️"
          dom.textContent = `${icon} ${message}`

          return { dom }
        },
      }
    })

    return [linter(linterSource), lintGutter(), tooltipSource]
  }, [validation])

  return {
    autoCloseExtension,
    autoCompleteExtension,
    validationExtension,
  }
}
