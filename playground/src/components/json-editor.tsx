import React, { useRef, useEffect } from "react"
import { EditorView } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { json } from "@codemirror/lang-json"
import { basicSetup } from "codemirror"
import { useTheme } from "../hooks"
import { getCodeMirrorTheme, getEditorStyles, getBorderColor } from "../utils/codemirror-themes"

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  placeholder = "输入 JSON 数据...",
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView>()
  const { theme } = useTheme()

  // 验证JSON格式
  const isValidJson = (jsonStr: string): boolean => {
    try {
      JSON.parse(jsonStr)
      return true
    } catch {
      return false
    }
  }

  const isValid = isValidJson(value)
  const themeMode = theme === "system" ? "light" : theme

  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        json(),
        getCodeMirrorTheme(themeMode),
        getEditorStyles(themeMode),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          "&": {
            minHeight: "200px",
          },
          ".cm-placeholder": {
            color: themeMode === "dark" ? "#6b7280" : "#9ca3af",
          },
        }),
        EditorView.contentAttributes.of({ "data-placeholder": placeholder }),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [themeMode, placeholder])

  // 动态更新验证状态边框
  useEffect(() => {
    if (!viewRef.current) return

    const borderColor = getBorderColor(themeMode, isValid)
    const editor = viewRef.current.dom.querySelector(".cm-editor") as HTMLElement
    if (editor) {
      editor.style.border = `1px solid ${borderColor}`
    }
  }, [isValid, themeMode])

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
      {!isValid && value.trim() && (
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
          ❌ JSON 格式不正确
        </div>
      )}
    </div>
  )
}

export default JsonEditor
