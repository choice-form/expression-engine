import React, { useState, useCallback, useMemo } from "react"
import {
  ExpressionEngine,
  ContextManager,
  createDefaultValidationEngine,
} from "@choiceform/expression-engine"
import ExpressionEditor from "./expression-editor"
import JsonEditor from "./json-editor"
import VarsEditor from "./vars-editor"
import ResultPanel from "./result-panel"
import ValidationPanel from "./validation-panel"
import { Button } from "@choiceform/design-system"
import { useTheme } from "../hooks"

const ExpressionPlayground = () => {
  const { theme } = useTheme()

  // 状态管理
  const [expression, setExpression] = useState(
    '{{ $json.user.name }}，{{ $json.user.age >= 18 ? "成年人" : "未成年" }}，在{{ $json.company.city }}工作',
  )
  const [jsonData, setJsonData] = useState(`{
  "user": {
    "name": "张三",
    "age": 28,
    "email": "zhangsan@example.com",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "isActive": true,
    "joinDate": "2023-06-15"
  },
  "company": {
    "name": "科技公司",
    "city": "北京",
    "employees": 150
  },
  "projects": [
    {
      "name": "项目A",
      "status": "completed",
      "budget": 100000,
      "startDate": "2024-01-01"
    },
    {
      "name": "项目B", 
      "status": "in-progress",
      "budget": 250000,
      "startDate": "2024-03-15"
    }
  ],
  "statistics": {
    "totalRevenue": 500000,
    "growth": 0.15,
    "regions": ["北京", "上海", "深圳", "广州"]
  }
}`)
  const [varsData, setVarsData] = useState(`{
  "threshold": {
    "revenue": 1000000,
    "growth": 0.1,
    "employees": 200
  },
  "settings": {
    "dateFormat": "yyyy-MM-dd",
    "currency": "CNY",
    "timezone": "Asia/Shanghai"
  },
  "constants": {
    "taxRate": 0.25,
    "maxBudget": 500000,
    "workingDays": 250
  }
}`)
  const [outputFormat, setOutputFormat] = useState<"string" | "ast">("string")

  // 预设表达式样例
  const examples = [
    {
      title: "🧑 基础变量访问",
      expression:
        '{{ $json.user.name }}，{{ $json.user.age >= 18 ? "成年人" : "未成年" }}，在{{ $json.company.city }}工作',
    },
    {
      title: "📊 数学计算与格式化",
      expression:
        "总预算：¥{{ $json.projects.map(p => p.budget).reduce((a, b) => a + b) / 10000 }}万元",
    },
    {
      title: "📅 日期时间处理",
      expression:
        '今天是{{ $now.toFormat("yyyy年MM月dd日") }}，项目A开始于{{ DateTime.fromISO($json.projects[0].startDate).toFormat("yyyy年MM月dd日") }}',
    },
    {
      title: "🔢 数组操作与条件",
      expression:
        '技能：{{ $json.user.skills.join("、") }}，共{{ $json.user.skills.length }}项{{ $json.user.skills.length >= 4 ? "（技能丰富）" : "" }}',
    },
    {
      title: "💰 财务计算",
      expression:
        '营收{{ $json.statistics.totalRevenue >= $vars.threshold.revenue ? "达标" : "未达标" }}，增长率{{ Math.round($json.statistics.growth * 100) }}%',
    },
    {
      title: "🔍 JMESPath 查询",
      expression:
        '进行中项目：{{ jmespath($json, "projects[?status == `in-progress`].name").join("、") }}',
    },
    {
      title: "📈 复杂业务逻辑",
      expression:
        '{{ $if($json.statistics.growth > $vars.threshold.growth, "增长良好", "需要改进") }}，{{ $if($json.company.employees >= $vars.threshold.employees, "规模较大", "小型企业") }}',
    },
    {
      title: "🌏 地理与文本",
      expression:
        '业务覆盖{{ $json.statistics.regions.length }}个城市：{{ $json.statistics.regions.slice(0, 2).join("、") }}等',
    },
  ]

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

  // 验证结果状态 - 使用 any 类型简化处理
  const [validation, setValidation] = useState<any>({
    isValid: true,
    errors: [],
    warnings: [],
    metadata: { totalChecks: 0, executionTime: 0, layers: [] },
  })

  // 验证表达式函数 - 使用 useCallback 稳定引用
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

  // 当表达式、上下文变化时更新验证结果 - 只依赖必要的值
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
  }, [expression, jsonData, varsData]) // 只依赖这三个直接输入的值

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
          {examples.map((example, index) => (
            <Button
              key={index}
              onClick={() => setExpression(example.expression)}
              active={expression === example.expression}
              variant={expression === example.expression ? "primary" : "secondary"}
            >
              {example.title}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        {/* 表达式输入 */}
        <div className="flex flex-col gap-2">
          <h3 className="text-default-foreground text-lg font-medium">Expression Input</h3>
          <p className="text-secondary-foreground">
            Tip: Input <code>{"{{ "}$</code> to trigger auto-completion.
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
          <div>
            <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "1.1rem" }}>🎯 输出结果</h3>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  marginRight: "20px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  value="string"
                  checked={outputFormat === "string"}
                  onChange={(e) => setOutputFormat(e.target.value as "string")}
                  style={{ marginRight: "6px" }}
                />
                🔤 字符串输出
              </label>
              <label style={{ fontSize: "14px", cursor: "pointer" }}>
                <input
                  type="radio"
                  value="ast"
                  checked={outputFormat === "ast"}
                  onChange={(e) => setOutputFormat(e.target.value as "ast")}
                  style={{ marginRight: "6px" }}
                />
                🌳 AST 输出
              </label>
            </div>
            <ResultPanel
              result={result}
              outputFormat={outputFormat}
            />
          </div>

          {/* 验证结果 */}
          <div>
            <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "1.1rem" }}>🛡️ 验证结果</h3>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
              五层验证：语法 → 语义 → 安全 → 性能 → 业务
            </div>
            <ValidationPanel validation={validation} />
          </div>
        </div>

        {/* JSON 数据输入 */}
        <div>
          <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "1.1rem" }}>
            📊 JSON 数据 ($json)
          </h3>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
            当前节点的数据，可以通过 <code>$json.字段名</code> 访问
          </div>
          <JsonEditor
            value={jsonData}
            onChange={setJsonData}
            placeholder="输入 JSON 数据..."
          />
        </div>

        {/* 自定义变量输入 */}
        <div>
          <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "1.1rem" }}>
            🔧 自定义变量 ($vars)
          </h3>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
            工作流全局变量，可以通过 <code>$vars.变量名</code> 访问
          </div>
          <VarsEditor
            value={varsData}
            onChange={setVarsData}
            placeholder="输入变量数据..."
          />
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
            <strong>🎯 自动补全：</strong> 输入 <code>{"{{ "}</code> 自动补全 <code>{" }}"}</code>
            ，输入 <code>$</code> 显示变量提示，选择函数自动插入括号
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>🛡️ 安全验证：</strong> 实时检测危险代码、原型污染、代码注入等安全威胁，hover
            错误位置查看详情
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>🚀 强大功能：</strong> 支持 n8n 语法、JMESPath 查询、Luxon 日期、Math
            函数、条件判断、数组操作等
          </div>
          <div>
            <strong>🌳 AST 输出：</strong> 切换到 AST
            模式可查看表达式的语法树结构、复杂度分析和依赖分析
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpressionPlayground
