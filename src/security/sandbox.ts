/**
 * 表达式安全沙箱
 * 确保表达式执行的安全性，防止恶意代码执行
 */

import type { ExpressionContext } from "../types/index.js"

/**
 * 安全配置选项
 */
export interface SecurityConfig {
  /** 允许的全局对象 */
  allowedGlobals: Set<string>
  /** 禁用的表达式模式 */
  blockedPatterns: RegExp[]
  /** 最大数组长度 */
  maxArrayLength: number
  /** 最大调用栈深度 */
  maxCallStack: number
  /** 最大对象属性数量 */
  maxObjectProperties: number
  /** 最大字符串长度 */
  maxStringLength: number
  /** 执行超时时间（毫秒） */
  timeout: number
}

/**
 * 默认安全配置
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  timeout: 5000,
  maxCallStack: 100,
  maxStringLength: 10000,
  maxArrayLength: 1000,
  maxObjectProperties: 100,
  blockedPatterns: [
    /eval\s*\(/,
    /Function\s*\(/,
    /new\s+Function/,
    /setTimeout\s*\(/,
    /setInterval\s*\(/,
    /require\s*\(/,
    /import\s*\(/,
    /process\./,
    /global\./,
    /window\./,
    /document\./,
    /__proto__/,
    /constructor\s*\./,
    /prototype\s*\./,
  ],
  allowedGlobals: new Set([
    "Math",
    "Date",
    "String",
    "Number",
    "Boolean",
    "Array",
    "Object",
    "parseInt",
    "parseFloat",
    "isNaN",
    "isFinite",
    "$json",
    "$binary",
    "$item",
    "$node",
    "$vars",
    "$now",
    "$today",
    "$workflow",
    "$execution",
    "$env",
    "$if",
    "$isEmpty",
    "$isNotEmpty",
  ]),
}

/**
 * 安全沙箱类
 */
export class SecuritySandbox {
  private config: SecurityConfig
  private callStack = 0

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config }
  }

  /**
   * 验证表达式代码安全性
   */
  public validateCode(code: string): {
    errors: string[]
    isValid: boolean
  } {
    const errors: string[] = []

    // 检查代码长度
    if (code.length > this.config.maxStringLength) {
      errors.push(`Code length exceeds maximum: ${code.length} > ${this.config.maxStringLength}`)
    }

    // 检查禁用模式
    for (const pattern of this.config.blockedPatterns) {
      if (pattern.test(code)) {
        errors.push(`Blocked pattern detected: ${pattern.source}`)
      }
    }

    // 检查危险字符序列
    const dangerousSequences = [
      "constructor",
      "__proto__",
      "prototype",
      "eval",
      "Function",
      "setTimeout",
      "setInterval",
      "require",
      "import",
      "process",
      "global",
      "window",
      "document",
    ]

    for (const seq of dangerousSequences) {
      if (code.includes(seq)) {
        errors.push(`Dangerous sequence detected: ${seq}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * 创建安全的执行上下文
   */
  public createSafeContext(baseContext: ExpressionContext): Record<string, unknown> {
    const safeContext: Record<string, unknown> = {}

    // 只复制允许的全局对象
    for (const [key, value] of Object.entries(baseContext)) {
      if (this.config.allowedGlobals.has(key) || key.startsWith("$")) {
        safeContext[key] = this.sanitizeValue(value)
      }
    }

    // 添加安全的Math对象
    safeContext.Math = this.createSafeMath()

    return safeContext
  }

  /**
   * 创建安全的Math对象
   */
  private createSafeMath(): Record<string, unknown> {
    return {
      // 基础数学函数
      abs: Math.abs,
      ceil: Math.ceil,
      floor: Math.floor,
      round: Math.round,
      max: Math.max,
      min: Math.min,
      pow: Math.pow,
      sqrt: Math.sqrt,

      // 三角函数
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      atan2: Math.atan2,

      // 对数函数
      log: Math.log,
      log10: Math.log10,
      log2: Math.log2,
      exp: Math.exp,

      // 常数
      PI: Math.PI,
      E: Math.E,

      // 随机数（受限）
      random: () => {
        this.checkCallStack()
        return Math.random()
      },
    }
  }

  /**
   * 清理值，移除不安全的属性和方法
   */
  private sanitizeValue(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value
    }

    // 基础类型直接返回
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return value
    }

    // 函数需要包装
    if (typeof value === "function") {
      return this.wrapFunction(value as (...args: unknown[]) => unknown)
    }

    // 数组处理
    if (Array.isArray(value)) {
      if (value.length > this.config.maxArrayLength) {
        throw new Error(`Array length exceeds maximum: ${value.length}`)
      }
      return value.map((item) => this.sanitizeValue(item))
    }

    // 对象处理
    if (typeof value === "object") {
      const keys = Object.keys(value as Record<string, unknown>)
      if (keys.length > this.config.maxObjectProperties) {
        throw new Error(`Object properties exceed maximum: ${keys.length}`)
      }

      const sanitized: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        // 跳过危险的属性
        if (["constructor", "__proto__", "prototype"].includes(key)) {
          continue
        }
        sanitized[key] = this.sanitizeValue(val)
      }
      return sanitized
    }

    return value
  }

  /**
   * 包装函数以添加安全检查
   */
  private wrapFunction(fn: (...args: unknown[]) => unknown): (...args: unknown[]) => unknown {
    return (...args: unknown[]) => {
      this.checkCallStack()

      try {
        this.callStack++
        const result = fn(...args)
        this.callStack--
        return result
      } catch (error) {
        this.callStack = 0
        throw error
      }
    }
  }

  /**
   * 检查调用栈深度
   */
  private checkCallStack(): void {
    if (this.callStack >= this.config.maxCallStack) {
      throw new Error(`Maximum call stack depth exceeded: ${this.callStack}`)
    }
  }

  /**
   * 执行带超时的代码
   */
  public executeWithTimeout<T>(
    executor: () => T,
    timeoutMs: number = this.config.timeout,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timeout after ${timeoutMs}ms`))
      }, timeoutMs)

      try {
        const result = executor()
        clearTimeout(timeoutId)
        resolve(result)
      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

  /**
   * 重置沙箱状态
   */
  public reset(): void {
    this.callStack = 0
  }

  /**
   * 更新安全配置
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 获取当前安全配置
   */
  public getConfig(): SecurityConfig {
    return { ...this.config }
  }
}

/**
 * 创建默认安全沙箱实例
 */
export function createSecuritySandbox(config?: Partial<SecurityConfig>): SecuritySandbox {
  return new SecuritySandbox(config)
}

/**
 * 快速验证表达式安全性
 */
export function validateExpressionSecurity(code: string): {
  errors: string[]
  isValid: boolean
} {
  const sandbox = createSecuritySandbox()
  return sandbox.validateCode(code)
}

/**
 * 常见的安全威胁模式
 */
export const SECURITY_THREATS = {
  CODE_INJECTION: /eval\s*\(|Function\s*\(|new\s+Function/,
  PROTOTYPE_POLLUTION: /__proto__|constructor\s*\.|prototype\s*\./,
  GLOBAL_ACCESS: /window\.|document\.|global\.|process\./,
  IMPORT_REQUIRE: /import\s*\(|require\s*\(/,
  TIMING_ATTACKS: /setTimeout\s*\(|setInterval\s*\(/,
  INFINITE_LOOPS: /while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/,
} as const

/**
 * 检查特定安全威胁
 */
export function checkSecurityThreat(code: string, threat: RegExp): boolean {
  return threat.test(code)
}
