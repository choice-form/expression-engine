/**
 * 基础功能测试套件
 * 测试表达式引擎的核心功能
 */

import { describe, test, expect, beforeEach } from "vitest"
import { ExpressionEngine, ContextManager } from "../src/index.js"

describe("🚀 基础功能测试", () => {
  let engine: ExpressionEngine
  let contextManager: ContextManager

  beforeEach(() => {
    engine = new ExpressionEngine()
    contextManager = new ContextManager()
  })

  describe("引擎初始化", () => {
    test("应该成功创建引擎实例", () => {
      expect(engine).toBeDefined()
      expect(engine).toBeInstanceOf(ExpressionEngine)
    })

    test("应该成功创建上下文管理器", () => {
      expect(contextManager).toBeDefined()
      expect(contextManager).toBeInstanceOf(ContextManager)
    })
  })

  describe("静态文本处理", () => {
    test("应该处理纯文本（无表达式）", () => {
      const result = engine.evaluate("Hello World", contextManager.createRuntimeContext())
      expect(result.success).toBe(true)
      expect(result.value).toBe("Hello World")
      expect(result.type).toBe("string")
    })

    test("应该处理空字符串", () => {
      const result = engine.evaluate("", contextManager.createRuntimeContext())
      expect(result.success).toBe(true)
      expect(result.value).toBe("")
    })

    test("应该处理特殊字符", () => {
      const text = "Hello 世界! @#$%^&*()"
      const result = engine.evaluate(text, contextManager.createRuntimeContext())
      expect(result.success).toBe(true)
      expect(result.value).toBe(text)
    })
  })

  describe("模板解析", () => {
    test("应该正确解析单个表达式", () => {
      const parsed = engine.parse("{{ 1 + 1 }}")
      expect(parsed.isTemplate).toBe(true)
      expect(parsed.expressions).toHaveLength(1)
      expect(parsed.expressions[0]?.cleaned).toBe("1 + 1")
      expect(parsed.expressions[0]?.type).toBe("javascript")
    })

    test("应该正确解析多个表达式", () => {
      const parsed = engine.parse('Hello {{ "World" }} and {{ 2 + 3 }}!')
      expect(parsed.isTemplate).toBe(true)
      expect(parsed.expressions).toHaveLength(2)
      expect(parsed.staticParts).toEqual(["Hello ", " and ", "!"])
    })

    test("应该正确解析以表达式开头的多个表达式", () => {
      const parsed = engine.parse(
        '{{ $json.user.name }}，{{ $json.user.age >= 18 ? "成年人" : "未成年" }}，在{{ $json.company.city }}工作',
      )
      expect(parsed.isTemplate).toBe(true)
      expect(parsed.expressions).toHaveLength(3)
      // 🔍 关键测试：第一个静态部分应该是空字符串！
      expect(parsed.staticParts).toEqual(["", "，", "，在", "工作"])
    })

    test("应该正确执行以表达式开头的多个表达式", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          user: { name: "张三", age: 28 },
          company: { city: "北京" },
        },
      })

      const result = engine.evaluate(
        '{{ $json.user.name }}，{{ $json.user.age >= 18 ? "成年人" : "未成年" }}，在{{ $json.company.city }}工作',
        context,
      )
      expect(result.success).toBe(true)
      // 🔍 关键测试：验证实际输出顺序正确
      expect(result.value).toBe("张三，成年人，在北京工作")
    })

    test("应该正确解析以表达式结尾的模板", () => {
      const parsed = engine.parse("结果是 {{ 2 + 3 }}")
      expect(parsed.isTemplate).toBe(true)
      expect(parsed.expressions).toHaveLength(1)
      // 🔍 最后一个静态部分应该是空字符串
      expect(parsed.staticParts).toEqual(["结果是 ", ""])
    })

    test("应该正确解析连续表达式（无静态分隔）", () => {
      const parsed = engine.parse('{{ "Hello" }}{{ "World" }}')
      expect(parsed.isTemplate).toBe(true)
      expect(parsed.expressions).toHaveLength(2)
      // 🔍 中间的静态部分应该是空字符串
      expect(parsed.staticParts).toEqual(["", "", ""])
    })

    test("应该正确执行连续表达式", () => {
      const context = contextManager.createRuntimeContext()
      const result = engine.evaluate('{{ "Hello" }}{{ "World" }}', context)
      expect(result.success).toBe(true)
      expect(result.value).toBe("HelloWorld")
    })

    test("应该处理嵌套括号", () => {
      const template = "{{ Math.max(1, 2, 3) }}"
      const parsed = engine.parse(template)
      expect(parsed.isTemplate).toBe(true)
      expect(parsed.expressions[0]?.cleaned).toBe("Math.max(1, 2, 3)")
    })

    test("应该提取依赖关系", () => {
      const parsed = engine.parse("{{ $json.name }} - {{ $vars.count }}")
      expect(parsed.dependencies).toContain("$json")
      expect(parsed.dependencies).toContain("$vars")
    })
  })

  describe("基础表达式求值", () => {
    test("应该计算数学表达式", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: "{{ 1 + 1 }}", expected: 2 },
        { expr: "{{ 10 - 3 }}", expected: 7 },
        { expr: "{{ 4 * 5 }}", expected: 20 },
        { expr: "{{ 15 / 3 }}", expected: 5 },
        { expr: "{{ 2 ** 3 }}", expected: 8 },
        { expr: "{{ 17 % 5 }}", expected: 2 },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该计算逻辑表达式", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: "{{ true && true }}", expected: true },
        { expr: "{{ true && false }}", expected: false },
        { expr: "{{ true || false }}", expected: true },
        { expr: "{{ !true }}", expected: false },
        { expr: "{{ !false }}", expected: true },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该计算比较表达式", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: "{{ 5 > 3 }}", expected: true },
        { expr: "{{ 5 < 3 }}", expected: false },
        { expr: "{{ 5 >= 5 }}", expected: true },
        { expr: "{{ 5 <= 4 }}", expected: false },
        { expr: "{{ 5 === 5 }}", expected: true },
        { expr: "{{ 5 !== 3 }}", expected: true },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该处理字符串操作", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: '{{ "Hello" + " World" }}', expected: "Hello World" },
        { expr: '{{ "test".length }}', expected: 4 },
        { expr: '{{ "TEST".toLowerCase() }}', expected: "test" },
        { expr: '{{ "test".toUpperCase() }}', expected: "TEST" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("执行性能", () => {
    test("应该在合理时间内执行", () => {
      const context = contextManager.createRuntimeContext()
      const result = engine.evaluate("{{ 1 + 1 }}", context)

      expect(result.success).toBe(true)
      expect(result.executionTime).toBeDefined()
      expect(result.executionTime!).toBeLessThan(100) // 100ms以内
    })

    test("应该支持缓存", () => {
      const context = contextManager.createRuntimeContext()
      const expression = "{{ 1 + 2 + 3 }}"

      // 首次执行
      const result1 = engine.evaluate(expression, context)
      expect(result1.success).toBe(true)
      expect(result1.value).toBe(6)

      // 再次执行（应该使用缓存）
      const result2 = engine.evaluate(expression, context)
      expect(result2.success).toBe(true)
      expect(result2.value).toBe(6)

      // 验证缓存工作（结果应该一致）
      expect(result1.value).toBe(result2.value)
    })
  })
})
