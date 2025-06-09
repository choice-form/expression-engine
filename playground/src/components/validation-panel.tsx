import React from "react"

interface ValidationPanelProps {
  validation: {
    isValid: boolean
    errors: Array<{
      code?: string
      message: string
      layer: string
      severity: "error" | "warning"
      position?: { start: number; end: number }
      suggestions?: string[]
    }>
    warnings: Array<{
      code?: string
      message: string
      layer: string
      severity: "error" | "warning"
      position?: { start: number; end: number }
      suggestions?: string[]
    }>
    metadata?: {
      totalChecks: number
      executionTime: number
      layers: string[]
    }
  }
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ validation }) => {
  const { isValid, errors, warnings, metadata } = validation

  return (
    <div
      style={{
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        backgroundColor: "#fff",
        minHeight: "120px",
      }}
    >
      {/* 验证状态头部 */}
      <div
        style={{
          padding: "12px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: isValid && errors.length === 0 ? "#f0fdf4" : "#fef2f2",
          borderRadius: "6px 6px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: isValid && errors.length === 0 ? "#16a34a" : "#dc2626",
            fontWeight: "500",
            fontSize: "14px",
          }}
        >
          {isValid && errors.length === 0 ? "🛡️ 验证通过" : "⚠️ 验证问题"}
        </div>
        {metadata && (
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            检查数: {metadata.totalChecks} | 耗时: {metadata.executionTime}ms
          </div>
        )}
      </div>

      {/* 验证结果内容 */}
      <div style={{ padding: "12px" }}>
        {errors.length === 0 && warnings.length === 0 ? (
          <div
            style={{
              color: "#16a34a",
              fontSize: "14px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            ✨ 表达式安全有效，所有验证层检查通过
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* 错误列表 */}
            {errors.length > 0 && (
              <div>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "13px",
                    color: "#dc2626",
                    fontWeight: "600",
                  }}
                >
                  🚨 错误 ({errors.length})
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {errors.map((error, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          color: "#dc2626",
                          fontWeight: "500",
                          marginBottom: "2px",
                        }}
                      >
                        [{error.layer}] {error.message}
                      </div>
                      {error.code && (
                        <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                          错误代码: {error.code}
                        </div>
                      )}
                      {error.position && (
                        <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                          位置: {error.position.start}-{error.position.end}
                        </div>
                      )}
                      {error.suggestions && error.suggestions.length > 0 && (
                        <div style={{ marginTop: "4px" }}>
                          <div style={{ color: "#6b7280", fontSize: "11px" }}>建议:</div>
                          {error.suggestions.map((suggestion, i) => (
                            <div
                              key={i}
                              style={{
                                color: "#059669",
                                fontSize: "11px",
                                marginLeft: "8px",
                              }}
                            >
                              • {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 警告列表 */}
            {warnings.length > 0 && (
              <div>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "13px",
                    color: "#d97706",
                    fontWeight: "600",
                  }}
                >
                  ⚠️ 警告 ({warnings.length})
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {warnings.map((warning, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#fffbeb",
                        border: "1px solid #fed7aa",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          color: "#d97706",
                          fontWeight: "500",
                          marginBottom: "2px",
                        }}
                      >
                        [{warning.layer}] {warning.message}
                      </div>
                      {warning.code && (
                        <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                          警告代码: {warning.code}
                        </div>
                      )}
                      {warning.position && (
                        <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                          位置: {warning.position.start}-{warning.position.end}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ValidationPanel
