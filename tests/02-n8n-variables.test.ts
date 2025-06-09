/**
 * n8n变量兼容性测试套件
 * 测试所有n8n变量的正确实现
 */

import { describe, test, expect, beforeEach } from "vitest"
import { ExpressionEngine, ContextManager } from "../src/index.js"

describe("🎯 n8n变量兼容性测试", () => {
  let engine: ExpressionEngine
  let contextManager: ContextManager

  beforeEach(() => {
    engine = new ExpressionEngine()
    contextManager = new ContextManager()
  })

  describe("$json 变量", () => {
    test("应该访问简单JSON数据", () => {
      const context = contextManager.createRuntimeContext({
        json: { name: "Alice", age: 30 },
      })

      const tests = [
        { expr: "{{ $json.name }}", expected: "Alice" },
        { expr: "{{ $json.age }}", expected: 30 },
        { expr: "{{ $json.age + 5 }}", expected: 35 },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该访问嵌套JSON数据", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          user: {
            profile: {
              name: "Bob",
              settings: { theme: "dark" },
            },
          },
        },
      })

      const tests = [
        { expr: "{{ $json.user.profile.name }}", expected: "Bob" },
        { expr: "{{ $json.user.profile.settings.theme }}", expected: "dark" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该访问数组数据", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          items: ["apple", "banana", "cherry"],
          users: [
            { name: "Alice", age: 25 },
            { name: "Bob", age: 30 },
          ],
        },
      })

      const tests = [
        { expr: "{{ $json.items[0] }}", expected: "apple" },
        { expr: "{{ $json.items.length }}", expected: 3 },
        { expr: "{{ $json.users[1].name }}", expected: "Bob" },
        { expr: "{{ $json.users[1].age }}", expected: 30 },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("$item 变量", () => {
    test("应该访问当前项数据", () => {
      const context = contextManager.createRuntimeContext({
        item: {
          json: { id: 123, title: "Test Item" },
          binary: undefined,
        },
      })

      const tests = [
        { expr: "{{ $item.json.id }}", expected: 123 },
        { expr: "{{ $item.json.title }}", expected: "Test Item" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("$node 变量", () => {
    test("应该访问节点信息", () => {
      const context = contextManager.createRuntimeContext({
        node: {
          name: "HTTP Request",
          type: "n8n-nodes-base.httpRequest",
          parameters: { method: "GET", url: "https://api.example.com" },
        },
      })

      const tests = [
        { expr: "{{ $node.name }}", expected: "HTTP Request" },
        { expr: "{{ $node.type }}", expected: "n8n-nodes-base.httpRequest" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("$vars 变量", () => {
    test("应该访问工作流变量", () => {
      const context = contextManager.createRuntimeContext({
        vars: {
          apiKey: "secret-key-123",
          maxRetries: 3,
          environment: "production",
        },
      })

      const tests = [
        { expr: "{{ $vars.apiKey }}", expected: "secret-key-123" },
        { expr: "{{ $vars.maxRetries }}", expected: 3 },
        { expr: "{{ $vars.environment }}", expected: "production" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("$workflow 变量", () => {
    test("应该访问工作流元数据", () => {
      const contextManager = new ContextManager({
        workflowData: {
          id: "wf-123",
          name: "Test Workflow",
          active: true,
        },
      })

      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: "{{ $workflow.id }}", expected: "wf-123" },
        { expr: "{{ $workflow.name }}", expected: "Test Workflow" },
        { expr: "{{ $workflow.active }}", expected: true },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("$execution 变量", () => {
    test("应该访问执行上下文", () => {
      const contextManager = new ContextManager({
        executionData: {
          id: "exec-456",
          mode: "manual",
        },
      })

      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: "{{ $execution.id }}", expected: "exec-456" },
        { expr: "{{ $execution.mode }}", expected: "manual" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("$now 和 $today 变量", () => {
    test("应该提供日期时间变量", () => {
      const context = contextManager.createRuntimeContext()

      // 测试 $now 是原生Date对象
      const nowResult = engine.evaluate("{{ $now instanceof Date }}", context)
      expect(nowResult.success).toBe(true)
      expect(nowResult.value).toBe(true)

      // 测试 $today 是原生Date对象
      const todayResult = engine.evaluate("{{ $today instanceof Date }}", context)
      expect(todayResult.success).toBe(true)
      expect(todayResult.value).toBe(true)

      // 测试Date方法
      const yearResult = engine.evaluate("{{ $now.getFullYear() }}", context)
      expect(yearResult.success).toBe(true)
      expect(typeof yearResult.value).toBe("number")
      expect(yearResult.value).toBeGreaterThan(2020)
    })
  })

  describe("变量组合测试", () => {
    test("应该支持多变量组合", () => {
      const context = contextManager.createRuntimeContext({
        json: { user: { name: "Alice" } },
        vars: { greeting: "Hello" },
      })

      const result = engine.evaluate('{{ $vars.greeting + ", " + $json.user.name + "!" }}', context)
      expect(result.success).toBe(true)
      expect(result.value).toBe("Hello, Alice!")
    })

    test("应该支持模板字符串中的多变量", () => {
      const context = contextManager.createRuntimeContext({
        json: { count: 5 },
        vars: { type: "items" },
      })

      const result = engine.evaluate("Found {{ $json.count }} {{ $vars.type }} in total", context)
      expect(result.success).toBe(true)
      expect(result.value).toBe("Found 5 items in total")
    })
  })

  describe("变量访问边界情况", () => {
    test("应该处理不存在的属性", () => {
      const context = contextManager.createRuntimeContext({
        json: { name: "Alice" },
      })

      const result = engine.evaluate("{{ $json.nonexistent }}", context)
      expect(result.success).toBe(true)
      expect(result.value).toBeUndefined()
    })

    test("应该处理深层不存在的属性", () => {
      const context = contextManager.createRuntimeContext({
        json: { user: { name: "Alice" } },
      })

      // 使用可选链操作符安全访问深层属性
      const result = engine.evaluate("{{ $json.user?.profile?.age }}", context)
      expect(result.success).toBe(true)
      expect(result.value).toBeUndefined()
    })

    test("应该处理空对象", () => {
      const context = contextManager.createRuntimeContext({
        json: {},
      })

      const result = engine.evaluate("{{ $json.anything }}", context)
      expect(result.success).toBe(true)
      expect(result.value).toBeUndefined()
    })
  })
})
