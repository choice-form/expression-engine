/**
 * 综合集成测试套件
 * 测试真实应用场景
 */

import { describe, test, expect, beforeEach } from "vitest"
import { ExpressionEngine, ContextManager } from "../src/index.js"

describe("🔧 综合集成测试", () => {
  let engine: ExpressionEngine
  let contextManager: ContextManager

  beforeEach(() => {
    engine = new ExpressionEngine()
    contextManager = new ContextManager()
  })

  describe("API响应处理", () => {
    test("应该处理用户API响应", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          status: "success",
          data: {
            users: [
              {
                id: 1,
                name: "Alice",
                email: "alice@example.com",
                active: true,
                lastLogin: "2023-12-25T10:30:00Z",
              },
              {
                id: 2,
                name: "Bob",
                email: "bob@example.com",
                active: false,
                lastLogin: "2023-12-20T15:45:00Z",
              },
              {
                id: 3,
                name: "Charlie",
                email: "charlie@example.com",
                active: true,
                lastLogin: "2023-12-26T09:15:00Z",
              },
            ],
            meta: { total: 3, page: 1 },
          },
        },
      })

      const tests = [
        {
          name: "提取活跃用户邮箱",
          expr: '{{ jmespath($json, "data.users[?active].email") }}',
          expected: ["alice@example.com", "charlie@example.com"],
        },
        {
          name: "格式化用户信息",
          expr: '{{ ((user) => $upper(user.name) + " <" + user.email + ">")(jmespath($json, "data.users[0]")) }}',
          expected: "ALICE <alice@example.com>",
        },
        {
          name: "计算活跃用户比例",
          expr: '{{ Math.round((jmespath($json, "data.users[?active] | length(@)") / $json.data.meta.total) * 100) }}',
          expected: 67,
        },
      ]

      tests.forEach(({ name, expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success, `${name} should succeed`).toBe(true)
        expect(result.value, `${name} result`).toEqual(expected)
      })
    })

    test("应该处理电商订单数据", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          orders: [
            {
              id: "ORD-001",
              customer: { name: "Alice Wang", tier: "premium" },
              items: [
                { name: "Laptop", price: 1000, quantity: 1 },
                { name: "Mouse", price: 50, quantity: 2 },
              ],
              status: "completed",
              createdAt: "2023-12-25T10:00:00Z",
            },
            {
              id: "ORD-002",
              customer: { name: "Bob Chen", tier: "regular" },
              items: [
                { name: "Keyboard", price: 80, quantity: 1 },
                { name: "Monitor", price: 300, quantity: 1 },
              ],
              status: "pending",
              createdAt: "2023-12-24T15:30:00Z",
            },
          ],
        },
      })

      const tests = [
        {
          name: "计算订单总额",
          expr: "{{ $json.orders[0].items.reduce((sum, item) => sum + (item.price * item.quantity), 0) }}",
          expected: 1100,
        },
        {
          name: "格式化订单摘要",
          expr: '{{ "订单 " + $json.orders[0].id + " - " + $json.orders[0].customer.name + " (" + $upper($json.orders[0].customer.tier) + ")" }}',
          expected: "订单 ORD-001 - Alice Wang (PREMIUM)",
        },
        {
          name: "获取VIP客户订单",
          expr: '{{ jmespath($json, "orders[?customer.tier == `premium`].id") }}',
          expected: ["ORD-001"],
        },
      ]

      tests.forEach(({ name, expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success, `${name} should succeed`).toBe(true)
        expect(result.value, `${name} result`).toEqual(expected)
      })
    })
  })

  describe("日期时间处理", () => {
    test("应该处理业务日期逻辑", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          events: [
            { name: "Meeting", startTime: "2023-12-25T14:00:00Z", duration: 60 },
            { name: "Call", startTime: "2023-12-25T16:30:00Z", duration: 30 },
            { name: "Review", startTime: "2023-12-26T09:00:00Z", duration: 120 },
          ],
        },
      })

      const tests = [
        {
          name: "格式化事件时间",
          expr: '{{ DateTime.fromISO($json.events[0].startTime).toUTC().toFormat("yyyy年MM月dd日 HH:mm") }}',
          expected: "2023年12月25日 14:00",
        },
        {
          name: "计算事件结束时间",
          expr: '{{ DateTime.fromISO($json.events[0].startTime).toUTC().plus({minutes: $json.events[0].duration}).toFormat("HH:mm") }}',
          expected: "15:00",
        },
        {
          name: "判断是否为工作日",
          expr: "{{ DateTime.fromISO($json.events[0].startTime).weekday <= 5 }}",
          expected: true,
        },
      ]

      tests.forEach(({ name, expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success, `${name} should succeed`).toBe(true)
        expect(result.value, `${name} result`).toEqual(expected)
      })
    })

    test("应该计算相对时间", () => {
      const now = new Date("2023-12-25T12:00:00Z")
      const context = contextManager.createRuntimeContext({
        json: {
          createdAt: "2023-12-24T12:00:00Z",
          updatedAt: "2023-12-25T10:00:00Z",
        },
      })

      const tests = [
        {
          name: "计算创建时间差",
          expr: '{{ DateTime.fromISO("2023-12-25T12:00:00Z").diff(DateTime.fromISO($json.createdAt), "hours").hours }}',
          expected: 24,
        },
        {
          name: "格式化相对时间",
          expr: '{{ $if(DateTime.fromISO("2023-12-25T12:00:00Z").diff(DateTime.fromISO($json.updatedAt), "hours").hours < 24, "今天更新", "较早更新") }}',
          expected: "今天更新",
        },
      ]

      tests.forEach(({ name, expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success, `${name} should succeed`).toBe(true)
        expect(result.value, `${name} result`).toEqual(expected)
      })
    })
  })

  describe("数据转换和验证", () => {
    test("应该验证和转换表单数据", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          form: {
            name: "  Alice Wang  ",
            email: "ALICE@EXAMPLE.COM",
            age: "25",
            tags: ["developer", "javascript", "react"],
          },
        },
      })

      const tests = [
        {
          name: "清理用户姓名",
          expr: "{{ $trim($json.form.name) }}",
          expected: "Alice Wang",
        },
        {
          name: "标准化邮箱",
          expr: "{{ $lower($json.form.email) }}",
          expected: "alice@example.com",
        },
        {
          name: "验证年龄",
          expr: "{{ $number($json.form.age) >= 18 }}",
          expected: true,
        },
        {
          name: "格式化标签",
          expr: '{{ $json.form.tags.map(tag => $capitalize(tag)).join(", ") }}',
          expected: "Developer, Javascript, React",
        },
      ]

      tests.forEach(({ name, expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success, `${name} should succeed`).toBe(true)
        expect(result.value, `${name} result`).toEqual(expected)
      })
    })

    test("应该构建动态查询", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          products: [
            { name: "Laptop", category: "electronics", price: 1000, rating: 4.5 },
            { name: "Book", category: "books", price: 20, rating: 4.8 },
            { name: "Phone", category: "electronics", price: 800, rating: 4.2 },
            { name: "Tablet", category: "electronics", price: 600, rating: 4.0 },
          ],
          filters: {
            category: "electronics",
            minPrice: 500,
            minRating: 4.0,
          },
        },
      })

      const tests = [
        {
          name: "应用价格过滤",
          expr: '{{ jmespath($json, "products[?price >= `" + $json.filters.minPrice + "`].name") }}',
          expected: ["Laptop", "Phone", "Tablet"],
        },
        {
          name: "组合过滤条件",
          expr: '{{ jmespath($json, "products[?category == `electronics` && price >= `500` && rating > `4.0`]") }}',
          expected: [
            { name: "Laptop", category: "electronics", price: 1000, rating: 4.5 },
            { name: "Phone", category: "electronics", price: 800, rating: 4.2 },
          ],
        },
      ]

      tests.forEach(({ name, expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success, `${name} should succeed`).toBe(true)
        expect(result.value, `${name} result`).toEqual(expected)
      })
    })
  })

  describe("报表和统计", () => {
    test("应该生成销售报表", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          sales: [
            { region: "North", amount: 10000, month: "2023-11" },
            { region: "South", amount: 15000, month: "2023-11" },
            { region: "North", amount: 12000, month: "2023-12" },
            { region: "South", amount: 18000, month: "2023-12" },
            { region: "East", amount: 8000, month: "2023-12" },
          ],
        },
      })

      const tests = [
        {
          name: "计算总销售额",
          expr: "{{ $json.sales.reduce((sum, sale) => sum + sale.amount, 0) }}",
          expected: 63000,
        },
        {
          name: "按地区分组",
          expr: '{{ $groupBy($json.sales, "region") }}',
          expected: {
            North: [
              { region: "North", amount: 10000, month: "2023-11" },
              { region: "North", amount: 12000, month: "2023-12" },
            ],
            South: [
              { region: "South", amount: 15000, month: "2023-11" },
              { region: "South", amount: 18000, month: "2023-12" },
            ],
            East: [{ region: "East", amount: 8000, month: "2023-12" }],
          },
        },
        {
          name: "找出最高销售额",
          expr: '{{ jmespath($json, "max_by(sales, &amount).region") }}',
          expected: "South",
        },
      ]

      tests.forEach(({ name, expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success, `${name} should succeed`).toBe(true)
        expect(result.value, `${name} result`).toEqual(expected)
      })
    })
  })

  describe("条件逻辑和流程控制", () => {
    test("应该处理复杂业务逻辑", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          user: {
            id: 123,
            name: "Alice",
            type: "premium",
            credits: 50,
            lastLogin: "2023-12-25T10:00:00Z",
          },
          settings: {
            freeCredits: 10,
            premiumCredits: 100,
            inactiveThreshold: 30,
          },
        },
      })

      const tests = [
        {
          name: "判断用户状态",
          expr: '{{ $if($json.user.type === "premium", "VIP用户", "普通用户") }}',
          expected: "VIP用户",
        },
        {
          name: "计算剩余信用点",
          expr: '{{ $if($json.user.credits > 0, $json.user.credits + " 点剩余", "无剩余") }}',
          expected: "50 点剩余",
        },
        {
          name: "检查用户活跃度",
          expr: '{{ DateTime.fromISO("2023-12-26T10:00:00Z").diff(DateTime.fromISO($json.user.lastLogin), "days").days < $json.settings.inactiveThreshold }}',
          expected: true,
        },
        {
          name: "生成用户摘要",
          expr: '{{ $json.user.name + " (" + $upper($json.user.type) + ") - " + $json.user.credits + " 积分" }}',
          expected: "Alice (PREMIUM) - 50 积分",
        },
      ]

      tests.forEach(({ name, expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success, `${name} should succeed`).toBe(true)
        expect(result.value, `${name} result`).toEqual(expected)
      })
    })
  })

  describe("错误场景处理", () => {
    test("应该优雅处理缺失数据", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          user: {
            name: "Alice",
            // 缺少其他字段
          },
        },
      })

      const tests = [
        {
          name: "处理缺失字段",
          expr: '{{ $json.user.email || "未提供邮箱" }}',
          expected: "未提供邮箱",
        },
        {
          name: "安全访问嵌套属性",
          expr: '{{ $json.user.profile?.address?.city || "未知城市" }}',
          expected: "未知城市",
        },
        {
          name: "提供默认值",
          expr: '{{ $if($isEmpty($json.user.age), "年龄未知", $json.user.age + "岁") }}',
          expected: "年龄未知",
        },
      ]

      tests.forEach(({ name, expr, expected }) => {
        const result = engine.evaluate(expr, context)
        expect(result.success, `${name} should succeed`).toBe(true)
        expect(result.value, `${name} result`).toEqual(expected)
      })
    })
  })
})
