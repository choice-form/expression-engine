import React, { useRef, useEffect, useCallback } from "react"
import { EditorView } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from "@codemirror/theme-one-dark"
import { basicSetup } from "codemirror"
import { useExpressionEditor } from "../hooks/use-expression-editor"

interface ExpressionEditorProps {
  value: string
  onChange: (value: string) => void
  validation: {
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
}

const ExpressionEditor: React.FC<ExpressionEditorProps> = ({ value, onChange, validation }) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView>()
  const onChangeRef = useRef(onChange)

  // 保持 onChange 引用稳定
  onChangeRef.current = onChange

  // 稳定的 onChange 回调
  const stableOnChange = useCallback((newValue: string) => {
    onChangeRef.current(newValue)
  }, [])

  const { autoCloseExtension, autoCompleteExtension, validationExtension } = useExpressionEditor({
    validation,
  })

  // 只在初始化时创建编辑器，避免重复创建
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        autoCloseExtension,
        autoCompleteExtension,
        validationExtension,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            stableOnChange(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          "&": {
            fontSize: "14px",
            minHeight: "120px",
          },
          ".cm-focused": {
            outline: "none",
          },
          ".cm-editor": {
            borderRadius: "6px",
            transition: "border-color 0.2s ease",
          },
          ".cm-content": {
            padding: "12px",
          },
          ".cm-completions": {
            zIndex: "1000",
          },
          ".cm-tooltip": {
            zIndex: "1001",
          },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = undefined
    }
  }, []) // 只在组件挂载时创建一次

  // 单独处理验证状态变化，只更新样式
  useEffect(() => {
    if (!viewRef.current) return

    const borderColor = validation.isValid ? "#d1d5db" : "#ef4444"
    const editor = viewRef.current.dom.querySelector(".cm-editor") as HTMLElement
    if (editor) {
      editor.style.border = `1px solid ${borderColor}`
    }
  }, [validation.isValid])

  // 当值变化时更新编辑器内容（来自外部）
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      })
    }
  }, [value])

  return (
    <div>
      <div ref={editorRef} />
      {!validation.isValid && validation.errors.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px 12px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#dc2626",
          }}
        >
          {validation.errors.map((error, index) => (
            <div key={index}>❌ {error.message}</div>
          ))}
        </div>
      )}
      {validation.warnings.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px 12px",
            backgroundColor: "#fffbeb",
            border: "1px solid #fed7aa",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#d97706",
          }}
        >
          {validation.warnings.map((warning, index) => (
            <div key={index}>⚠️ {warning.message}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExpressionEditor
