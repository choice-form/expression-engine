import React, { useMemo, useCallback, useReducer } from "react"
import { ExpressionEngine, ContextManager } from "@choiceform/expression-engine"
import { Button, Segmented } from "@choiceform/design-system"
import ExpressionEditor from "./expression-editor"
import ResultPanel from "./result-panel"
import ValidationPanel from "./validation-panel"
import JsonEditor from "./json-editor"
import VarsEditor from "./vars-editor"
import { useTheme } from "../hooks"
import { DEMO_EXAMPLES, type DemoExample } from "../constants/demos"

// 统一的状态类型定义
interface PlaygroundState {
  // 核心内容
  expression: string
  jsonData: string
  varsData: string
  currentDemo: DemoExample

  // UI控制
  outputFormat: "string" | "ast"
  cursorPosition?: number

  // 统一验证状态（来自engine API，所有组件共享）
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

// 统一的Action类型
type PlaygroundAction =
  | { type: "SET_EXPRESSION"; payload: string }
  | { type: "SET_JSON_DATA"; payload: string }
  | { type: "SET_VARS_DATA"; payload: string }
  | { type: "SET_OUTPUT_FORMAT"; payload: "string" | "ast" }
  | { type: "SET_CURSOR_POSITION"; payload: number | undefined }
  | { type: "SET_VALIDATION"; payload: PlaygroundState["validation"] }
  | { type: "SWITCH_DEMO"; payload: DemoExample }

// 初始状态
const createInitialState = (demo: DemoExample): PlaygroundState => ({
  expression: demo.expression,
  jsonData: demo.jsonData,
  varsData: demo.varsData,
  currentDemo: demo,
  outputFormat: "string",
  cursorPosition: undefined,
  validation: {
    isValid: true,
    errors: [],
    warnings: [],
    metadata: { totalChecks: 0, executionTime: 0, layers: [] },
  },
})

// 状态reducer
const playgroundReducer = (state: PlaygroundState, action: PlaygroundAction): PlaygroundState => {
  switch (action.type) {
    case "SET_EXPRESSION":
      return { ...state, expression: action.payload }

    case "SET_JSON_DATA":
      return { ...state, jsonData: action.payload }

    case "SET_VARS_DATA":
      return { ...state, varsData: action.payload }

    case "SET_OUTPUT_FORMAT":
      return { ...state, outputFormat: action.payload }

    case "SET_CURSOR_POSITION":
      return { ...state, cursorPosition: action.payload }

    case "SET_VALIDATION":
      return { ...state, validation: action.payload }

    case "SWITCH_DEMO":
      return {
        ...state,
        expression: action.payload.expression,
        jsonData: action.payload.jsonData,
        varsData: action.payload.varsData,
        currentDemo: action.payload,
      }

    default:
      return state
  }
}

const ExpressionPlayground = () => {
  const { theme } = useTheme()

  // 使用useReducer统一管理状态
  const [state, dispatch] = useReducer(playgroundReducer, createInitialState(DEMO_EXAMPLES[0]!))

  // 创建引擎实例 - 保持单例
  const engine = useMemo(() => new ExpressionEngine(), [])
  const contextManager = useMemo(() => new ContextManager(), [])

  // 解析数据 - 简化计算
  const parsedData = useMemo(() => {
    const parseJSON = (str: string) => {
      try {
        return JSON.parse(str)
      } catch {
        return {}
      }
    }

    return {
      json: parseJSON(state.jsonData),
      vars: parseJSON(state.varsData),
    }
  }, [state.jsonData, state.varsData])

  // 创建执行上下文
  const context = useMemo(() => {
    return contextManager.createRuntimeContext({
      json: parsedData.json,
      vars: parsedData.vars,
      node: { id: "playground", type: "test" },
    })
  }, [contextManager, parsedData])

  // 简化的验证逻辑 - 统一使用engine API
  const validateExpression = useCallback(async () => {
    const { expression } = state

    // 空表达式处理
    if (!expression.trim()) {
      const emptyResult = {
        isValid: false,
        errors: [
          {
            code: "EMPTY",
            message: "表达式不能为空",
            layer: "syntax",
            severity: "error" as const,
            position: { start: 0, end: 0, line: 1, column: 1 },
          },
        ],
        warnings: [],
        metadata: { totalChecks: 1, executionTime: 0, layers: ["syntax"] },
      }

      dispatch({ type: "SET_VALIDATION", payload: emptyResult })
      return
    }

    try {
      // 执行真实验证，所有组件使用相同结果
      const validationResult = engine.validate(expression)
      const formattedResult = {
        isValid: validationResult.isValid,
        errors: (validationResult.errors || []).map((error) => ({
          code: error.code,
          message: error.message,
          layer: "engine",
          severity: (error.severity as "error" | "warning") || "error",
          position: error.position,
        })),
        warnings: (validationResult.warnings || []).map((warning) => ({
          code: warning.code,
          message: warning.message,
          layer: "engine",
          severity: (warning.severity as "error" | "warning") || "warning",
          position: warning.position,
        })),
        metadata: { totalChecks: 1, executionTime: 0, layers: ["engine"] },
      }

      // 更新验证结果，所有组件共享
      dispatch({ type: "SET_VALIDATION", payload: formattedResult })
    } catch (error: any) {
      const errorResult = {
        isValid: false,
        errors: [
          {
            code: "VALIDATION_ERROR",
            message: error.message || "验证失败",
            layer: "system",
            severity: "error" as const,
            position: { start: 0, end: expression.length, line: 1, column: 1 },
          },
        ],
        warnings: [],
        metadata: { totalChecks: 1, executionTime: 0, layers: ["system"] },
      }

      dispatch({ type: "SET_VALIDATION", payload: errorResult })
    }
  }, [state.expression, engine])

  // 执行表达式
  const result = useMemo(() => {
    if (!state.expression.trim()) {
      return {
        success: false,
        value: "",
        error: { message: "表达式不能为空", position: { start: 0, end: 0 } },
        type: "undefined",
        executionTime: 0,
      } as const
    }

    try {
      engine.setOutputFormat(state.outputFormat)
      const evalResult = engine.evaluate(state.expression, context)
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
          position: { start: 0, end: state.expression.length },
        },
        type: "error",
        executionTime: 0,
      } as const
    }
  }, [state.expression, state.outputFormat, engine, context])

  // 验证触发
  React.useEffect(() => {
    let isCancelled = false

    validateExpression().catch((error) => {
      if (!isCancelled) {
        console.error("Validation error:", error)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [validateExpression])

  // 事件处理器
  const handleExpressionChange = useCallback((value: string) => {
    dispatch({ type: "SET_EXPRESSION", payload: value })
  }, [])

  const handleCursorChange = useCallback((position: number | undefined) => {
    dispatch({ type: "SET_CURSOR_POSITION", payload: position })
  }, [])

  const handleSwitchDemo = useCallback((demo: DemoExample) => {
    dispatch({ type: "SWITCH_DEMO", payload: demo })
  }, [])

  const handleJsonDataChange = useCallback((value: string) => {
    dispatch({ type: "SET_JSON_DATA", payload: value })
  }, [])

  const handleVarsDataChange = useCallback((value: string) => {
    dispatch({ type: "SET_VARS_DATA", payload: value })
  }, [])

  const handleOutputFormatChange = useCallback((value: string) => {
    dispatch({ type: "SET_OUTPUT_FORMAT", payload: value as "string" | "ast" })
  }, [])

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
              onClick={() => handleSwitchDemo(demo)}
              active={state.currentDemo.title === demo.title}
              variant={state.currentDemo.title === demo.title ? "primary" : "secondary"}
            >
              {demo.title}
            </Button>
          ))}
        </div>
        {state.currentDemo && (
          <div className="mt-2 rounded-md bg-gray-50 p-3">
            <p className="text-sm text-gray-600">
              <strong>当前演示：</strong>
              {state.currentDemo.title} - {state.currentDemo.description}
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
            value={state.expression}
            onChange={handleExpressionChange}
            onCursorChange={handleCursorChange}
            validation={state.validation}
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
                  value={state.outputFormat}
                  onChange={handleOutputFormatChange}
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
              outputFormat={state.outputFormat}
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
            <ValidationPanel validation={state.validation} />
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
              value={state.jsonData}
              onChange={handleJsonDataChange}
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
              value={state.varsData}
              onChange={handleVarsDataChange}
              placeholder="输入变量数据..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpressionPlayground
