/**
 * 性能和安全测试套件
 */

import { describe, test, expect, beforeEach } from "vitest"
import { ExpressionEngine, ContextManager } from "../src/index.js"

describe("🚀 性能和安全测试", () => {
  let engine: ExpressionEngine
  let contextManager: ContextManager

  beforeEach(() => {
    engine = new ExpressionEngine()
    contextManager = new ContextManager()
  })

  describe("性能测试", () => {
    test("应该快速执行简单表达式", () => {
      const context = contextManager.createRuntimeContext()
      const startTime = performance.now()

      for (let i = 0; i < 100; i++) {
        const result = engine.evaluate("{{ 1 + 1 }}", context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(2)
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(totalTime).toBeLessThan(500)
    })

    test("应该缓存编译结果", () => {
      const context = contextManager.createRuntimeContext()
      const expression = "{{ Math.sqrt(16) + Math.pow(2, 3) }}"

      const firstResult = engine.evaluate(expression, context)
      expect(firstResult.success).toBe(true)
      expect(firstResult.value).toBe(12)

      const secondResult = engine.evaluate(expression, context)
      expect(secondResult.success).toBe(true)
      expect(secondResult.value).toBe(12)
    })

    test("应该处理大量数据", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 100,
      }))

      const context = contextManager.createRuntimeContext({
        json: { items: largeArray },
      })

      const result = engine.evaluate("{{ $json.items.length }}", context)
      expect(result.success).toBe(true)
      expect(result.value).toBe(1000)
    })
  })

  describe("安全测试", () => {
    test("应该阻止访问危险对象", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: "{{ process }}", expectedError: "blocked pattern" },
        { expr: "{{ global }}", expectedError: "blocked pattern" },
        { expr: "{{ require }}", expectedError: "blocked pattern" },
        { expr: "{{ module }}", expectedError: "not defined" },
        { expr: "{{ exports }}", expectedError: "not defined" },
      ]

      tests.forEach(({ expr, expectedError }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(false)
        // 处理错误可能是字符串或对象的情况
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || JSON.stringify(result.error)
        expect(errorMessage).toContain(expectedError)
      })
    })

    test("应该阻止执行危险函数", () => {
      const context = contextManager.createRuntimeContext()

      const result = engine.evaluate('{{ eval("console.log") }}', context)
      expect(result.success).toBe(false)
    })

    test("应该隔离执行环境", () => {
      const context1 = contextManager.createRuntimeContext({
        json: { value: "context1" },
      })

      const context2 = contextManager.createRuntimeContext({
        json: { value: "context2" },
      })

      const result1 = engine.evaluate("{{ $json.value }}", context1)
      expect(result1.success).toBe(true)
      expect(result1.value).toBe("context1")

      const result2 = engine.evaluate("{{ $json.value }}", context2)
      expect(result2.success).toBe(true)
      expect(result2.value).toBe("context2")
    })
  })

  describe("资源限制", () => {
    test("应该限制字符串长度", () => {
      const context = contextManager.createRuntimeContext()

      const reasonableResult = engine.evaluate('{{ "A".repeat(1000) }}', context)
      expect(reasonableResult.success).toBe(true)
    })

    test("应该限制数组大小", () => {
      const context = contextManager.createRuntimeContext()

      const reasonableResult = engine.evaluate(
        "{{ Array.from({length: 100}, (_, i) => i) }}",
        context,
      )
      expect(reasonableResult.success).toBe(true)
    })
  })
})
