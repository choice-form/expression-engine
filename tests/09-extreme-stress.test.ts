/**
 * 极限压力测试套件 🔥
 * 测试巨复杂表达式的支持能力
 */

import { describe, test, expect, beforeEach } from "vitest"
import { ExpressionEngine, ContextManager } from "../src/index.js"

describe("🔥 极限压力测试", () => {
  let engine: ExpressionEngine
  let contextManager: ContextManager

  beforeEach(() => {
    engine = new ExpressionEngine()
    contextManager = new ContextManager()
  })

  describe("💀 复杂度挑战", () => {
    test("深度嵌套条件表达式 - 10层嵌套", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          level: 8,
          status: "active",
          priority: "high",
          user: { role: "admin", score: 95 },
        },
      })

      // 10层嵌套的条件判断
      const expr = `{{
        $if($json.level > 5,
          $if($json.status === 'active',
            $if($json.priority === 'high',
              $if($json.user.role === 'admin',
                $if($json.user.score > 90,
                  $if($json.level > 7,
                    $if($json.user.score > 94,
                      $if($json.priority !== 'low',
                        $if($json.status !== 'inactive',
                          $if($json.level < 10, 'SUPER_ADMIN', 'GOD_MODE'),
                          'INACTIVE_ADMIN'
                        ),
                        'LOW_PRIORITY'
                      ),
                      'GOOD_ADMIN'
                    ),
                    'MID_ADMIN'
                  ),
                  'BASIC_ADMIN'
                ),
                'HIGH_USER'
              ),
              'ACTIVE_USER'
            ),
            'INACTIVE_USER'
          ),
          'LOW_LEVEL'
        )
      }}`

      const result = engine.evaluate(expr, context)
      expect(result.success).toBe(true)
      expect(result.value).toBe("SUPER_ADMIN")
    })

    test("巨长数学表达式 - 50个运算", () => {
      const context = contextManager.createRuntimeContext({
        json: { base: 10 },
      })

      // 构建50个数学运算的表达式
      let mathExpr = "$json.base"
      for (let i = 1; i <= 50; i++) {
        const operator = i % 4 === 0 ? "+" : i % 4 === 1 ? "-" : i % 4 === 2 ? "*" : "/"
        const value = (i % 10) + 1
        if (operator === "/") {
          mathExpr += ` ${operator} ${value}` // 避免除零
        } else {
          mathExpr += ` ${operator} ${value}`
        }
      }

      const result = engine.evaluate(`{{ Math.round(${mathExpr}) }}`, context)
      expect(result.success).toBe(true)
      expect(typeof result.value).toBe("number")
      expect(Number.isFinite(result.value as number)).toBe(true)
    })
  })

  describe("🌪️ 功能混合挑战", () => {
    test("终极混合表达式 - 多功能集成", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          users: [
            {
              name: "Alice",
              age: 25,
              email: "alice@test.com",
              skills: ["js", "ts"],
              joinDate: "2023-01-15",
              active: true,
            },
            {
              name: "Bob",
              age: 30,
              email: "bob@test.com",
              skills: ["python"],
              joinDate: "2022-06-10",
              active: false,
            },
            {
              name: "Charlie",
              age: 35,
              email: "charlie@test.com",
              skills: ["java"],
              joinDate: "2021-03-20",
              active: true,
            },
          ],
          settings: {
            minAge: 18,
            requiredSkills: ["js", "python", "java"],
          },
        },
      })

      // 复杂的混合表达式：数组操作 + 字符串处理 + 条件逻辑
      const expr = `{{
        $join(
          $map(
            $filter(
              $json.users,
              user => user.active && user.age >= $json.settings.minAge
            ),
            user => $upper(user.name) + '(' + $join(user.skills, '|') + ')'
          ),
          ' | '
        )
      }}`

      const result = engine.evaluate(expr, context)
      expect(result.success).toBe(true)
      expect(typeof result.value).toBe("string")

      const value = result.value as string
      expect(value).toContain("ALICE")
      expect(value).toContain("CHARLIE")
      expect(value).not.toContain("BOB") // Bob is inactive
    })
  })

  describe("🚀 边界挑战", () => {
    test("深度对象访问 - 10层深度", () => {
      // 创建10层深度的嵌套对象
      let deepObj: Record<string, unknown> = { value: "found!" }
      for (let i = 9; i >= 0; i--) {
        deepObj = { [`level${i}`]: deepObj }
      }

      const context = contextManager.createRuntimeContext({ json: deepObj })

      const expr =
        "{{ $json.level0.level1.level2.level3.level4.level5.level6.level7.level8.level9.value }}"

      const result = engine.evaluate(expr, context)
      expect(result.success).toBe(true)
      expect(result.value).toBe("found!")
    })

    test("大数组操作 - 1000元素", () => {
      const hugeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: Math.random() * 100,
        category: i % 10,
      }))

      const context = contextManager.createRuntimeContext({
        json: { data: hugeArray },
      })

      const expr = `{{
        $length(
          $filter(
            $json.data,
            item => item.category === 5 && item.value > 50
          )
        )
      }}`

      const result = engine.evaluate(expr, context)
      expect(result.success).toBe(true)
      expect(typeof result.value).toBe("number")
      expect(result.value).toBeGreaterThanOrEqual(0)
    })
  })

  describe("🎯 实战场景", () => {
    test("复杂业务规则引擎", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          customer: {
            tier: "platinum",
            monthlySpend: 15000,
            accountAge: 24,
            paymentHistory: {
              onTime: 23,
              late: 1,
              total: 24,
            },
          },
          rules: {
            platinum: { discount: 0.15, creditLimit: 50000 },
            gold: { discount: 0.1, creditLimit: 25000 },
          },
        },
      })

      // 复杂的业务规则计算
      const expr = `{{
        $if($json.customer.tier === 'platinum',
          $if($json.customer.monthlySpend > 10000,
            $if($json.customer.paymentHistory.onTime / $json.customer.paymentHistory.total > 0.95,
              $if($json.customer.accountAge > 12,
                Math.round($json.customer.monthlySpend * (1 - $json.rules.platinum.discount)),
                Math.round($json.customer.monthlySpend * (1 - $json.rules.platinum.discount * 0.8))
              ),
              Math.round($json.customer.monthlySpend * (1 - $json.rules.platinum.discount * 0.5))
            ),
            Math.round($json.customer.monthlySpend * (1 - $json.rules.gold.discount))
          ),
          Math.round($json.customer.monthlySpend * (1 - $json.rules.gold.discount))
        )
      }}`

      const result = engine.evaluate(expr, context)
      expect(result.success).toBe(true)
      expect(typeof result.value).toBe("number")
      expect(result.value).toBe(12750) // 15000 * (1 - 0.15)
    })
  })

  describe("🔥 终极BOSS挑战", () => {
    test("超级复杂表达式 - 数据分析报告", () => {
      const context = contextManager.createRuntimeContext({
        json: {
          company: {
            name: "TechCorp",
            employees: 500,
            departments: [
              {
                name: "Engineering",
                budget: 2000000,
                headcount: 200,
                projects: [
                  { name: "Alpha", status: "completed", budget: 500000 },
                  { name: "Beta", status: "in-progress", budget: 750000 },
                ],
              },
              {
                name: "Marketing",
                budget: 1000000,
                headcount: 100,
                projects: [{ name: "Campaign X", status: "completed", budget: 300000 }],
              },
            ],
          },
        },
      })

      // 超级复杂表达式 - 公司分析报告
      const expr = `{{
         $upper($json.company.name) + ' Analysis:\\n' +
         'Total Budget: $' + ($json.company.departments.reduce((sum, dept) => sum + dept.budget, 0) / 1000000).toFixed(1) + 'M\\n' +
         'Employees: ' + $json.company.employees + '\\n' +
         'Departments: ' + $length($json.company.departments) + '\\n' +
         'Active Projects: ' + $length($json.company.departments.flatMap(d => d.projects).filter(p => p.status === 'in-progress')) + '\\n' +
         'Completed Projects: ' + $length($json.company.departments.flatMap(d => d.projects).filter(p => p.status === 'completed'))
       }}`

      const result = engine.evaluate(expr, context)
      expect(result.success).toBe(true)
      expect(typeof result.value).toBe("string")

      const report = result.value as string
      expect(report).toContain("TECHCORP Analysis")
      expect(report).toContain("Total Budget: $3.0M")
      expect(report).toContain("Employees: 500")
      expect(report).toContain("Active Projects: 1")
      expect(report).toContain("Completed Projects: 2")
    })
  })
})
