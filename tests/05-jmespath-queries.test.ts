/**
 * JMESPath查询测试套件
 * 测试强大的JSON查询功能
 */

import { describe, test, expect, beforeEach } from "vitest"
import { ExpressionEngine, ContextManager } from "../src/index.js"

describe("🔍 JMESPath查询测试", () => {
  let engine: ExpressionEngine
  let contextManager: ContextManager

  beforeEach(() => {
    engine = new ExpressionEngine()
    contextManager = new ContextManager()
  })

  describe("基础路径查询", () => {
    test("应该查询简单属性", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          name: "Alice",
          age: 30,
          city: "Beijing",
        },
      })

      const tests = [
        { expr: '{{ jmespath($json, "name") }}', expected: "Alice" },
        { expr: '{{ jmespath($json, "age") }}', expected: 30 },
        { expr: '{{ jmespath($json, "city") }}', expected: "Beijing" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该查询嵌套属性", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          user: {
            profile: {
              name: "Bob",
              contact: {
                email: "bob@example.com",
                phone: "123456789",
              },
            },
          },
        },
      })

      const tests = [
        { expr: '{{ jmespath($json, "user.profile.name") }}', expected: "Bob" },
        {
          expr: '{{ jmespath($json, "user.profile.contact.email") }}',
          expected: "bob@example.com",
        },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("数组查询", () => {
    test("应该查询数组元素", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          items: ["apple", "banana", "cherry"],
          numbers: [1, 2, 3, 4, 5],
        },
      })

      const tests = [
        { expr: '{{ jmespath($json, "items[0]") }}', expected: "apple" },
        { expr: '{{ jmespath($json, "items[1]") }}', expected: "banana" },
        { expr: '{{ jmespath($json, "items[-1]") }}', expected: "cherry" },
        { expr: '{{ jmespath($json, "numbers[2]") }}', expected: 3 },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该查询数组切片", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      })

      const tests = [
        { expr: '{{ jmespath($json, "numbers[:3]") }}', expected: [1, 2, 3] },
        { expr: '{{ jmespath($json, "numbers[2:5]") }}', expected: [3, 4, 5] },
        { expr: '{{ jmespath($json, "numbers[-3:]") }}', expected: [8, 9, 10] },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toEqual(expected)
      })
    })
  })

  describe("投影查询", () => {
    test("应该执行数组投影", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          users: [
            { name: "Alice", age: 25 },
            { name: "Bob", age: 30 },
            { name: "Charlie", age: 35 },
          ],
        },
      })

      const tests = [
        { expr: '{{ jmespath($json, "users[*].name") }}', expected: ["Alice", "Bob", "Charlie"] },
        { expr: '{{ jmespath($json, "users[*].age") }}', expected: [25, 30, 35] },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toEqual(expected)
      })
    })
  })

  describe("过滤查询", () => {
    test("应该按条件过滤", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          products: [
            { name: "Laptop", price: 1000, category: "electronics" },
            { name: "Book", price: 20, category: "books" },
            { name: "Phone", price: 800, category: "electronics" },
          ],
        },
      })

      const result = engine.evaluate(
        '{{ jmespath($json, "products[?price > `500`].name") }}',
        context,
      )
      expect(result.success).toBe(true)
      expect(result.value).toEqual(["Laptop", "Phone"])
    })
  })

  describe("内置函数", () => {
    test("应该使用length函数", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          items: ["a", "b", "c", "d", "e"],
        },
      })

      const result = engine.evaluate('{{ jmespath($json, "length(items)") }}', context)
      expect(result.success).toBe(true)
      expect(result.value).toBe(5)
    })

    test("应该使用sort_by函数", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          users: [
            { name: "Charlie", age: 35 },
            { name: "Alice", age: 25 },
            { name: "Bob", age: 30 },
          ],
        },
      })

      const result = engine.evaluate(
        '{{ jmespath($json, "sort_by(users, &age)[*].name") }}',
        context,
      )
      expect(result.success).toBe(true)
      expect(result.value).toEqual(["Alice", "Bob", "Charlie"])
    })
  })

  describe("错误处理", () => {
    test("应该处理无效路径", () => {
      const context = contextManager.createRuntimeContext({
        json: { name: "Alice" },
      })

      const result = engine.evaluate('{{ jmespath($json, "nonexistent.path") }}', context)
      expect(result.success).toBe(true)
      expect(result.value).toBeNull()
    })
  })
})
