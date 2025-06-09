/**
 * 内置函数测试套件
 * 测试所有内置函数的正确实现
 */

import { describe, test, expect, beforeEach } from "vitest"
import { ExpressionEngine, ContextManager } from "../src/index.js"

describe("⚡ 内置函数测试", () => {
  let engine: ExpressionEngine
  let contextManager: ContextManager

  beforeEach(() => {
    engine = new ExpressionEngine()
    contextManager = new ContextManager()
  })

  describe("条件函数", () => {
    test("$if - 基础条件判断", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: '{{ $if(true, "yes", "no") }}', expected: "yes" },
        { expr: '{{ $if(false, "yes", "no") }}', expected: "no" },
        { expr: '{{ $if(1 > 0, "positive", "negative") }}', expected: "positive" },
        { expr: '{{ $if(5 < 3, "smaller", "larger") }}', expected: "larger" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("$if - 复杂条件", () => {
      const context = contextManager.createRuntimeContext({
        json: { user: { age: 25, status: "active" } },
      })

      const tests = [
        { expr: '{{ $if($json.user.age >= 18, "成年人", "未成年") }}', expected: "成年人" },
        {
          expr: '{{ $if($json.user.status === "active", "已激活", "未激活") }}',
          expected: "已激活",
        },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("空值检查函数", () => {
    test("$isEmpty - 各种空值检查", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          nullValue: null,
          undefinedValue: undefined,
          emptyString: "",
          emptyArray: [],
          emptyObject: {},
          nonEmpty: "test",
          nonEmptyArray: [1, 2, 3],
        },
      })

      const tests = [
        { expr: "{{ $isEmpty($json.nullValue) }}", expected: true },
        { expr: "{{ $isEmpty($json.undefinedValue) }}", expected: true },
        { expr: "{{ $isEmpty($json.emptyString) }}", expected: true },
        { expr: "{{ $isEmpty($json.emptyArray) }}", expected: true },
        { expr: "{{ $isEmpty($json.emptyObject) }}", expected: true },
        { expr: "{{ $isEmpty($json.nonEmpty) }}", expected: false },
        { expr: "{{ $isEmpty($json.nonEmptyArray) }}", expected: false },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("$isNotEmpty - 非空检查", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          nullValue: null,
          emptyString: "",
          nonEmpty: "test",
        },
      })

      const tests = [
        { expr: "{{ $isNotEmpty($json.nullValue) }}", expected: false },
        { expr: "{{ $isNotEmpty($json.emptyString) }}", expected: false },
        { expr: "{{ $isNotEmpty($json.nonEmpty) }}", expected: true },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("字符串函数", () => {
    test("字符串转换函数", () => {
      const context = contextManager.createRuntimeContext({
        json: { text: "Hello World" },
      })

      const tests = [
        { expr: "{{ $upper($json.text) }}", expected: "HELLO WORLD" },
        { expr: "{{ $lower($json.text) }}", expected: "hello world" },
        { expr: "{{ $capitalize($json.text) }}", expected: "Hello world" },
        { expr: '{{ $trim("  spaced  ") }}', expected: "spaced" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("字符串操作函数", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: '{{ $replace("hello world", "world", "universe") }}', expected: "hello universe" },
        { expr: '{{ $split("a,b,c", ",") }}', expected: ["a", "b", "c"] },
        { expr: '{{ $join(["a", "b", "c"], "-") }}', expected: "a-b-c" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toEqual(expected)
      })
    })
  })

  describe("数组函数", () => {
    test("数组基础操作", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          numbers: [1, 2, 3, 4, 5],
          duplicates: [1, 2, 2, 3, 3, 3],
          users: [
            { name: "Alice", score: 95 },
            { name: "Bob", score: 87 },
            { name: "Charlie", score: 92 },
          ],
        },
      })

      const tests = [
        { expr: "{{ $length($json.numbers) }}", expected: 5 },
        { expr: "{{ $unique($json.duplicates) }}", expected: [1, 2, 3] },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toEqual(expected)
      })
    })

    test("数组排序", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          numbers: [3, 1, 4, 1, 5],
          words: ["zebra", "apple", "banana"],
          users: [
            { name: "Alice", score: 95 },
            { name: "Bob", score: 87 },
            { name: "Charlie", score: 92 },
          ],
        },
      })

      // 测试数字排序
      const numberSort = engine.evaluate("{{ $sort($json.numbers) }}", context)
      expect(numberSort.success).toBe(true)
      expect(numberSort.value).toEqual([1, 1, 3, 4, 5])

      // 测试字符串排序
      const wordSort = engine.evaluate("{{ $sort($json.words) }}", context)
      expect(wordSort.success).toBe(true)
      expect(wordSort.value).toEqual(["apple", "banana", "zebra"])

      // 测试对象排序
      const userSort = engine.evaluate('{{ $sort($json.users, "score") }}', context)
      expect(userSort.success).toBe(true)
      expect(userSort.value).toEqual([
        { name: "Bob", score: 87 },
        { name: "Charlie", score: 92 },
        { name: "Alice", score: 95 },
      ])
    })

    test("数组分组", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          items: [
            { name: "Apple", category: "fruit" },
            { name: "Carrot", category: "vegetable" },
            { name: "Banana", category: "fruit" },
            { name: "Spinach", category: "vegetable" },
          ],
        },
      })

      const result = engine.evaluate('{{ $groupBy($json.items, "category") }}', context)
      expect(result.success).toBe(true)
      expect(result.value).toEqual({
        fruit: [
          { name: "Apple", category: "fruit" },
          { name: "Banana", category: "fruit" },
        ],
        vegetable: [
          { name: "Carrot", category: "vegetable" },
          { name: "Spinach", category: "vegetable" },
        ],
      })
    })
  })

  describe("数字函数", () => {
    test("数字格式化", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: '{{ $number("123.456") }}', expected: 123.456 },
        { expr: '{{ $number("123.456", 2) }}', expected: 123.46 },
        { expr: '{{ $number("invalid") }}', expected: 0 },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("随机数生成", () => {
      const context = contextManager.createRuntimeContext()

      // 测试随机数范围
      const randomResult = engine.evaluate("{{ $random(1, 10) }}", context)
      expect(randomResult.success).toBe(true)
      expect(typeof randomResult.value).toBe("number")
      expect(randomResult.value).toBeGreaterThanOrEqual(1)
      expect(randomResult.value).toBeLessThanOrEqual(10)

      // 测试随机整数
      const randomIntResult = engine.evaluate("{{ $randomInt(1, 10) }}", context)
      expect(randomIntResult.success).toBe(true)
      expect(Number.isInteger(randomIntResult.value)).toBe(true)
    })
  })

  describe("工具函数", () => {
    test("UUID生成", () => {
      const context = contextManager.createRuntimeContext()

      const result = engine.evaluate("{{ $uuid() }}", context)
      expect(result.success).toBe(true)
      expect(typeof result.value).toBe("string")
      expect(result.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )
    })

    test("时间戳生成", () => {
      const context = contextManager.createRuntimeContext()

      const result = engine.evaluate("{{ $timestamp() }}", context)
      expect(result.success).toBe(true)
      expect(typeof result.value).toBe("number")
      expect(result.value).toBeGreaterThan(1600000000000) // 2020年以后
    })

    test("日期格式化", () => {
      const context = contextManager.createRuntimeContext()
      const timestamp = new Date("2023-12-25 15:30:45").getTime()

      const tests = [
        { expr: `{{ $formatDate(${timestamp}, "YYYY-MM-DD") }}`, expected: "2023-12-25" },
        {
          expr: `{{ $formatDate(${timestamp}, "YYYY-MM-DD HH:mm:ss") }}`,
          expected: "2023-12-25 15:30:45",
        },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("对象函数", () => {
    test("对象键值操作", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          user: { name: "Alice", age: 30, city: "Beijing" },
        },
      })

      const tests = [
        { expr: "{{ $keys($json.user) }}", expected: ["name", "age", "city"] },
        { expr: "{{ $values($json.user) }}", expected: ["Alice", 30, "Beijing"] },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toEqual(expected)
      })
    })
  })

  describe("复合函数测试", () => {
    test("函数组合使用", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          users: [
            { name: "alice doe", email: "alice@test.com" },
            { name: "bob smith", email: "bob@test.com" },
            { name: "charlie brown", email: "" },
          ],
        },
      })

      // 复杂的函数组合：过滤有邮箱的用户，提取姓名并转大写
      const result = engine.evaluate(
        "{{ $map($filter($json.users, user => $isNotEmpty(user.email)), user => $upper(user.name)) }}",
        context,
      )

      expect(result.success).toBe(true)
      expect(result.value).toEqual(["ALICE DOE", "BOB SMITH"])
    })

    test("条件与字符串函数组合", () => {
      const context = contextManager.createRuntimeContext({
        json: { user: { name: "alice", status: "active" } },
      })

      const result = engine.evaluate(
        '{{ $if($json.user.status === "active", $upper("欢迎 " + $json.user.name), "用户未激活") }}',
        context,
      )

      expect(result.success).toBe(true)
      expect(result.value).toBe("欢迎 ALICE")
    })
  })
})
