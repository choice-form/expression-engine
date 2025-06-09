/**
 * 安全层验证器
 *
 * 负责检查：
 * - 扩展现有安全检查：危险代码检测、原型污染、全局对象访问
 * - 资源使用限制：内存、时间、复杂度限制
 * - 代码注入防护：XSS、代码注入、恶意脚本检测
 */

import type {
  ValidationContext,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from "../base-validator.js"
import { BaseValidator } from "../base-validator.js"

/**
 * 安全威胁等级
 */
enum ThreatLevel {
  CRITICAL = "critical",
  HIGH = "high",
  LOW = "low",
  MEDIUM = "medium",
}

/**
 * 安全威胁定义
 */
interface SecurityThreat {
  description: string
  level: ThreatLevel
  mitigation?: string
  pattern: RegExp
}

/**
 * 关键安全威胁模式
 */
const CRITICAL_THREATS: SecurityThreat[] = [
  {
    pattern: /\beval\s*\(/,
    level: ThreatLevel.CRITICAL,
    description: "eval()函数允许执行任意代码",
    mitigation: "使用安全的数据解析方法替代eval()",
  },
  {
    pattern: /\bFunction\s*\(|new\s+Function/,
    level: ThreatLevel.CRITICAL,
    description: "Function构造器可以创建和执行任意代码",
    mitigation: "避免动态创建函数，使用预定义的函数",
  },
  {
    pattern: /constructor\s*\.\s*constructor/,
    level: ThreatLevel.CRITICAL,
    description: "通过constructor属性访问Function构造器",
    mitigation: "避免访问constructor属性",
  },
  {
    pattern: /__proto__\s*\[|__proto__\s*\./,
    level: ThreatLevel.CRITICAL,
    description: "原型污染攻击，可能修改对象原型",
    mitigation: "避免直接操作__proto__属性",
  },
]

/**
 * 高风险安全威胁模式
 */
const HIGH_THREATS: SecurityThreat[] = [
  {
    pattern: /\bprocess\.|global\.|globalThis\./,
    level: ThreatLevel.HIGH,
    description: "访问全局进程或全局对象",
    mitigation: "在沙箱环境中运行代码",
  },
  {
    pattern: /\brequire\s*\(|import\s*\(/,
    level: ThreatLevel.HIGH,
    description: "尝试导入模块或文件",
    mitigation: "禁用模块导入功能",
  },
  {
    pattern: /setTimeout\s*\(|setInterval\s*\(/,
    level: ThreatLevel.HIGH,
    description: "定时器函数可能导致资源泄露",
    mitigation: "使用受控的异步执行机制",
  },
  {
    pattern: /\bwindow\.|document\.|location\./,
    level: ThreatLevel.HIGH,
    description: "访问浏览器DOM或BOM对象",
    mitigation: "在服务器端环境中禁用浏览器对象",
  },
]

/**
 * 中等风险安全威胁模式
 */
const MEDIUM_THREATS: SecurityThreat[] = [
  {
    pattern: /\bwhile\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/,
    level: ThreatLevel.MEDIUM,
    description: "可能的无限循环",
    mitigation: "使用有限制的循环条件",
  },
  {
    pattern: /\.call\s*\(|\.apply\s*\(|\.bind\s*\(/,
    level: ThreatLevel.MEDIUM,
    description: "函数上下文操作可能绕过安全检查",
    mitigation: "限制函数上下文操作",
  },
  {
    pattern: /\[\s*\]\.constructor/,
    level: ThreatLevel.MEDIUM,
    description: "通过空数组访问Array构造器",
    mitigation: "避免通过数组访问构造器",
  },
  {
    pattern: /\{\s*\}\.constructor/,
    level: ThreatLevel.MEDIUM,
    description: "通过空对象访问Object构造器",
    mitigation: "避免通过对象访问构造器",
  },
]

/**
 * 低风险安全威胁模式
 */
const LOW_THREATS: SecurityThreat[] = [
  {
    pattern: /console\.|alert\s*\(|confirm\s*\(|prompt\s*\(/,
    level: ThreatLevel.LOW,
    description: "调试或用户交互函数",
    mitigation: "在生产环境中禁用调试函数",
  },
  {
    pattern: /debugger/,
    level: ThreatLevel.LOW,
    description: "debugger语句可能暂停执行",
    mitigation: "移除debugger语句",
  },
  {
    pattern: /\+\+|--/,
    level: ThreatLevel.LOW,
    description: "自增自减操作符可能导致副作用",
    mitigation: "使用明确的赋值操作",
  },
]

/**
 * 资源使用限制配置
 */
interface ResourceLimits {
  /** 最大数组长度 */
  maxArrayLength: number
  /** 最大函数调用次数 */
  maxFunctionCalls: number
  /** 最大循环次数 */
  maxLoopIterations: number
  /** 最大内存使用（估算） */
  maxMemoryUsage: number
  /** 最大嵌套深度 */
  maxNestingDepth: number
  /** 最大对象属性数量 */
  maxObjectProperties: number
  /** 最大字符串长度 */
  maxStringLength: number
}

/**
 * 默认资源限制
 */
const DEFAULT_RESOURCE_LIMITS: ResourceLimits = {
  maxStringLength: 10000,
  maxArrayLength: 1000,
  maxObjectProperties: 100,
  maxNestingDepth: 10,
  maxFunctionCalls: 100,
  maxLoopIterations: 1000,
  maxMemoryUsage: 1024 * 1024, // 1MB
}

/**
 * 危险代码检测器
 */
export class DangerousCodeValidator extends BaseValidator {
  readonly name = "DangerousCode"
  readonly layer = "security" as const

  validate(context: ValidationContext): ValidationResult {
    const { template } = context
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      const expressionMatches = template.matchAll(/\{\{([^}]+)\}\}/g)

      for (const match of expressionMatches) {
        const expression = match[1]?.trim()
        if (!expression) continue

        const position = this.calculatePosition(
          template,
          match.index!,
          match.index! + match[0].length,
        )
        const threatResults = this.scanForThreats(expression)

        // 处理检测到的威胁
        for (const threat of threatResults) {
          if (threat.level === ThreatLevel.CRITICAL || threat.level === ThreatLevel.HIGH) {
            errors.push(
              this.createError(
                "SECURITY_THREAT",
                `${threat.level.toUpperCase()}安全威胁: ${threat.description}${threat.mitigation ? ` 建议: ${threat.mitigation}` : ""}`,
                position,
              ),
            )
          } else {
            warnings.push(
              this.createWarning(
                "SECURITY_CONCERN",
                `${threat.level.toUpperCase()}安全关注: ${threat.description}${threat.mitigation ? ` 建议: ${threat.mitigation}` : ""}`,
                position,
              ),
            )
          }
        }
      }
    } catch (error) {
      errors.push(
        this.createError(
          "SECURITY_SCAN_ERROR",
          `安全扫描失败: ${error instanceof Error ? error.message : "未知错误"}`,
        ),
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 扫描安全威胁
   */
  private scanForThreats(expression: string): SecurityThreat[] {
    const detectedThreats: SecurityThreat[] = []

    const allThreats = [...CRITICAL_THREATS, ...HIGH_THREATS, ...MEDIUM_THREATS, ...LOW_THREATS]

    for (const threat of allThreats) {
      if (threat.pattern.test(expression)) {
        detectedThreats.push(threat)
      }
    }

    return detectedThreats
  }
}

/**
 * 原型污染检测器
 */
export class PrototypePollutionValidator extends BaseValidator {
  readonly name = "PrototypePollution"
  readonly layer = "security" as const

  validate(context: ValidationContext): ValidationResult {
    const { template } = context
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      const expressionMatches = template.matchAll(/\{\{([^}]+)\}\}/g)

      for (const match of expressionMatches) {
        const expression = match[1]?.trim()
        if (!expression) continue

        const position = this.calculatePosition(
          template,
          match.index!,
          match.index! + match[0].length,
        )
        const pollutionChecks = this.checkPrototypePollution(expression)

        if (pollutionChecks.hasCritical) {
          errors.push(
            this.createError(
              "PROTOTYPE_POLLUTION",
              "检测到原型污染风险：" + pollutionChecks.issues.join("; "),
              position,
            ),
          )
        }

        if (pollutionChecks.hasSuspicious) {
          warnings.push(
            this.createWarning(
              "SUSPICIOUS_PROTOTYPE_ACCESS",
              "可疑的原型访问：" + pollutionChecks.issues.join("; "),
              position,
            ),
          )
        }
      }
    } catch (error) {
      errors.push(
        this.createError(
          "PROTOTYPE_SCAN_ERROR",
          `原型污染扫描失败: ${error instanceof Error ? error.message : "未知错误"}`,
        ),
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 检查原型污染
   */
  private checkPrototypePollution(expression: string): {
    hasCritical: boolean
    hasSuspicious: boolean
    issues: string[]
  } {
    const issues: string[] = []
    let hasCritical = false
    let hasSuspicious = false

    // 检查直接__proto__访问
    if (/__proto__/.test(expression)) {
      issues.push("直接访问__proto__属性")
      hasCritical = true
    }

    // 检查constructor.constructor模式
    if (/constructor\s*\.\s*constructor/.test(expression)) {
      issues.push("通过constructor.constructor访问Function构造器")
      hasCritical = true
    }

    // 检查prototype赋值
    if (/\.prototype\s*=/.test(expression)) {
      issues.push("直接修改prototype属性")
      hasCritical = true
    }

    // 检查字符串形式的危险属性访问
    const dangerousProps = ["constructor", "__proto__", "prototype"]
    for (const prop of dangerousProps) {
      const stringAccessPattern = new RegExp(`\\[["']${prop}["']\\]`)
      if (stringAccessPattern.test(expression)) {
        issues.push(`通过字符串访问${prop}属性`)
        hasSuspicious = true
      }
    }

    // 检查动态属性访问
    if (/\[\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\]/.test(expression)) {
      issues.push("动态属性访问可能访问危险属性")
      hasSuspicious = true
    }

    return { hasCritical, hasSuspicious, issues }
  }
}

/**
 * 资源使用限制验证器
 */
export class ResourceLimitValidator extends BaseValidator {
  readonly name = "ResourceLimit"
  readonly layer = "security" as const

  private limits: ResourceLimits

  constructor(limits: Partial<ResourceLimits> = {}) {
    super()
    this.limits = { ...DEFAULT_RESOURCE_LIMITS, ...limits }
  }

  validate(context: ValidationContext): ValidationResult {
    const { template } = context
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      // 检查模板整体长度
      if (template.length > this.limits.maxStringLength) {
        errors.push(
          this.createError(
            "TEMPLATE_TOO_LONG",
            `模板长度超过限制: ${template.length} > ${this.limits.maxStringLength}`,
          ),
        )
      }

      const expressionMatches = template.matchAll(/\{\{([^}]+)\}\}/g)

      for (const match of expressionMatches) {
        const expression = match[1]?.trim()
        if (!expression) continue

        const position = this.calculatePosition(
          template,
          match.index!,
          match.index! + match[0].length,
        )
        const resourceChecks = this.checkResourceUsage(expression)

        // 添加检测到的问题
        errors.push(
          ...resourceChecks.errors.map((e) => this.createError(e.code, e.message, position)),
        )
        warnings.push(
          ...resourceChecks.warnings.map((w) => this.createWarning(w.code, w.message, position)),
        )
      }
    } catch (error) {
      errors.push(
        this.createError(
          "RESOURCE_SCAN_ERROR",
          `资源使用扫描失败: ${error instanceof Error ? error.message : "未知错误"}`,
        ),
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 检查资源使用情况
   */
  private checkResourceUsage(expression: string): {
    errors: Array<{ code: string; message: string }>
    warnings: Array<{ code: string; message: string }>
  } {
    const errors: Array<{ code: string; message: string }> = []
    const warnings: Array<{ code: string; message: string }> = []

    // 检查表达式长度
    if (expression.length > this.limits.maxStringLength) {
      errors.push({
        code: "EXPRESSION_TOO_LONG",
        message: `表达式长度超过限制: ${expression.length} > ${this.limits.maxStringLength}`,
      })
    }

    // 检查嵌套深度
    const nestingDepth = this.calculateNestingDepth(expression)
    if (nestingDepth > this.limits.maxNestingDepth) {
      errors.push({
        code: "NESTING_TOO_DEEP",
        message: `嵌套深度超过限制: ${nestingDepth} > ${this.limits.maxNestingDepth}`,
      })
    }

    // 检查潜在的内存消耗
    const memoryEstimate = this.estimateMemoryUsage(expression)
    if (memoryEstimate > this.limits.maxMemoryUsage) {
      warnings.push({
        code: "HIGH_MEMORY_USAGE",
        message: `预估内存使用过高: ${Math.round(memoryEstimate / 1024)}KB > ${Math.round(this.limits.maxMemoryUsage / 1024)}KB`,
      })
    }

    // 检查函数调用次数
    const functionCallCount = this.countFunctionCalls(expression)
    if (functionCallCount > this.limits.maxFunctionCalls) {
      warnings.push({
        code: "TOO_MANY_FUNCTION_CALLS",
        message: `函数调用次数过多: ${functionCallCount} > ${this.limits.maxFunctionCalls}`,
      })
    }

    // 检查循环结构
    const loopPatterns = [
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bdo\s*\{/g,
      /\.forEach\s*\(/g,
      /\.map\s*\(/g,
      /\.filter\s*\(/g,
    ]

    let totalLoops = 0
    for (const pattern of loopPatterns) {
      const matches = expression.match(pattern)
      if (matches) {
        totalLoops += matches.length
      }
    }

    if (totalLoops > this.limits.maxLoopIterations / 100) {
      // 粗略估算
      warnings.push({
        code: "POTENTIAL_PERFORMANCE_ISSUE",
        message: `检测到多个循环结构，可能影响性能: ${totalLoops}个循环`,
      })
    }

    return { errors, warnings }
  }

  /**
   * 计算嵌套深度
   */
  private calculateNestingDepth(expression: string): number {
    let maxDepth = 0
    let currentDepth = 0

    for (const char of expression) {
      if (char === "(" || char === "[" || char === "{") {
        currentDepth++
        maxDepth = Math.max(maxDepth, currentDepth)
      } else if (char === ")" || char === "]" || char === "}") {
        currentDepth--
      }
    }

    return maxDepth
  }

  /**
   * 估算内存使用
   */
  private estimateMemoryUsage(expression: string): number {
    // 简化的内存估算
    let estimate = expression.length * 2 // 基础字符串内存

    // 字符串字面量
    const strings = expression.match(/["']([^"']*)["']/g) || []
    estimate += strings.reduce((sum, str) => sum + str.length * 2, 0)

    // 数组字面量
    const arrays = expression.match(/\[[^\]]*\]/g) || []
    estimate += arrays.length * 100 // 每个数组估算100字节

    // 对象字面量
    const objects = expression.match(/\{[^}]*\}/g) || []
    estimate += objects.length * 200 // 每个对象估算200字节

    return estimate
  }

  /**
   * 计算函数调用次数
   */
  private countFunctionCalls(expression: string): number {
    const functionCalls = expression.match(/[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/g) || []
    return functionCalls.length
  }
}

/**
 * 代码注入防护验证器
 */
export class CodeInjectionValidator extends BaseValidator {
  readonly name = "CodeInjection"
  readonly layer = "security" as const

  validate(context: ValidationContext): ValidationResult {
    const { template } = context
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      const expressionMatches = template.matchAll(/\{\{([^}]+)\}\}/g)

      for (const match of expressionMatches) {
        const expression = match[1]?.trim()
        if (!expression) continue

        const position = this.calculatePosition(
          template,
          match.index!,
          match.index! + match[0].length,
        )
        const injectionChecks = this.checkCodeInjection(expression)

        errors.push(
          ...injectionChecks.errors.map((e) => this.createError(e.code, e.message, position)),
        )
        warnings.push(
          ...injectionChecks.warnings.map((w) => this.createWarning(w.code, w.message, position)),
        )
      }
    } catch (error) {
      errors.push(
        this.createError(
          "INJECTION_SCAN_ERROR",
          `代码注入扫描失败: ${error instanceof Error ? error.message : "未知错误"}`,
        ),
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 检查代码注入
   */
  private checkCodeInjection(expression: string): {
    errors: Array<{ code: string; message: string }>
    warnings: Array<{ code: string; message: string }>
  } {
    const errors: Array<{ code: string; message: string }> = []
    const warnings: Array<{ code: string; message: string }> = []

    // 检查HTML/Script注入
    if (/<script|<\/script|javascript:|vbscript:|data:text\/html/i.test(expression)) {
      errors.push({
        code: "SCRIPT_INJECTION",
        message: "检测到潜在的脚本注入攻击",
      })
    }

    // 检查SQL注入模式
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+.*\s+set/i,
      /--\s*$/,
      /\/\*.*\*\//,
    ]

    for (const pattern of sqlPatterns) {
      if (pattern.test(expression)) {
        warnings.push({
          code: "SQL_INJECTION_PATTERN",
          message: "检测到类似SQL注入的模式",
        })
        break
      }
    }

    // 检查URL注入
    if (/file:\/\/|ftp:\/\/|data:|blob:|javascript:/i.test(expression)) {
      warnings.push({
        code: "URL_INJECTION",
        message: "检测到潜在的URL注入",
      })
    }

    // 检查特殊字符序列
    const suspiciousSequences = [
      /%3c%73%63%72%69%70%74/i, // URL编码的<script
      /\\x[0-9a-f]{2}/i, // 十六进制编码
      /\\u[0-9a-f]{4}/i, // Unicode编码
      /&#x[0-9a-f]+;/i, // HTML实体编码
      /\\[rnt]/, // 转义字符
    ]

    for (const sequence of suspiciousSequences) {
      if (sequence.test(expression)) {
        warnings.push({
          code: "ENCODED_CONTENT",
          message: "检测到编码内容，可能用于绕过过滤",
        })
        break
      }
    }

    return { errors, warnings }
  }
}
