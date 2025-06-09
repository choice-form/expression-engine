/**
 * 表达式上下文管理器
 * 负责创建、管理和合并表达式执行上下文
 */

import { enhanceContextWithBuiltins } from "../libraries/builtin.js"
import { createJMESPathContext } from "../libraries/jmespath.js"
import { enhanceContextWithLuxon } from "../libraries/luxon.js"
import type { ExpressionContext, ExpressionValue } from "../types/index.js"

/**
 * 上下文管理器选项
 */
export interface ContextManagerOptions {
  /** 是否启用n8n内置函数 */
  enableBuiltins?: boolean
  /** 是否启用JMESPath查询库 */
  enableJMESPath?: boolean
  /** 是否启用Luxon日期时间库 */
  enableLuxon?: boolean
  /** 执行数据 */
  executionData?: {
    id?: string
    mode?: "test" | "production" | "manual"
    startedAt?: Date
  }
  /** 自定义全局变量 */
  globals?: Record<string, unknown>
  /** 工作流数据 */
  workflowData?: {
    active?: boolean
    id?: string
    name?: string
    tags?: string[]
  }
}

/**
 * 上下文管理器类
 */
export class ContextManager {
  private options: Required<ContextManagerOptions>
  private baseContext: Record<string, unknown>
  private cache = new Map<string, Record<string, unknown>>()

  constructor(options: ContextManagerOptions = {}) {
    this.options = {
      enableLuxon: true,
      enableJMESPath: true,
      enableBuiltins: true,
      globals: {},
      workflowData: {},
      executionData: {},
      ...options,
    }

    this.baseContext = this.createBaseContext()
  }

  /**
   * 创建基础上下文
   */
  private createBaseContext(): Record<string, unknown> {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // 基础n8n变量
    let context: ExpressionContext = {
      // 当前节点数据（会在运行时动态设置）
      $json: {},
      $binary: {},

      // 当前项目数据
      $item: {
        json: {},
        binary: undefined,
      },

      // 节点信息
      $node: {},

      // 工作流变量
      $vars: {},

      // 时间相关
      $now: now,
      $today: today,

      // 工作流信息
      $workflow: {
        id: this.options.workflowData.id || "",
        name: this.options.workflowData.name || "",
        active: this.options.workflowData.active || false,
      },

      // 执行信息
      $execution: {
        id: this.options.executionData.id || "",
        mode: "manual",
      },

      // 环境信息
      $env: {
        NODE_ENV: "browser",
      },

      // 全局Math对象（安全版本）
      Math: {
        abs: Math.abs,
        ceil: Math.ceil,
        floor: Math.floor,
        round: Math.round,
        trunc: Math.trunc,
        max: Math.max,
        min: Math.min,
        pow: Math.pow,
        sqrt: Math.sqrt,
        cbrt: Math.cbrt,
        random: Math.random,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        log: Math.log,
        PI: Math.PI,
        E: Math.E,
      },

      // 其他全局函数
      parseInt: parseInt,
      parseFloat: parseFloat,
      isNaN: isNaN,
      isFinite: isFinite,

      // n8n 内置函数（简单实现）
      $if: (condition: unknown, trueValue: unknown, falseValue: unknown) =>
        condition ? trueValue : falseValue,
      $isEmpty: (value: unknown) =>
        value === null ||
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0),
      $isNotEmpty: (value: unknown) =>
        !(
          value === null ||
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ),

      // 自定义全局变量
      ...(this.options.globals as Record<string, ExpressionValue>),
    }

    // 增强上下文 - 集成强大的扩展库
    if (this.options.enableBuiltins) {
      context = enhanceContextWithBuiltins(context)
    }

    if (this.options.enableLuxon) {
      context = enhanceContextWithLuxon(context)
    }

    if (this.options.enableJMESPath) {
      const jmesContext = createJMESPathContext()
      context = { ...context, ...jmesContext }
    }

    return context
  }

  /**
   * 创建运行时上下文
   */
  public createRuntimeContext(
    options: {
      additionalData?: Record<string, unknown>
      binary?: Record<string, unknown>
      item?: Record<string, unknown>
      json?: unknown
      node?: Record<string, unknown>
      vars?: Record<string, unknown>
    } = {},
  ): ExpressionContext {
    const cacheKey = JSON.stringify(options)

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)! as unknown as ExpressionContext
    }

    const context: Record<string, unknown> = {
      ...this.baseContext,

      // 更新运行时数据
      $json: options.json || {},
      $binary: options.binary || {},
      $item: options.item || this.baseContext.$item,
      $node: options.node || this.baseContext.$node,
      $vars: { ...(this.baseContext.$vars as Record<string, unknown>), ...options.vars },

      // 添加额外数据
      ...options.additionalData,
    }

    // 缓存上下文（限制缓存大小）
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(cacheKey, context)

    return context as unknown as ExpressionContext
  }

  /**
   * 清理Proxy对象，确保表达式求值兼容性
   */
  public sanitizeContext(context: ExpressionContext): ExpressionContext {
    return this.deepSanitize(context) as ExpressionContext
  }

  /**
   * 深度清理对象，移除Proxy代理
   */
  private deepSanitize(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj
    }

    // 检查是否是Legend State的Observable对象
    if (obj && typeof obj === "object" && "get" in obj && typeof obj.get === "function") {
      return this.deepSanitize((obj as { get: () => unknown }).get())
    }

    // 检查是否是Proxy对象
    if (obj && typeof obj === "object" && obj.constructor && obj.constructor.name === "Object") {
      const cleaned: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        cleaned[key] = this.deepSanitize(value)
      }
      return cleaned
    }

    // 数组处理
    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepSanitize(item))
    }

    // 基础类型和函数直接返回
    return obj
  }

  /**
   * 合并多个上下文
   */
  public mergeContexts(...contexts: Partial<ExpressionContext>[]): ExpressionContext {
    const merged = contexts.reduce((acc, ctx) => ({ ...acc, ...ctx }), { ...this.baseContext })
    return merged as ExpressionContext
  }

  /**
   * 验证上下文安全性
   */
  public validateContext(context: ExpressionContext): {
    errors: string[]
    isValid: boolean
  } {
    const errors: string[] = []

    // 检查是否包含危险的全局对象
    const dangerousGlobals = [
      "window",
      "document",
      "eval",
      "Function",
      "process",
      "require",
      "module",
      "exports",
    ]

    for (const key of Object.keys(context)) {
      if (dangerousGlobals.includes(key)) {
        errors.push(`Dangerous global object detected: ${key}`)
      }
    }

    // 检查函数是否安全
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === "function") {
        const funcStr = value.toString()
        if (funcStr.includes("eval") || funcStr.includes("Function(")) {
          errors.push(`Potentially unsafe function: ${key}`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * 获取上下文摘要信息
   */
  public getContextSummary(context: ExpressionContext): {
    functions: string[]
    size: number
    variables: string[]
  } {
    const variables: string[] = []
    const functions: string[] = []

    for (const [key, value] of Object.entries(context)) {
      if (typeof value === "function") {
        functions.push(key)
      } else {
        variables.push(key)
      }
    }

    return {
      variables: variables.sort(),
      functions: functions.sort(),
      size: Object.keys(context).length,
    }
  }

  /**
   * 清空缓存
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * 更新选项
   */
  public updateOptions(newOptions: Partial<ContextManagerOptions>): void {
    this.options = { ...this.options, ...newOptions }
    this.baseContext = this.createBaseContext()
    this.clearCache()
  }

  /**
   * 获取库的使用示例 - 展示我们最牛逼的功能
   */
  public getLibraryExamples(): {
    builtin: string[]
    jmespath: string[]
    luxon: string[]
  } {
    return {
      // Luxon 强大的日期时间处理
      luxon: [
        "{{ DateTime.now().toISO() }}", // 当前时间ISO格式
        '{{ $today.plus({ days: 7 }).toFormat("yyyy-MM-dd") }}', // 7天后的日期
        "{{ Duration.fromObject({ hours: 2, minutes: 30 }).toHuman() }}", // 人类可读的时间间隔
        '{{ $now.diff($today, "hours").hours }}', // 时间差计算
        '{{ DateTime.fromFormat("23/12/2023", "dd/MM/yyyy").toJSDate() }}', // 日期格式转换
      ],

      // JMESPath 强大的JSON查询
      jmespath: [
        "{{ $json.items[?price > `100`] }}", // 过滤价格大于100的商品
        '{{ search($json, "users[*].name") }}', // 提取所有用户名
        "{{ $json.products[*].{name: name, price: price} }}", // 投影特定字段
        "{{ length($json.items) }}", // 数组长度
        "{{ $json.orders | [?status == `completed`] | [*].total | sum(@) }}", // 复合查询和聚合
      ],

      // Builtin 强大的内置函数
      builtin: [
        '{{ $if($json.status === "active", "运行中", "已停止") }}', // 条件判断
        "{{ $upper($json.name) }}", // 字符串大写
        '{{ $groupBy($json.items, "category") }}', // 数组分组
        '{{ $sort($json.users, "score") }}', // 数组排序
        '{{ $join($map($json.tags, tag => $upper(tag)), " | ") }}', // 组合操作
        "{{ $uuid() }}", // 生成UUID
        '{{ $formatDate($timestamp(), "YYYY-MM-DD HH:mm:ss") }}', // 日期格式化
      ],
    }
  }

  /**
   * 获取完整功能描述
   */
  public getCapabilities(): {
    description: string
    features: string[]
  } {
    return {
      description: "最牛逼最厉害的前端表达式引擎 - 完全兼容n8n语法，支持强大的扩展库",
      features: [
        "🚀 高性能表达式求值 - 支持缓存和优化",
        "🔒 安全沙箱执行 - 防止恶意代码注入",
        "📅 Luxon日期时间库 - 强大的日期时间处理",
        "🔍 JMESPath查询引擎 - 灵活的JSON数据查询",
        "⚡ 丰富的内置函数 - 字符串、数组、对象操作",
        "🎯 n8n完全兼容 - 支持所有n8n表达式语法",
        "🧠 智能类型推导 - TypeScript完美支持",
        "🔧 可扩展架构 - 支持自定义函数和库",
        "📊 性能监控 - 详细的执行指标",
        "🐛 调试友好 - 详细的错误信息和堆栈跟踪",
      ],
    }
  }
}
