import { tcx } from "@choiceform/design-system"
import React from "react"

interface ResultPanelProps {
  result: {
    success: boolean
    value: unknown
    error?: {
      message: string
      position?: { start: number; end: number }
    }
    type: string
    executionTime: number
    ast?: unknown
  }
  outputFormat: "string" | "ast"
}

const ResultPanel: React.FC<ResultPanelProps> = ({ result, outputFormat }) => {
  const formatValue = (value: unknown): string => {
    if (value === null) return "null"
    if (value === undefined) return "undefined"
    if (typeof value === "string") return value
    return JSON.stringify(value, null, 2)
  }

  return (
    <div className="h-full place-self-stretch overflow-hidden rounded-md border">
      {/* 结果状态头部 */}
      <div
        className={tcx(
          "flex h-10 items-center justify-between px-4",
          result.success ? "text-success-foreground" : "text-danger-foreground",
        )}
      >
        <div
          className={tcx(
            "text-default-foreground",
            result.success ? "text-success-foreground" : "text-danger-foreground",
          )}
        >
          {result.success ? "✅ 执行成功" : "❌ 执行失败"}
        </div>
        <div className="text-secondary-foreground">
          Time: {result.executionTime.toFixed(3)}ms | Type: {result.type}
        </div>
      </div>

      {/* 结果内容 */}
      <div style={{ padding: "12px" }}>
        {result.success ? (
          <div>
            {outputFormat === "string" ? (
              <div>
                <h4 className="text-secondary-foreground mb-2">字符串结果:</h4>
                <pre className="border-success-foreground bg-success-foreground/10 text-success-foreground rounded-md border p-2">
                  {formatValue(result.value)}
                </pre>
              </div>
            ) : (
              <div>
                <h4 className="text-secondary-foreground mb-2">AST 结构:</h4>
                <pre
                  style={{
                    margin: 0,
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: "400px",
                    overflow: "auto",
                  }}
                >
                  {formatValue(result.ast || result.value)}
                </pre>
                {result.value &&
                  typeof result.value === "object" &&
                  (result.value as any).complexity && (
                    <div className="text-secondary-foreground">
                      复杂度: {(result.value as any).complexity} | 依赖:{" "}
                      {(result.value as any).dependencies?.join(", ") || "无"}
                    </div>
                  )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h4 className="text-danger-foreground mb-2">错误信息:</h4>
            <div className="border-danger-foreground bg-danger-foreground/10 rounded-md border p-2">
              {result.error?.message || "未知错误"}
              {result.error?.position && (
                <div className="text-secondary-foreground">
                  位置: {result.error.position.start} - {result.error.position.end}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultPanel
