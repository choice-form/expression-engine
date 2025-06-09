/**
 * 语法验证引擎 - 分层验证系统
 *
 * 提供全面的表达式语法、语义、安全、性能和业务规则验证
 */

import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ExpressionContext,
  ParsedTemplate,
} from "../types/index.js"

import {
  ValidationConfig,
  ValidationContext,
  ValidatorLayer,
  IValidator,
} from "./base-validator.js"

import {
  JavaScriptSyntaxValidator,
  TemplateSyntaxValidator,
} from "./validators/syntax-validator.js"
import {
  VariableDependencyValidator,
  FunctionParameterValidator,
  TypeCompatibilityValidator,
} from "./validators/semantic-validator.js"
import { DangerousCodeValidator, ResourceLimitValidator } from "./validators/security-validator.js"

export type { ValidationResult, ValidationError, ValidationWarning } from "../types/index.js"
export type {
  ValidationConfig,
  ValidationContext,
  ValidatorLayer,
  IValidator,
} from "./base-validator.js"

/**
 * 默认验证配置
 */
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  layers: {
    syntax: true,
    semantic: true,
    security: true,
    performance: true,
    business: true,
  },
  strict: false,
  maxErrors: 50,
  performanceThresholds: {
    maxComplexity: 100,
    maxDepth: 10,
    maxLength: 5000,
  },
}

/**
 * 语法验证引擎
 */
export class ValidationEngine {
  private validators = new Map<ValidatorLayer, IValidator[]>()
  private config: ValidationConfig

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config }
  }

  /**
   * 注册验证器
   */
  public registerValidator(validator: IValidator): void {
    if (!this.validators.has(validator.layer)) {
      this.validators.set(validator.layer, [])
    }
    this.validators.get(validator.layer)!.push(validator)
  }

  /**
   * 执行完整验证
   */
  public async validate(
    template: string,
    context?: Partial<ExpressionContext>,
    parsed?: ParsedTemplate,
  ): Promise<ValidationResult> {
    const validationContext: ValidationContext = {
      template,
      config: this.config,
      ...(parsed && { parsed }),
      ...(context && { context }),
    }

    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []

    // 按层级顺序执行验证
    const layers: ValidatorLayer[] = ["syntax", "semantic", "security", "performance", "business"]

    for (const layer of layers) {
      // 检查是否启用此层验证
      if (!this.config.layers[layer]) {
        continue
      }

      // 如果已经有严重错误且不是严格模式，跳过后续验证
      if (!this.config.strict && allErrors.length > 0) {
        break
      }

      const layerValidators = this.validators.get(layer) || []

      for (const validator of layerValidators) {
        try {
          const result = await validator.validate(validationContext)

          allErrors.push(...result.errors)
          allWarnings.push(...result.warnings)

          // 检查错误数量限制
          if (allErrors.length >= this.config.maxErrors) {
            allErrors.push({
              code: "TOO_MANY_ERRORS",
              message: `验证错误过多，已达到最大限制 ${this.config.maxErrors}`,
              severity: "error",
              position: { start: 0, end: template.length, line: 1, column: 1 },
            })
            break
          }
        } catch (error) {
          allErrors.push({
            code: "VALIDATOR_ERROR",
            message: `验证器 ${validator.name} 执行失败: ${error instanceof Error ? error.message : "未知错误"}`,
            severity: "error",
            position: { start: 0, end: template.length, line: 1, column: 1 },
          })
        }
      }

      // 如果达到错误限制，停止验证
      if (allErrors.length >= this.config.maxErrors) {
        break
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    }
  }

  /**
   * 执行单层验证
   */
  public async validateLayer(
    layer: ValidatorLayer,
    template: string,
    context?: Partial<ExpressionContext>,
    parsed?: ParsedTemplate,
  ): Promise<ValidationResult> {
    const validationContext: ValidationContext = {
      template,
      config: this.config,
      ...(parsed && { parsed }),
      ...(context && { context }),
    }

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const layerValidators = this.validators.get(layer) || []

    for (const validator of layerValidators) {
      try {
        const result = await validator.validate(validationContext)
        errors.push(...result.errors)
        warnings.push(...result.warnings)
      } catch (error) {
        errors.push({
          code: "VALIDATOR_ERROR",
          message: `验证器 ${validator.name} 执行失败: ${error instanceof Error ? error.message : "未知错误"}`,
          severity: "error",
          position: { start: 0, end: template.length, line: 1, column: 1 },
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 获取注册的验证器信息
   */
  public getValidatorInfo(): Array<{ count: number; layer: ValidatorLayer; name: string }> {
    const info: Array<{ count: number; layer: ValidatorLayer; name: string }> = []

    for (const [layer, validators] of this.validators) {
      info.push({
        layer,
        name: validators.map((v) => v.name).join(", "),
        count: validators.length,
      })
    }

    return info
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   */
  public getConfig(): ValidationConfig {
    return { ...this.config }
  }
}

/**
 * 创建默认验证引擎实例
 */
export function createDefaultValidationEngine(): ValidationEngine {
  const engine = new ValidationEngine()

  // 注册语法层验证器
  engine.registerValidator(new JavaScriptSyntaxValidator())
  engine.registerValidator(new TemplateSyntaxValidator())

  // 注册语义层验证器
  engine.registerValidator(new VariableDependencyValidator())
  engine.registerValidator(new FunctionParameterValidator())
  engine.registerValidator(new TypeCompatibilityValidator())

  // 注册安全层验证器
  engine.registerValidator(new DangerousCodeValidator())
  engine.registerValidator(new ResourceLimitValidator())

  return engine
}
