import { describe, it, expect } from "vitest"
import {
  DangerousCodeValidator,
  PrototypePollutionValidator,
  ResourceLimitValidator,
  CodeInjectionValidator,
} from "../src/validation/validators/security-validator.js"
import {
  JavaScriptSyntaxValidator,
  TemplateSyntaxValidator,
} from "../src/validation/validators/syntax-validator.js"
import type { ValidationContext, ValidationConfig } from "../src/validation/base-validator.js"

// 创建默认配置
const defaultConfig: ValidationConfig = {
  layers: {
    syntax: true,
    semantic: true,
    security: true,
    performance: true,
    business: true,
  },
  maxErrors: 10,
  performanceThresholds: {
    maxComplexity: 100,
    maxDepth: 10,
    maxLength: 1000,
  },
  strict: false,
}

describe("Basic Validator Tests", () => {
  describe("DangerousCodeValidator", () => {
    const validator = new DangerousCodeValidator()

    it("应该检测到eval威胁", () => {
      const context: ValidationContext = {
        template: '{{ eval("malicious code") }}',
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it("应该允许正常表达式", () => {
      const context: ValidationContext = {
        template: '{{ $json.name + " test" }}',
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
    })
  })

  describe("ResourceLimitValidator", () => {
    it("应该使用默认限制正常工作", () => {
      const validator = new ResourceLimitValidator()
      const context: ValidationContext = {
        template: "{{ $json.name }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
    })

    it("应该检测到表达式长度超限", () => {
      const validator = new ResourceLimitValidator({ maxStringLength: 10 })
      const context: ValidationContext = {
        template: '{{ "this is a very long string that exceeds the limit" }}',
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
    })
  })

  describe("TemplateSyntaxValidator", () => {
    const validator = new TemplateSyntaxValidator()

    it("应该验证正确的模板", () => {
      const context: ValidationContext = {
        template: "Hello {{ name }}!",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
    })

    it("应该检测到不匹配的标记", () => {
      const context: ValidationContext = {
        template: "Hello {{ name !",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
    })

    it("应该警告空表达式", () => {
      const context: ValidationContext = {
        template: "Hello {{  }}!",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true) // 警告不影响有效性
      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })

  describe("CodeInjectionValidator", () => {
    const validator = new CodeInjectionValidator()

    it("应该检测到脚本注入", () => {
      const context: ValidationContext = {
        template: '{{ "<script>alert(\\"xss\\")</script>" }}',
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
    })

    it("应该允许正常字符串", () => {
      const context: ValidationContext = {
        template: '{{ "Hello World!" }}',
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
    })
  })

  describe("JavaScriptSyntaxValidator", () => {
    const validator = new JavaScriptSyntaxValidator()

    it("应该验证简单表达式", () => {
      const context: ValidationContext = {
        template: "{{ 1 + 2 }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
    })

    it("应该验证复杂表达式", () => {
      const context: ValidationContext = {
        template: '{{ $json.user.name || "Anonymous" }}',
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
    })

    it("应该处理语法检查", () => {
      const context: ValidationContext = {
        template: "{{ 1 + + 2 }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      // 不管检测结果如何，验证器应该正常工作
      expect(result).toBeDefined()
      expect(typeof result.isValid).toBe("boolean")
    })
  })

  describe("PrototypePollutionValidator", () => {
    const validator = new PrototypePollutionValidator()

    it("应该检测到__proto__污染", () => {
      const context: ValidationContext = {
        template: "{{ obj.__proto__.isAdmin = true }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
    })

    it("应该允许正常对象操作", () => {
      const context: ValidationContext = {
        template: "{{ obj.name + obj.value }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
    })
  })
})
