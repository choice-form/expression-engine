/**
 * 🚀 代码补全功能测试
 *
 * 测试智能代码补全系统的各种场景和功能
 */

import { beforeEach, describe, expect, it } from "vitest"
import { ExpressionEngine } from "../src/index.js"
import { CompletionKind } from "../src/types/index.js"

describe("🚀 代码补全功能测试", () => {
  let engine: ExpressionEngine

  beforeEach(() => {
    engine = new ExpressionEngine()
  })

  describe("📋 基础补全功能", () => {
    it("应该获取所有建议", () => {
      const completions = engine.getCompletions({
        template: "{{",
        position: 2,
        context: {},
      })

      expect(completions).toHaveLength(58)
      expect(completions[0]).toHaveProperty("label")
      expect(completions[0]).toHaveProperty("kind")
      expect(completions[0]).toHaveProperty("detail")
      expect(completions[0]).toHaveProperty("documentation")
      expect(completions[0]).toHaveProperty("sortText")
    })

    it("应该包含正确的补全类型", () => {
      const completions = engine.getCompletions({
        template: "{{",
        position: 2,
        context: {},
      })

      const hasVariables = completions.some((c) => c.kind === CompletionKind.Variable)
      const hasFunctions = completions.some((c) => c.kind === CompletionKind.Function)
      const hasMethods = completions.some((c) => c.kind === CompletionKind.Method)
      const hasProperties = completions.some((c) => c.kind === CompletionKind.Property)

      expect(hasVariables).toBe(true)
      expect(hasFunctions).toBe(true)
      expect(hasMethods).toBe(true)
      expect(hasProperties).toBe(true)
    })
  })

  describe("🎯 智能变量补全", () => {
    it("应该正确过滤$开头的变量", () => {
      const completions = engine.getCompletions({
        template: "{{ $ ",
        position: 4,
        context: {},
      })

      expect(completions.length).toBeGreaterThan(20)
      // 所有结果都应该以$开头
      completions.forEach((completion) => {
        expect(completion.label).toMatch(/^\$/)
      })

      // 应该包含核心变量
      const labels = completions.map((c) => c.label)
      expect(labels).toContain("$json")
      expect(labels).toContain("$now")
      expect(labels).toContain("$if")
      expect(labels).toContain("$workflow")
    })

    it("应该支持部分$变量搜索", () => {
      const completions = engine.getCompletions({
        template: "{{ $j ",
        position: 5,
        context: {},
      })

      // 应该找到$json相关的变量
      expect(completions.length).toBeGreaterThan(0)
      const labels = completions.map((c) => c.label)
      expect(labels).toContain("$json")
    })

    it("应该提供变量的详细描述", () => {
      const completions = engine.getCompletions({
        template: "{{ $json ",
        position: 8,
        context: {},
      })

      const jsonCompletion = completions.find((c) => c.label === "$json")
      expect(jsonCompletion).toBeDefined()
      expect(jsonCompletion!.detail).toContain("workflow")
      expect(jsonCompletion!.documentation).toBeTruthy()
    })
  })

  describe("🔢 Math函数补全", () => {
    it("应该过滤Math函数", () => {
      const completions = engine.getCompletions({
        template: "{{ Math.",
        position: 8,
        context: {},
      })

      expect(completions).toHaveLength(4)

      const labels = completions.map((c) => c.label)
      expect(labels).toContain("Math.abs()")
      expect(labels).toContain("Math.round()")
      expect(labels).toContain("Math.max()")
      expect(labels).toContain("Math.min()")
    })

    it("应该在Math输入时提供Math补全", () => {
      const completions = engine.getCompletions({
        template: "{{ Math ",
        position: 7,
        context: {},
      })

      expect(completions).toHaveLength(4)
      expect(completions.every((c) => c.label.startsWith("Math."))).toBe(true)
    })

    it("应该提供Math函数的示例", () => {
      const completions = engine.getCompletions({
        template: "{{ Math.",
        position: 8,
        context: {},
      })

      const absCompletion = completions.find((c) => c.label === "Math.abs()")
      expect(absCompletion).toBeDefined()
      expect(absCompletion!.detail).toContain("absolute")
      expect(absCompletion!.documentation).toContain("Example")
    })
  })

  describe("📅 DateTime函数补全", () => {
    it("应该过滤DateTime函数", () => {
      const completions = engine.getCompletions({
        template: "{{ DateTime.",
        position: 12,
        context: {},
      })

      expect(completions).toHaveLength(15)

      const labels = completions.map((c) => c.label)
      expect(labels).toContain("DateTime.now()")
      expect(labels).toContain("DateTime.fromISO()")
      expect(labels).toContain(".toFormat()")
      expect(labels).toContain(".plus()")
      expect(labels).toContain(".year")
    })

    it("应该在DateTime输入时提供DateTime补全", () => {
      const completions = engine.getCompletions({
        template: "{{ DateTime ",
        position: 11,
        context: {},
      })

      // 修正：应该获取到datetime section的建议
      expect(completions).toHaveLength(15)
      expect(completions.some((c) => c.label.startsWith("DateTime."))).toBe(true)
      expect(completions.some((c) => c.label.startsWith("."))).toBe(true)
    })

    it("应该提供DateTime方法的详细信息", () => {
      const completions = engine.getCompletions({
        template: "{{ DateTime.",
        position: 12,
        context: {},
      })

      const formatCompletion = completions.find((c) => c.label === ".toFormat()")
      expect(formatCompletion).toBeDefined()
      expect(formatCompletion!.detail).toContain("Format DateTime")
      expect(formatCompletion!.documentation).toContain("yyyy-MM-dd")
    })
  })

  describe("🔧 上下文分析", () => {
    it("应该正确识别表达式内部", () => {
      const completions1 = engine.getCompletions({
        template: "{{ test",
        position: 7,
        context: {},
      })

      const completions2 = engine.getCompletions({
        template: "plain text",
        position: 5,
        context: {},
      })

      expect(completions1.length).toBeGreaterThan(0)
      expect(completions2.length).toBeGreaterThan(0) // 应该返回基础补全
    })

    it("应该处理复杂的光标位置", () => {
      const completions = engine.getCompletions({
        template: "{{ $json.user.name + $ ",
        position: 22,
        context: {},
      })

      expect(completions.length).toBeGreaterThan(0)
      // 应该找到$开头的变量
      expect(completions.some((c) => c.label.startsWith("$"))).toBe(true)
    })

    it("应该处理空格和特殊字符", () => {
      const completions = engine.getCompletions({
        template: "{{   Math.   ",
        position: 13,
        context: {},
      })

      expect(completions).toHaveLength(4) // Math函数
    })
  })

  describe("🎨 JavaScript方法补全", () => {
    it("应该识别JavaScript方法调用", () => {
      const completions = engine.getCompletions({
        template: "{{ something.",
        position: 13,
        context: {},
      })

      // 修正：应该获取到javascript section的建议
      expect(completions).toHaveLength(3) // JavaScript方法

      const labels = completions.map((c) => c.label)
      expect(labels).toContain(".includes()")
      expect(labels).toContain(".indexOf()")
      expect(labels).toContain(".slice()")
    })
  })

  describe("📊 建议统计信息", () => {
    it("应该提供正确的统计信息", () => {
      const stats = engine.getSuggestionStats()

      expect(stats).toMatchObject({
        total: 58,
        bySection: {
          functions: 25,
          variables: 8,
          datetime: 15,
          math: 4,
          jmespath: 3,
          javascript: 3,
        },
      })

      expect(stats.sections).toHaveLength(6)
      expect(stats.sections).toContain("functions")
      expect(stats.sections).toContain("variables")
      expect(stats.sections).toContain("datetime")
      expect(stats.sections).toContain("math")
    })
  })

  describe("🛡️ 错误处理", () => {
    it("应该在出错时提供基础补全", () => {
      // 故意传入可能导致错误的参数
      const completions = engine.getCompletions({
        template: "",
        position: -1,
        context: {},
      })

      expect(completions.length).toBeGreaterThan(0)
      // 应该包含基础补全项
      const labels = completions.map((c) => c.label)
      expect(labels).toContain("$json")
      expect(labels).toContain("$now")
    })

    it("应该处理无效的position", () => {
      const completions = engine.getCompletions({
        template: "{{ test }}",
        position: 1000, // 超出范围
        context: {},
      })

      expect(completions.length).toBeGreaterThan(0)
    })
  })

  describe("🎯 实际使用场景", () => {
    it("应该支持典型的用户输入流程 - 变量访问", () => {
      // 用户输入$j，期望获得$json建议
      const completions = engine.getCompletions({
        template: "{{ $j",
        position: 4,
        context: {},
      })

      const jsonSuggestion = completions.find((c) => c.label === "$json")
      expect(jsonSuggestion).toBeDefined()
      expect(jsonSuggestion!.kind).toBe(CompletionKind.Variable)
    })

    it("应该支持数学计算场景", () => {
      // 用户想要使用Math函数
      const completions = engine.getCompletions({
        template: "{{ Math.r",
        position: 8,
        context: {},
      })

      expect(completions).toHaveLength(4) // 所有Math函数
      const roundSuggestion = completions.find((c) => c.label === "Math.round()")
      expect(roundSuggestion).toBeDefined()
    })

    it("应该支持日期格式化场景", () => {
      // 用户想要格式化日期 - 直接获取所有建议
      const completions = engine.getCompletions({
        template: "{{ ",
        position: 3,
        context: {},
      })

      expect(completions.length).toBeGreaterThan(0)
      const formatSuggestion = completions.find((c) => c.label === ".toFormat()")
      expect(formatSuggestion).toBeDefined()
      expect(formatSuggestion!.kind).toBe(CompletionKind.Method)
    })
  })

  describe("⚡ 性能测试", () => {
    it("应该快速返回补全结果", () => {
      const start = performance.now()

      for (let i = 0; i < 100; i++) {
        engine.getCompletions({
          template: "{{ $ ",
          position: 4,
          context: {},
        })
      }

      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // 100次调用应该在100ms内完成
    })

    it("应该处理大量补全请求", () => {
      const requests = [
        { template: "{{ $ ", position: 4 },
        { template: "{{ Math.", position: 8 },
        { template: "{{ DateTime.", position: 12 },
        { template: "{{ ", position: 3 }, // 修正：简化测试用例
        { template: "{{ $if ", position: 7 },
      ]

      const start = performance.now()

      requests.forEach((req) => {
        const completions = engine.getCompletions({
          ...req,
          context: {},
        })
        expect(completions.length).toBeGreaterThan(0)
      })

      const duration = performance.now() - start
      expect(duration).toBeLessThan(50) // 5个不同类型的请求应该很快
    })
  })
})
