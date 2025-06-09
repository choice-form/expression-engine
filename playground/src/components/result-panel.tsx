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
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        backgroundColor: "#fff",
        minHeight: "150px",
      }}
    >
      {/* 结果状态头部 */}
      <div
        style={{
          padding: "12px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: result.success ? "#f0fdf4" : "#fef2f2",
          borderRadius: "6px 6px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: result.success ? "#16a34a" : "#dc2626",
            fontWeight: "500",
            fontSize: "14px",
          }}
        >
          {result.success ? "✅ 执行成功" : "❌ 执行失败"}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          执行时间: {result.executionTime}ms | 类型: {result.type}
        </div>
      </div>

      {/* 结果内容 */}
      <div style={{ padding: "12px" }}>
        {result.success ? (
          <div>
            {outputFormat === "string" ? (
              <div>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "13px",
                    color: "#374151",
                  }}
                >
                  字符串结果:
                </h4>
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
                    maxHeight: "300px",
                    overflow: "auto",
                  }}
                >
                  {formatValue(result.value)}
                </pre>
              </div>
            ) : (
              <div>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "13px",
                    color: "#374151",
                  }}
                >
                  AST 结构:
                </h4>
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
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      复杂度: {(result.value as any).complexity} | 依赖:{" "}
                      {(result.value as any).dependencies?.join(", ") || "无"}
                    </div>
                  )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: "13px",
                color: "#dc2626",
              }}
            >
              错误信息:
            </h4>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "4px",
                fontSize: "12px",
                color: "#dc2626",
              }}
            >
              {result.error?.message || "未知错误"}
              {result.error?.position && (
                <div style={{ marginTop: "4px", fontSize: "11px" }}>
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
