import React, { useRef, useEffect } from "react"
import { EditorView } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { json } from "@codemirror/lang-json"
import { oneDark } from "@codemirror/theme-one-dark"
import { basicSetup } from "codemirror"

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

  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        json(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          "&": {
            fontSize: "14px",
            minHeight: "200px",
          },
          ".cm-focused": {
            outline: "none",
          },
          ".cm-editor": {
            border: "1px solid #d1d5db",
            borderRadius: "6px",
          },
          ".cm-content": {
            padding: "12px",
          },
          ".cm-placeholder": {
            color: "#9ca3af",
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
  }, [placeholder])

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
