import React from "react"
import JsonEditor from "./json-editor"

interface VarsEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const VarsEditor: React.FC<VarsEditorProps> = (props) => {
  return <JsonEditor {...props} />
}

export default VarsEditor
