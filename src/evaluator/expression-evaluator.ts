/**
 * 表达式求值器 - 安全执行JavaScript表达式
 */

import type {
  ExpressionContext,
  ExpressionValue,
  EvaluationResult,
  SecurityConfig,
  EvaluationError,
} from "../types/index.js"

export class ExpressionEvaluator {
  private securityConfig: SecurityConfig

  constructor(securityConfig: SecurityConfig) {
    this.securityConfig = securityConfig
  }

  /**
   * 求值表达式
   */
  public evaluate(expression: string, context: ExpressionContext): EvaluationResult {
    const startTime = performance.now()

    try {
      // 安全验证
      const securityCheck = this.validateSecurity(expression)
      if (!securityCheck.isValid) {
        return {
          success: false,
          error: {
            code: "SECURITY_VIOLATION",
            message: securityCheck.errors.join("; "),
          },
          type: "error",
          executionTime: performance.now() - startTime,
        }
      }

      // 创建安全上下文
      const safeContext = this.createSafeContext(context)

      // 执行表达式
      const result = this.executeExpression(expression, safeContext)

      return {
        success: true,
        value: result,
        type: typeof result,
        executionTime: performance.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
        type: "error",
        executionTime: performance.now() - startTime,
      }
    }
  }

  /**
   * 安全验证
   */
  private validateSecurity(expression: string): {
    errors: string[]
    isValid: boolean
  } {
    const errors: string[] = []

    // 检查禁止的模式
    for (const pattern of this.securityConfig.blockedPatterns) {
      if (pattern.test(expression)) {
        errors.push(`Expression contains blocked pattern: ${pattern.source}`)
      }
    }

    // 检查函数构造器
    if (!this.securityConfig.allowFunctionConstructor) {
      if (/\b(Function|eval|setTimeout|setInterval)\b/.test(expression)) {
        errors.push("Function constructors and eval are not allowed")
      }
    }

    // 检查原型访问
    if (/\.prototype\b|__proto__|constructor/.test(expression)) {
      errors.push("Prototype access is not allowed")
    }

    // 检查模块导入
    if (/\b(import|require)\b/.test(expression)) {
      errors.push("Module imports are not allowed")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * 创建安全执行上下文
   */
  private createSafeContext(context: ExpressionContext): Record<string, unknown> {
    const safeContext: Record<string, unknown> = {}

    // 添加n8n变量
    safeContext.$json = this.sanitizeValue(context.$json)
    safeContext.$item = {
      json: this.sanitizeValue(context.$item.json),
      binary: this.sanitizeValue(context.$item.binary),
    }
    safeContext.$node = this.sanitizeValue(context.$node)
    safeContext.$vars = this.sanitizeValue(context.$vars)
    safeContext.$now = context.$now
    safeContext.$today = context.$today
    safeContext.$workflow = context.$workflow
    safeContext.$execution = context.$execution

    // 添加内置函数
    safeContext.$if = context.$if
    safeContext.$isEmpty = context.$isEmpty
    safeContext.$isNotEmpty = context.$isNotEmpty

    // 添加扩展库对象（DateTime, Duration, Interval, etc.）
    if (context.DateTime) safeContext.DateTime = context.DateTime
    if (context.Duration) safeContext.Duration = context.Duration
    if (context.Interval) safeContext.Interval = context.Interval
    if (context.Info) safeContext.Info = context.Info
    if (context.search) safeContext.search = context.search
    if (context.compile) safeContext.compile = context.compile
    if (context.jmespath) safeContext.jmespath = context.jmespath

    // 添加其他n8n函数（从context复制）
    const n8nFunctionKeys = Object.keys(context).filter(
      (key) =>
        key.startsWith("$") &&
        typeof context[key] === "function" &&
        !["$if", "$isEmpty", "$isNotEmpty"].includes(key),
    )
    n8nFunctionKeys.forEach((key) => {
      safeContext[key] = context[key]
    })

    // 添加允许的全局对象
    for (const globalName of this.securityConfig.allowedGlobals) {
      switch (globalName) {
        case "Math":
          safeContext.Math = this.createSafeMath()
          break
        case "String":
          safeContext.String = String
          break
        case "Number":
          safeContext.Number = Number
          break
        case "Boolean":
          safeContext.Boolean = Boolean
          break
        case "Array":
          safeContext.Array = Array
          break
        case "Object":
          safeContext.Object = this.createSafeObject()
          break
        case "Date":
          safeContext.Date = Date
          break
        case "JSON":
          safeContext.JSON = JSON
          break
        case "parseInt":
          safeContext.parseInt = parseInt
          break
        case "parseFloat":
          safeContext.parseFloat = parseFloat
          break
        case "isNaN":
          safeContext.isNaN = isNaN
          break
        case "isFinite":
          safeContext.isFinite = isFinite
          break
      }
    }

    // 阻止访问危险的全局对象
    safeContext.window = undefined
    safeContext.global = undefined
    safeContext.globalThis = undefined
    safeContext.process = undefined
    safeContext.require = undefined
    safeContext.eval = undefined
    safeContext.Function = undefined
    safeContext.console = undefined

    return safeContext
  }

  /**
   * 创建安全的Math对象
   */
  private createSafeMath(): typeof Math {
    return {
      // 方法
      abs: Math.abs.bind(Math),
      ceil: Math.ceil.bind(Math),
      floor: Math.floor.bind(Math),
      round: Math.round.bind(Math),
      trunc: Math.trunc.bind(Math),
      max: Math.max.bind(Math),
      min: Math.min.bind(Math),
      pow: Math.pow.bind(Math),
      sqrt: Math.sqrt.bind(Math),
      cbrt: Math.cbrt.bind(Math),
      sin: Math.sin.bind(Math),
      cos: Math.cos.bind(Math),
      tan: Math.tan.bind(Math),
      asin: Math.asin.bind(Math),
      acos: Math.acos.bind(Math),
      atan: Math.atan.bind(Math),
      log: Math.log.bind(Math),
      log10: Math.log10.bind(Math),
      log2: Math.log2.bind(Math),
      random: Math.random.bind(Math),

      // 常量
      PI: Math.PI,
      E: Math.E,
      LN2: Math.LN2,
      LN10: Math.LN10,
      LOG2E: Math.LOG2E,
      LOG10E: Math.LOG10E,
      SQRT1_2: Math.SQRT1_2,
      SQRT2: Math.SQRT2,
    } as typeof Math
  }

  /**
   * 创建安全的Object对象
   */
  private createSafeObject(): Partial<typeof Object> {
    return {
      keys: Object.keys,
      values: Object.values,
      entries: Object.entries,
      assign: Object.assign,
      freeze: Object.freeze,
      seal: Object.seal,
      // 不暴露危险的方法如 defineProperty, setPrototypeOf等
    }
  }

  /**
   * 清理值，移除Proxy和其他包装
   */
  private sanitizeValue(value: unknown): ExpressionValue {
    if (value === null || value === undefined) {
      return value
    }

    // 如果是Observable对象，获取原始值
    if (value && typeof value === "object" && "get" in value && typeof value.get === "function") {
      return this.sanitizeValue((value as { get: () => unknown }).get())
    }

    // 如果是数组，递归清理
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item))
    }

    // 如果是普通对象，递归清理
    if (value && typeof value === "object" && value.constructor === Object) {
      const cleanObj: Record<string, ExpressionValue> = {}
      for (const [key, val] of Object.entries(value)) {
        cleanObj[key] = this.sanitizeValue(val)
      }
      return cleanObj
    }

    // 基础类型直接返回
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return value
    }

    // Date对象
    if (value instanceof Date) {
      return value
    }

    // 其他类型转为字符串
    return String(value)
  }

  /**
   * 执行表达式
   */
  private executeExpression(expression: string, context: Record<string, unknown>): ExpressionValue {
    // 过滤严格模式下的受限标识符
    const allowedKeys = Object.keys(context).filter(
      (key) => key !== "eval" && key !== "arguments" && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key),
    )
    const allowedValues = allowedKeys.map((key) => context[key])

    // 创建执行函数
    const func = new Function(
      ...allowedKeys,
      `
      "use strict";
      return (${expression});
    `,
    ) as (...args: unknown[]) => unknown

    // 设置执行超时
    return this.executeWithTimeout(func, allowedValues, this.securityConfig.timeout)
  }

  /**
   * 带超时的执行
   */
  private executeWithTimeout(
    func: (...args: unknown[]) => unknown,
    args: unknown[],
    timeout: number,
  ): ExpressionValue {
    const startTime = Date.now()

    // 简单的超时检查（在实际项目中可能需要Worker）
    const result = func(...args)

    const executionTime = Date.now() - startTime
    if (executionTime > timeout) {
      throw new Error(`Expression execution timeout: ${executionTime}ms > ${timeout}ms`)
    }

    return result as ExpressionValue
  }

  /**
   * 格式化错误
   */
  private formatError(error: unknown): EvaluationError {
    if (error instanceof Error) {
      const result: EvaluationError = {
        code: error.name || "EXECUTION_ERROR",
        message: error.message,
      }
      if (error.stack) {
        result.stack = error.stack
      }
      return result
    }

    return {
      code: "UNKNOWN_ERROR",
      message: String(error),
    }
  }
}
