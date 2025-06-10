import { tcx } from "@choiceform/design-system"
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
    <div className="h-full place-self-stretch overflow-hidden rounded-md border">
      {/* 验证状态头部 */}
      <div
        className={tcx(
          "flex h-10 items-center justify-between px-4",
          isValid && errors.length === 0 ? "text-success-foreground" : "text-danger-foreground",
        )}
      >
        <div
          className={tcx(
            "text-default-foreground",
            isValid && errors.length === 0 ? "text-success-foreground" : "text-danger-foreground",
          )}
        >
          {isValid && errors.length === 0 ? "🛡️ 验证通过" : "⚠️ 验证问题"}
        </div>
        {metadata && (
          <div className="text-secondary-foreground">
            Checks: {metadata.totalChecks} | Time: {metadata.executionTime.toFixed(3)}ms
          </div>
        )}
      </div>

      {/* 验证结果内容 */}
      <div style={{ padding: "12px" }}>
        {errors.length === 0 && warnings.length === 0 ? (
          <div className="text-success-foreground text-center">
            ✨ 表达式安全有效，所有验证层检查通过
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* 错误列表 */}
            {errors.length > 0 && (
              <div>
                <h4 className="text-danger-foreground mb-2">🚨 错误 ({errors.length})</h4>
                <div className="flex flex-col gap-1.5">
                  {errors.map((error, index) => (
                    <div
                      key={index}
                      className="border-danger-foreground bg-danger-foreground/10 rounded-md border p-2"
                    >
                      <div className="text-danger-foreground mb-1 font-medium">
                        [{error.layer}] {error.message}
                      </div>
                      {error.code && (
                        <div className="text-secondary-foreground">错误代码: {error.code}</div>
                      )}
                      {error.position && (
                        <div className="text-secondary-foreground">
                          位置: {error.position.start}-{error.position.end}
                        </div>
                      )}
                      {error.suggestions && error.suggestions.length > 0 && (
                        <div className="mt-1">
                          <div className="text-secondary-foreground">建议:</div>
                          {error.suggestions.map((suggestion, i) => (
                            <div
                              key={i}
                              className="text-success-foreground ml-2"
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
                <h4 className="text-warning-foreground mb-2">⚠️ 警告 ({warnings.length})</h4>
                <div className="flex flex-col gap-1.5">
                  {warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="border-warning-foreground bg-warning-foreground/10 rounded-md border p-2"
                    >
                      <div className="text-warning-foreground mb-1 font-medium">
                        [{warning.layer}] {warning.message}
                      </div>
                      {warning.code && (
                        <div className="text-secondary-foreground">警告代码: {warning.code}</div>
                      )}
                      {warning.position && (
                        <div className="text-secondary-foreground">
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
