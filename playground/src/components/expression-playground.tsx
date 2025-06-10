import React, { useState, useMemo, useCallback } from "react"
import {
  ExpressionEngine,
  ContextManager,
  createDefaultValidationEngine,
} from "@choiceform/expression-engine"
import { Button, Segmented } from "@choiceform/design-system"
import ExpressionEditor from "./expression-editor"
import ResultPanel from "./result-panel"
import ValidationPanel from "./validation-panel"
import JsonEditor from "./json-editor"
import VarsEditor from "./vars-editor"
import { useTheme } from "../hooks"
import { DEMO_EXAMPLES, type DemoExample } from "../constants/demos"

const ExpressionPlayground = () => {
  const { theme } = useTheme()

  // 当前选中的演示
  const [currentDemo, setCurrentDemo] = useState<DemoExample>(DEMO_EXAMPLES[0]!)

  // 状态管理
  const [expression, setExpression] = useState(currentDemo.expression)
  const [jsonData, setJsonData] = useState(currentDemo.jsonData)
  const [varsData, setVarsData] = useState(currentDemo.varsData)
  const [outputFormat, setOutputFormat] = useState<"string" | "ast">("string")

  // 创建引擎实例 - 使用 useMemo 避免重复创建
  const engine = useMemo(() => new ExpressionEngine(), [])
  const contextManager = useMemo(() => new ContextManager(), [])
  const validator = useMemo(() => createDefaultValidationEngine(), [])

  // 解析JSON数据 - 使用 useMemo 缓存结果
  const jsonParsed = useMemo(() => {
    try {
      return JSON.parse(jsonData)
    } catch {
      return {}
    }
  }, [jsonData])

  const varsParsed = useMemo(() => {
    try {
      return JSON.parse(varsData)
    } catch {
      return {}
    }
  }, [varsData])

  // 创建执行上下文 - 使用 useMemo 缓存
  const context = useMemo(() => {
    return contextManager.createRuntimeContext({
      json: jsonParsed,
      vars: varsParsed,
      node: { id: "playground", type: "test" },
    })
  }, [contextManager, jsonParsed, varsParsed])

  // 切换演示
  const switchDemo = useCallback((demo: DemoExample) => {
    setCurrentDemo(demo)
    setExpression(demo.expression)
    setJsonData(demo.jsonData)
    setVarsData(demo.varsData)
  }, [])

  // 执行表达式
  const result = useMemo(() => {
    if (!expression.trim()) {
      return {
        success: false,
        value: "",
        error: { message: "表达式不能为空", position: { start: 0, end: 0 } },
        type: "undefined",
        executionTime: 0,
      } as const
    }

    try {
      engine.setOutputFormat(outputFormat)
      const evalResult = engine.evaluate(expression, context)
      return {
        success: evalResult.success || false,
        value: evalResult.value || "",
        error: evalResult.error,
        type: evalResult.type || "unknown",
        executionTime: evalResult.executionTime || 0,
        ast: evalResult.ast,
      }
    } catch (error: any) {
      return {
        success: false,
        value: "",
        error: {
          message: error.message || "执行错误",
          position: { start: 0, end: expression.length },
        },
        type: "error",
        executionTime: 0,
      } as const
    }
  }, [expression, outputFormat, engine, context])

  // 验证结果状态
  const [validation, setValidation] = useState<any>({
    isValid: true,
    errors: [],
    warnings: [],
    metadata: { totalChecks: 0, executionTime: 0, layers: [] },
  })

  // 验证表达式函数
  const validateExpression = useCallback(async () => {
    if (!expression.trim()) {
      return {
        isValid: false,
        errors: [
          {
            code: "EMPTY",
            message: "表达式不能为空",
            layer: "syntax",
            severity: "error",
            position: { start: 0, end: 0, line: 1, column: 1 },
          },
        ],
        warnings: [],
        metadata: { totalChecks: 1, executionTime: 0, layers: ["syntax"] },
      }
    }

    try {
      const validationResult = await validator.validate(expression, context)
      return {
        isValid: validationResult.isValid,
        errors: validationResult.errors || [],
        warnings: validationResult.warnings || [],
        metadata: { totalChecks: 0, executionTime: 0, layers: [] },
      }
    } catch (error: any) {
      return {
        isValid: false,
        errors: [
          {
            code: "VALIDATION_ERROR",
            message: error.message || "验证失败",
            layer: "system",
            severity: "error",
            position: { start: 0, end: expression.length, line: 1, column: 1 },
          },
        ],
        warnings: [],
        metadata: { totalChecks: 1, executionTime: 0, layers: ["system"] },
      }
    }
  }, [expression, validator, context])

  // 当表达式、上下文变化时更新验证结果
  React.useEffect(() => {
    let isCancelled = false

    validateExpression().then((result) => {
      if (!isCancelled) {
        setValidation(result)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [expression, jsonData, varsData])

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div className="border-default-boundary flex flex-col gap-4 rounded-lg border p-4">
        <h4 className="text-default-foreground text-lg font-medium">
          🎯 Expression Engine Explorer
        </h4>
        <p className="text-secondary-foreground">
          Click to experience the expression engine, support AST output
        </p>
        <div className="flex flex-wrap gap-4">
          {DEMO_EXAMPLES.map((demo, index) => (
            <Button
              key={index}
              onClick={() => switchDemo(demo)}
              active={currentDemo.title === demo.title}
              variant={currentDemo.title === demo.title ? "primary" : "secondary"}
            >
              {demo.title}
            </Button>
          ))}
        </div>
        {currentDemo && (
          <div className="mt-2 rounded-md bg-gray-50 p-3">
            <p className="text-sm text-gray-600">
              <strong>当前演示：</strong>
              {currentDemo.title} - {currentDemo.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        {/* 表达式输入 */}
        <div className="flex flex-col gap-2">
          <h3 className="text-default-foreground text-lg font-medium leading-6">
            Expression Input
          </h3>
          <p className="text-secondary-foreground">
            输入 <code>{"{{ "}$</code> 触发自动补全，可以修改表达式测试
          </p>
          <ExpressionEditor
            value={expression}
            onChange={setExpression}
            validation={validation}
            theme={theme === "dark" ? "dark" : "light"}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 输出格式切换 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-default-foreground flex-1 text-lg font-medium leading-6">
                  🎯 Output
                </h3>
                <Segmented
                  value={outputFormat}
                  onChange={(value) => setOutputFormat(value as "string" | "ast")}
                >
                  <Segmented.Item
                    className="px-2"
                    value="string"
                  >
                    String
                  </Segmented.Item>
                  <Segmented.Item
                    className="px-2"
                    value="ast"
                  >
                    AST
                  </Segmented.Item>
                </Segmented>
              </div>
              <p className="text-secondary-foreground">
                输出结果，可通过 <code>$result</code> 访问
              </p>
            </div>
            <ResultPanel
              result={result}
              outputFormat={outputFormat}
            />
          </div>

          {/* 验证结果 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-default-foreground text-lg font-medium leading-6">
                🛡️ Validation
              </h3>
              <p className="text-secondary-foreground">
                五层验证：语法 → 语义 → 安全 → 性能 → 业务
              </p>
            </div>
            <ValidationPanel validation={validation} />
          </div>

          {/* JSON 数据输入 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-default-foreground text-lg font-medium leading-6">
                📊 JSON Data ($json)
              </h3>
              <p className="text-secondary-foreground">
                当前演示的数据，通过 <code>$json.字段名</code> 访问
              </p>
            </div>
            <JsonEditor
              value={jsonData}
              onChange={setJsonData}
              placeholder="输入 JSON 数据..."
            />
          </div>

          {/* 自定义变量输入 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-default-foreground flex-1 text-lg font-medium leading-6">
                🔧 Variables ($vars)
              </h3>
              <p className="text-secondary-foreground">
                演示变量，通过 <code>$vars.变量名</code> 访问
              </p>
            </div>
            <VarsEditor
              value={varsData}
              onChange={setVarsData}
              placeholder="输入变量数据..."
            />
          </div>
        </div>
      </div>

      {/* 功能说明 */}
      <div
        style={{
          marginTop: "32px",
          padding: "16px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #e9ecef",
        }}
      >
        <h4 style={{ margin: "0 0 12px 0", color: "#333", fontSize: "1rem" }}>💡 功能说明</h4>
        <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
          <div style={{ marginBottom: "8px" }}>
            <strong>🎯 独立演示：</strong> 每个演示案例都有专属的简单数据，便于理解和学习
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>🎯 自动补全：</strong> 输入 <code>{"{{ "}</code> 自动补全 <code>{" }}"}</code>
            ，输入 <code>$</code> 显示变量提示
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>🛡️ 实时验证：</strong> 自动检测语法错误、安全威胁等，hover 错误查看详情
          </div>
          <div>
            <strong>🚀 强大功能：</strong> 支持 JMESPath 查询、日期处理、数学函数、条件判断等
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpressionPlayground
