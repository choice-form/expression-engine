/**
 * Luxon日期时间测试套件
 * 测试DateTime库的集成和功能
 */

import { describe, test, expect, beforeEach } from "vitest"
import { ExpressionEngine, ContextManager } from "../src/index.js"

describe("📅 Luxon日期时间测试", () => {
  let engine: ExpressionEngine
  let contextManager: ContextManager

  beforeEach(() => {
    engine = new ExpressionEngine()
    contextManager = new ContextManager()
  })

  describe("DateTime创建", () => {
    test("应该创建当前时间", () => {
      const context = contextManager.createRuntimeContext()

      const result = engine.evaluate("{{ DateTime.now().year }}", context)
      expect(result.success).toBe(true)
      expect(typeof result.value).toBe("number")
      expect(result.value).toBeGreaterThan(2020)
    })

    test("应该创建指定日期", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: '{{ DateTime.fromISO("2023-12-25").day }}', expected: 25 },
        { expr: '{{ DateTime.fromISO("2023-12-25").month }}', expected: 12 },
        { expr: '{{ DateTime.fromISO("2023-12-25").year }}', expected: 2023 },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该从时间戳创建", () => {
      const context = contextManager.createRuntimeContext()
      const timestamp = 1703548800000 // 2023-12-26T00:00:00.000Z

      const result = engine.evaluate(
        `{{ DateTime.fromMillis(${timestamp}, { zone: "UTC" }).toFormat("yyyy-MM-dd") }}`,
        context,
      )
      expect(result.success).toBe(true)
      expect(result.value).toBe("2023-12-26")
    })
  })

  describe("DateTime格式化", () => {
    test("应该格式化为ISO字符串", () => {
      const context = contextManager.createRuntimeContext()

      const result = engine.evaluate(
        '{{ DateTime.fromISO("2023-12-25T15:30:45").toISO() }}',
        context,
      )
      expect(result.success).toBe(true)
      expect(result.value).toContain("2023-12-25T15:30:45")
    })

    test("应该使用自定义格式", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        {
          expr: '{{ DateTime.fromISO("2023-12-25").toFormat("yyyy-MM-dd") }}',
          expected: "2023-12-25",
        },
        {
          expr: '{{ DateTime.fromISO("2023-12-25").toFormat("dd/MM/yyyy") }}',
          expected: "25/12/2023",
        },
        {
          expr: '{{ DateTime.fromISO("2023-12-25T15:30:45").toFormat("yyyy-MM-dd HH:mm:ss") }}',
          expected: "2023-12-25 15:30:45",
        },
        {
          expr: '{{ DateTime.fromISO("2023-12-25").toFormat("EEEE, MMMM d, yyyy") }}',
          expected: "Monday, December 25, 2023",
        },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该格式化为本地化字符串", () => {
      const context = contextManager.createRuntimeContext()

      const result = engine.evaluate(
        '{{ DateTime.fromISO("2023-12-25").toLocaleString() }}',
        context,
      )
      expect(result.success).toBe(true)
      expect(typeof result.value).toBe("string")
      expect(result.value).toContain("12/25/2023")
    })
  })

  describe("DateTime计算", () => {
    test("应该支持日期加法", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: '{{ DateTime.fromISO("2023-12-25").plus({ days: 5 }).day }}', expected: 30 },
        { expr: '{{ DateTime.fromISO("2023-12-25").plus({ months: 1 }).month }}', expected: 1 },
        { expr: '{{ DateTime.fromISO("2023-12-25").plus({ years: 1 }).year }}', expected: 2024 },
        {
          expr: '{{ DateTime.fromISO("2023-12-25T10:00:00").plus({ hours: 5 }).hour }}',
          expected: 15,
        },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该支持日期减法", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: '{{ DateTime.fromISO("2023-12-25").minus({ days: 5 }).day }}', expected: 20 },
        { expr: '{{ DateTime.fromISO("2023-12-25").minus({ months: 1 }).month }}', expected: 11 },
        {
          expr: '{{ DateTime.fromISO("2023-12-25T15:00:00").minus({ hours: 3 }).hour }}',
          expected: 12,
        },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该计算日期差值", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        {
          expr: '{{ DateTime.fromISO("2023-12-25").diff(DateTime.fromISO("2023-12-20"), "days").days }}',
          expected: 5,
        },
        {
          expr: '{{ DateTime.fromISO("2023-12-25").diff(DateTime.fromISO("2023-11-25"), "months").months }}',
          expected: 1,
        },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("DateTime比较", () => {
    test("应该比较日期", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        {
          expr: '{{ DateTime.fromISO("2023-12-25") > DateTime.fromISO("2023-12-20") }}',
          expected: true,
        },
        {
          expr: '{{ DateTime.fromISO("2023-12-25") < DateTime.fromISO("2023-12-20") }}',
          expected: false,
        },
        {
          expr: '{{ DateTime.fromISO("2023-12-25").equals(DateTime.fromISO("2023-12-25")) }}',
          expected: true,
        },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("DateTime属性", () => {
    test("应该获取日期组件", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: '{{ DateTime.fromISO("2023-12-25T15:30:45").year }}', expected: 2023 },
        { expr: '{{ DateTime.fromISO("2023-12-25T15:30:45").month }}', expected: 12 },
        { expr: '{{ DateTime.fromISO("2023-12-25T15:30:45").day }}', expected: 25 },
        { expr: '{{ DateTime.fromISO("2023-12-25T15:30:45").hour }}', expected: 15 },
        { expr: '{{ DateTime.fromISO("2023-12-25T15:30:45").minute }}', expected: 30 },
        { expr: '{{ DateTime.fromISO("2023-12-25T15:30:45").second }}', expected: 45 },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该获取星期信息", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: '{{ DateTime.fromISO("2023-12-25").weekday }}', expected: 1 }, // Monday
        { expr: '{{ DateTime.fromISO("2023-12-25").weekdayLong }}', expected: "Monday" },
        { expr: '{{ DateTime.fromISO("2023-12-25").weekdayShort }}', expected: "Mon" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该获取月份信息", () => {
      const context = contextManager.createRuntimeContext()

      const tests = [
        { expr: '{{ DateTime.fromISO("2023-12-25").monthLong }}', expected: "December" },
        { expr: '{{ DateTime.fromISO("2023-12-25").monthShort }}', expected: "Dec" },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })

  describe("时区处理", () => {
    test("应该设置时区", () => {
      const context = contextManager.createRuntimeContext()

      const result = engine.evaluate(
        '{{ DateTime.fromISO("2023-12-25T15:30:45", { zone: "UTC" }).zoneName }}',
        context,
      )
      expect(result.success).toBe(true)
      expect(result.value).toBe("UTC")
    })

    test("应该转换时区", () => {
      const context = contextManager.createRuntimeContext()

      const result = engine.evaluate(
        '{{ DateTime.fromISO("2023-12-25T15:30:45", { zone: "UTC" }).setZone("local").zoneName }}',
        context,
      )
      expect(result.success).toBe(true)
      expect(typeof result.value).toBe("string")
    })
  })

  describe("DateTime与n8n变量结合", () => {
    test("应该处理JSON中的日期", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          createdAt: "2023-12-25T15:30:45.000Z",
          updatedAt: "2023-12-26T10:15:30.000Z",
        },
      })

      const tests = [
        {
          expr: '{{ DateTime.fromISO($json.createdAt).toFormat("yyyy-MM-dd") }}',
          expected: "2023-12-25",
        },
        { expr: "{{ DateTime.fromISO($json.updatedAt).day }}", expected: 26 },
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })

    test("应该计算相对时间", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          startDate: "2023-12-20T10:00:00.000Z",
          endDate: "2023-12-25T15:30:00.000Z",
        },
      })

      const result = engine.evaluate(
        '{{ parseInt(DateTime.fromISO($json.endDate).diff(DateTime.fromISO($json.startDate), "days").days) }}',
        context,
      )
      expect(result.success).toBe(true)
      expect(result.value).toBe(5)
    })
  })

  describe("实际应用场景", () => {
    test("应该格式化日期用于显示", () => {
      const context = contextManager.createRuntimeContext({
        json: { eventDate: "2023-12-25T19:30:00.000Z" },
      })

      const result = engine.evaluate(
        '{{ "Event scheduled for " + DateTime.fromISO($json.eventDate, { zone: "UTC" }).toFormat("EEEE, MMMM d \'at\' h:mm a") }}',
        context,
      )
      expect(result.success).toBe(true)
      expect(result.value).toContain("Event scheduled for Monday, December 25 at")
    })

    test("应该判断日期是否在范围内", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          checkDate: "2023-12-25T12:00:00.000Z",
          startRange: "2023-12-20T00:00:00.000Z",
          endRange: "2023-12-30T23:59:59.000Z",
        },
      })

      const result = engine.evaluate(
        "{{ DateTime.fromISO($json.checkDate) >= DateTime.fromISO($json.startRange) && DateTime.fromISO($json.checkDate) <= DateTime.fromISO($json.endRange) }}",
        context,
      )
      expect(result.success).toBe(true)
      expect(result.value).toBe(true)
    })

    test("应该计算工作日", () => {
      const context = contextManager.createRuntimeContext()

      // 测试是否为工作日（周一到周五）
      const tests = [
        { expr: '{{ DateTime.fromISO("2023-12-25").weekday <= 5 }}', expected: true }, // Monday
        { expr: '{{ DateTime.fromISO("2023-12-23").weekday <= 5 }}', expected: false }, // Saturday
        { expr: '{{ DateTime.fromISO("2023-12-24").weekday <= 5 }}', expected: false }, // Sunday
      ]

      tests.forEach(({ expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success).toBe(true)
        expect(result.value).toBe(expected)
      })
    })
  })
})
