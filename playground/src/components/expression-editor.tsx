import React, { useRef, useEffect, useCallback } from "react"
import { EditorView } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"

import { useExpressionEditor } from "../hooks/use-expression-editor"
import { createEditorExtensions } from "../utils/codemirror-themes"

interface ExpressionEditorProps {
  theme: "light" | "dark"
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

const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
  value,
  onChange,
  validation,
  theme,
}) => {
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
        ...createEditorExtensions({
          theme,
          // 重新启用 JavaScript 语言支持以获得语法高亮
          language: javascript(),
          // 移除全局验证颜色，让 linter 系统处理精确的错误位置标记
          isValid: undefined,
          additionalExtensions: [
            autoCloseExtension,
            autoCompleteExtension,
            validationExtension,
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                stableOnChange(update.state.doc.toString())
              }
            }),
          ],
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
  }, [theme, validation.isValid]) // 在主题或验证状态变化时重新创建

  // 验证状态颜色已通过主题应用，无需额外处理

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
    <div className="flex flex-col gap-2">
      <div
        ref={editorRef}
        className="focus-within:border-selected-boundary flex-1 overflow-hidden rounded-md border"
      />
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
