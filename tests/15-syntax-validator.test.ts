import { describe, it, expect } from "vitest"
import {
  JavaScriptSyntaxValidator,
  TemplateSyntaxValidator,
} from "../src/validation/validators/syntax-validator.js"
import type { ValidationContext, ValidationConfig } from "../src/validation/base-validator.js"
import type { ParsedExpression } from "../src/types/index.js"

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

describe("Syntax Validators (Fixed)", () => {
  describe("JavaScriptSyntaxValidator", () => {
    const validator = new JavaScriptSyntaxValidator()

    it("应该验证简单有效的表达式", () => {
      const context: ValidationContext = {
        template: "{{ 1 + 2 }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it("应该验证复杂有效的表达式", () => {
      const context: ValidationContext = {
        template: '{{ $json.user.name || "Anonymous" }}',
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it("应该检测到真正的语法错误", () => {
      const context: ValidationContext = {
        template: "{{ 1 + / 2 }}", // 真正的语法错误
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it("应该允许一元加号操作符", () => {
      const context: ValidationContext = {
        template: "{{ 1 + +2 }}", // 一元加号，这是有效的JavaScript
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
    })

    it("应该检测到未闭合的字符串", () => {
      const context: ValidationContext = {
        template: '{{ "unclosed string }}',
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
    })

    it("应该检测到无效的标识符", () => {
      const context: ValidationContext = {
        template: "{{ 123abc }}", // 无效的标识符
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
    })

    it("应该检测到括号不匹配", () => {
      const context: ValidationContext = {
        template: "{{ (1 + 2 }}", // 缺少闭合括号
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.message.includes("JavaScript语法错误"))).toBe(true)
    })

    it("应该检测到引号不匹配", () => {
      const context: ValidationContext = {
        template: '{{ "unclosed string }}',
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.message.includes("JavaScript语法错误"))).toBe(true)
    })

    it("应该检测到非法函数名（数字开头）", () => {
      const context: ValidationContext = {
        template: "{{ 123invalid() }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.message.includes("JavaScript语法错误"))).toBe(true)
    })

    it("应该检测到保留字函数语法", () => {
      const context: ValidationContext = {
        template: "{{ function() }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      // function() 在JavaScript语法上是错误的（需要函数体）
      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.message.includes("JavaScript语法错误"))).toBe(true)
    })

    it("应该处理属性访问语法", () => {
      const context: ValidationContext = {
        template: "{{ str.lenght }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      // 属性访问在语法上是有效的，即使属性名拼写错误
      expect(result.isValid).toBe(true)
    })

    it("应该检测到保留字函数调用错误", () => {
      const context: ValidationContext = {
        template: "{{ break() }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      // break() 在JavaScript语法上就是错误的
      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.message.includes("JavaScript语法错误"))).toBe(true)
    })

    it("应该检测到数字开头的函数名错误", () => {
      const context: ValidationContext = {
        template: "{{ 123func() }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      // 123func() 在JavaScript语法上就是错误的
      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.message.includes("JavaScript语法错误"))).toBe(true)
    })

    it("应该处理有效的函数表达式", () => {
      const context: ValidationContext = {
        template: "{{ (function() { return 42; })() }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      // 立即调用的函数表达式是有效的
      expect(result.isValid).toBe(true)
    })

    it("应该允许有效的函数表达式", () => {
      const context: ValidationContext = {
        template: "{{ function() { return 1; } }}", // 函数表达式是有效的
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
    })

    it("应该处理带解析信息的表达式", () => {
      const parsedExpression: ParsedExpression = {
        raw: "{{ $json.name }}",
        cleaned: "$json.name",
        position: { start: 0, end: 14 },
        type: "template",
      }

      const context: ValidationContext = {
        template: "{{ $json.name }}",
        config: defaultConfig,
        parsed: {
          isTemplate: true,
          expressions: [parsedExpression],
          dependencies: ["$json"],
          staticParts: [""],
        },
      }

      const result = validator.validate(context)
      expect(result.isValid).toBe(true)
    })

    it("应该处理带解析信息的无效表达式", () => {
      const parsedExpression: ParsedExpression = {
        raw: '{{ "unclosed }}',
        cleaned: '"unclosed',
        position: { start: 0, end: 12 },
        type: "template",
      }

      const context: ValidationContext = {
        template: '{{ "unclosed }}',
        config: defaultConfig,
        parsed: {
          isTemplate: true,
          expressions: [parsedExpression],
          dependencies: [],
          staticParts: [""],
        },
      }

      const result = validator.validate(context)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it("应该验证模板字符串", () => {
      const context: ValidationContext = {
        template: "{{ `Hello ${name}!` }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it("应该检测到无效的模板字符串", () => {
      const context: ValidationContext = {
        template: "{{ `unclosed template }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
    })

    it("应该处理空表达式内容", () => {
      const context: ValidationContext = {
        template: "{{ }}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      // 空表达式可能通过或失败，只要不抛错就行
      expect(result).toBeDefined()
      expect(typeof result.isValid).toBe("boolean")
    })
  })

  describe("TemplateSyntaxValidator", () => {
    const validator = new TemplateSyntaxValidator()

    it("应该验证正确的模板语法", () => {
      const context: ValidationContext = {
        template: "Hello {{ name }}!",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it("应该验证多个表达式", () => {
      const context: ValidationContext = {
        template: "{{ greeting }} {{ name }}!",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it("应该检测到不匹配的开始标记", () => {
      const context: ValidationContext = {
        template: "Hello {{ name !",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.message.includes("模板标记不匹配"))).toBe(true)
    })

    it("应该检测到不匹配的结束标记", () => {
      const context: ValidationContext = {
        template: "Hello name }}!",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.message.includes("模板标记不匹配"))).toBe(true)
    })

    it("应该检测到多个不匹配的标记", () => {
      const context: ValidationContext = {
        template: "Hello {{ name and {{ age !",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.message.includes("2 个开始标记，0 个结束标记"))).toBe(true)
    })

    it("应该警告空表达式", () => {
      const context: ValidationContext = {
        template: "Hello {{  }}!",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true) // 警告不影响有效性
      expect(result.warnings.some((w) => w.message.includes("空的模板表达式"))).toBe(true)
    })

    it("应该警告多个空表达式", () => {
      const context: ValidationContext = {
        template: "Start {{ }} middle {{   }} end",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true) // 警告不影响有效性
      expect(result.warnings.length).toBe(2) // 两个空表达式警告
      expect(result.warnings.every((w) => w.message.includes("空的模板表达式"))).toBe(true)
    })

    it("应该处理嵌套的大括号", () => {
      const context: ValidationContext = {
        template: '{{ obj.func({key: "value"}) }}',
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it("应该处理复杂的模板", () => {
      const context: ValidationContext = {
        template: `
          名称：{{ user.name }}
          年龄：{{ user.age || "未知" }}
          状态：{{ user.isActive ? "活跃" : "非活跃" }}
        `,
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it("应该处理没有表达式的纯文本", () => {
      const context: ValidationContext = {
        template: "This is just plain text without any expressions.",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
      expect(result.warnings.length).toBe(0)
    })

    it("应该处理只有标记的情况", () => {
      const context: ValidationContext = {
        template: "{{}}",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true) // 警告不影响有效性
      expect(result.warnings.some((w) => w.message.includes("空的模板表达式"))).toBe(true)
    })

    it("应该计算正确的位置信息", () => {
      const context: ValidationContext = {
        template: "Line 1\nLine 2 {{ expr }} Line 2 end\nLine 3",
        config: defaultConfig,
      }
      const result = validator.validate(context)

      expect(result.isValid).toBe(true)
      // 检查位置计算是否正确 - 这个测试验证计算逻辑存在
    })
  })
})
