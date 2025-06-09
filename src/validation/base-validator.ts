/**
 * 验证器基类
 *
 * 提供验证器的通用接口和实用方法
 */

import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ExpressionContext,
  ParsedTemplate,
} from "../types/index.js"

// 重新导出类型
export type { ValidationResult, ValidationError, ValidationWarning }

/**
 * 验证配置
 */
export interface ValidationConfig {
  // 验证层级控制
  layers: {
    business: boolean
    performance: boolean
    security: boolean
    semantic: boolean
    syntax: boolean
  }
  // 最大错误数量
  maxErrors: number
  // 性能阈值
  performanceThresholds: {
    maxComplexity: number
    maxDepth: number
    maxLength: number
  }
  // 严格模式
  strict: boolean
}

/**
 * 验证上下文
 */
export interface ValidationContext {
  config: ValidationConfig
  context?: Partial<ExpressionContext>
  parsed?: ParsedTemplate
  template: string
}

/**
 * 验证器层级
 */
export type ValidatorLayer = "syntax" | "semantic" | "security" | "performance" | "business"

/**
 * 验证器接口
 */
export interface IValidator {
  readonly layer: ValidatorLayer
  readonly name: string
  validate(context: ValidationContext): ValidationResult | Promise<ValidationResult>
}

/**
 * 验证器基类
 */
export abstract class BaseValidator implements IValidator {
  abstract readonly name: string
  abstract readonly layer: ValidatorLayer

  abstract validate(context: ValidationContext): ValidationResult | Promise<ValidationResult>

  /**
   * 创建错误
   */
  protected createError(
    code: string,
    message: string,
    position: { column: number; end: number; line: number; start: number } = {
      start: 0,
      end: 0,
      line: 1,
      column: 1,
    },
  ): ValidationError {
    return {
      code,
      message,
      severity: "error",
      position,
    }
  }

  /**
   * 创建警告
   */
  protected createWarning(
    code: string,
    message: string,
    position: { column: number; end: number; line: number; start: number } = {
      start: 0,
      end: 0,
      line: 1,
      column: 1,
    },
  ): ValidationWarning {
    return {
      code,
      message,
      severity: "warning",
      position,
    }
  }

  /**
   * 创建成功结果
   */
  protected createSuccessResult(): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
    }
  }

  /**
   * 计算字符串在模板中的位置
   */
  protected calculatePosition(
    template: string,
    start: number,
    end: number = start,
  ): { column: number; end: number; line: number; start: number } {
    const lines = template.substring(0, start).split("\n")
    const line = lines.length
    const column = lines[lines.length - 1]!.length + 1

    return { start, end, line, column }
  }
}
