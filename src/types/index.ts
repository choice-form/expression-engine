/**
 * 表达式引擎核心类型定义
 */

import type { ASTNode } from "./ast.js"

// ============================================================================
// 基础类型
// ============================================================================

export type ExpressionValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | ExpressionObject
  | ExpressionArray

export interface ExpressionObject {
  [key: string]: ExpressionValue
}

export type ExpressionArray = ExpressionValue[]

// ============================================================================
// 表达式上下文
// ============================================================================

/**
 * n8n风格的表达式上下文
 */
export interface ExpressionContext {
  // 允许任意扩展属性（用于支持libraries）
  [key: string]: unknown
  // 执行上下文
  $execution: {
    id: string
    mode: "manual" | "trigger" | "webhook" | "retry"
    resumeUrl?: string
  }
  // 内置函数
  $if: (condition: unknown, trueValue: unknown, falseValue: unknown) => unknown
  $isEmpty: (value: unknown) => boolean

  $isNotEmpty: (value: unknown) => boolean
  $item: {
    binary?: ExpressionValue
    json: ExpressionValue
  }

  // 核心数据变量
  $json: ExpressionValue

  $node: Record<string, ExpressionValue>

  // 时间变量
  $now: Date
  $today: Date
  $vars: Record<string, ExpressionValue>

  // 工作流元数据
  $workflow: {
    active: boolean
    id: string
    name: string
  }
}

// ============================================================================
// 表达式求值结果
// ============================================================================

export interface EvaluationResult {
  ast?: ASTNode
  error?: EvaluationError
  executionTime?: number
  success: boolean
  type?: string
  value?: ExpressionValue // AST输出（当outputFormat为'ast'时）
}

export interface EvaluationError {
  code: string
  message: string
  position?: {
    column: number
    end: number
    line: number
    start: number
  }
  stack?: string
}

// ============================================================================
// 表达式解析
// ============================================================================

export interface ParsedTemplate {
  dependencies: string[]
  expressions: ParsedExpression[]
  isTemplate: boolean
  staticParts: string[]
}

export interface ParsedExpression {
  cleaned: string
  position: {
    end: number
    start: number
  }
  raw: string
  type: ExpressionType
}

export type ExpressionType =
  | "template" // {{ ... }}
  | "javascript" // 纯JavaScript表达式
  | "jmespath" // JMESPath查询
  | "mixed" // 混合语法

// ============================================================================
// 安全配置
// ============================================================================

export interface SecurityConfig {
  // 是否允许函数构造
  allowFunctionConstructor: boolean
  // 调用栈深度限制
  // 允许的全局对象
  allowedGlobals: Set<string>
  // 允许的方法
  allowedMethods: Set<string>

  // 禁止的模式
  blockedPatterns: RegExp[]

  // 内存限制(bytes)
  maxCallStackSize?: number

  // 执行超时(ms)
  maxMemory?: number

  // 执行限制
  timeout: number
}

// ============================================================================
// 输出格式配置
// ============================================================================

export type OutputFormat = "string" | "ast"

// ============================================================================
// 引擎配置
// ============================================================================

export interface EngineConfig {
  // 性能配置
  cache: {
    enabled: boolean
    maxSize: number
    ttl: number // TTL in milliseconds
  }

  // 调试配置
  debug: {
    enabled: boolean
    logPerformance: boolean
    traceExecution: boolean
  }

  // 扩展库配置
  libraries: {
    jmespath: boolean
    luxon: boolean
  }

  // 输出配置
  output: {
    format: OutputFormat // 输出格式：字符串或AST
    includeMetadata: boolean // 是否包含元数据
  }

  // 安全配置
  security: SecurityConfig
}

// ============================================================================
// 代码补全
// ============================================================================

export interface CompletionItem {
  detail?: string
  documentation?: string
  insertText?: string
  kind: CompletionKind
  label: string
  sortText?: string
}

export enum CompletionKind {
  Variable = 1,
  Function = 2,
  Method = 3,
  Property = 4,
  Constant = 5,
  Keyword = 6,
}

export interface CompletionRequest {
  context: Partial<ExpressionContext>
  position: number
  template: string
}

// ============================================================================
// 语法验证
// ============================================================================

export interface ValidationResult {
  errors: ValidationError[]
  isValid: boolean
  warnings: ValidationWarning[]
}

export interface ValidationError {
  code: string
  message: string
  position: {
    column: number
    end: number
    line: number
    start: number
  }
  severity: "error" | "warning" | "info"
}

export interface ValidationWarning extends ValidationError {
  severity: "warning"
}

// ============================================================================
// 性能监控
// ============================================================================

export interface PerformanceMetrics {
  cacheHit: boolean
  evaluationTime: number
  memoryUsage?: number
  parseTime: number
  totalTime: number
}

// ============================================================================
// 额外的导出类型（用于主入口文件）
// ============================================================================

export type ExpressionResult = EvaluationResult
export type ExpressionEngineConfig = EngineConfig
export type DiagnosticMessage = ValidationError

// 重新导出AST相关类型
export type {
  ASTNode,
  AnyExpressionNode,
  TemplateNode,
  ProgramNode,
  ASTMetadata,
  ASTVisitor,
  ASTTraversalOptions,
} from "./ast.js"
