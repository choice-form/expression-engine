/**
 * 语义层和安全层验证测试套件
 * 测试变量依赖检查、函数参数验证、类型兼容性检查和安全检查
 */

import { describe, test, expect, beforeEach } from "vitest"
import { createDefaultValidationEngine } from "../src/validation/validation-engine.js"
import type { ValidationEngine } from "../src/validation/validation-engine.js"

describe("🔍 语义层和安全层验证测试", () => {
  let validationEngine: ValidationEngine

  beforeEach(() => {
    validationEngine = createDefaultValidationEngine()
    // 设置为严格模式，确保所有层次的验证都会执行
    validationEngine.updateConfig({ strict: true })
  })

  describe("变量依赖检查", () => {
    test("应该检测未定义的变量", async () => {
      const result = await validationEngine.validate("{{ $unknownVariable }}")
      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.code === "UNDEFINED_VARIABLE")).toBe(true)
    })

    test("应该通过已定义的标准变量", async () => {
      const result = await validationEngine.validate("{{ $json.name }}")
      // 不应该有变量未定义的错误
      expect(result.errors.filter((e) => e.code === "UNDEFINED_VARIABLE")).toHaveLength(0)
    })

    test("应该通过Math对象访问", async () => {
      const result = await validationEngine.validate("{{ Math.abs(-5) }}")
      expect(result.errors.filter((e) => e.code === "UNDEFINED_VARIABLE")).toHaveLength(0)
    })
  })

  describe("函数参数验证", () => {
    test("应该检测参数数量不足", async () => {
      const result = await validationEngine.validate("{{ $if() }}")
      expect(result.errors.some((e) => e.code === "INSUFFICIENT_ARGUMENTS")).toBe(true)
    })

    test("应该检测参数数量过多", async () => {
      const result = await validationEngine.validate("{{ $isEmpty(1, 2) }}")
      expect(result.errors.some((e) => e.code === "TOO_MANY_ARGUMENTS")).toBe(true)
    })

    test("应该通过正确的函数调用", async () => {
      const result = await validationEngine.validate('{{ $if(true, "yes", "no") }}')
      // 不应该有参数相关的错误
      const paramErrors = result.errors.filter(
        (e) => e.code === "INSUFFICIENT_ARGUMENTS" || e.code === "TOO_MANY_ARGUMENTS",
      )
      expect(paramErrors).toHaveLength(0)
    })

    test("应该警告未知函数", async () => {
      const result = await validationEngine.validate("{{ unknownFunction() }}")
      expect(result.warnings.some((w) => w.code === "UNKNOWN_FUNCTION")).toBe(true)
    })
  })

  describe("类型兼容性检查", () => {
    test("应该警告混合类型算术操作", async () => {
      const result = await validationEngine.validate('{{ "hello" + 5 }}')
      expect(result.warnings.some((w) => w.code === "MIXED_TYPE_ARITHMETIC")).toBe(true)
    })

    test("应该警告除零操作", async () => {
      const result = await validationEngine.validate("{{ 10 / 0 }}")
      expect(result.warnings.some((w) => w.code === "DIVISION_BY_ZERO")).toBe(true)
    })

    test("应该通过正常的类型操作", async () => {
      const result = await validationEngine.validate("{{ 5 + 3 }}")
      // 不应该有类型兼容性警告
      const typeWarnings = result.warnings.filter(
        (w) => w.code === "MIXED_TYPE_ARITHMETIC" || w.code === "DIVISION_BY_ZERO",
      )
      expect(typeWarnings).toHaveLength(0)
    })
  })

  describe("安全威胁检测", () => {
    test("应该检测关键安全威胁", async () => {
      const result = await validationEngine.validate('{{ eval("malicious code") }}')
      expect(result.errors.some((e) => e.code === "SECURITY_THREAT")).toBe(true)
    })

    test("应该检测高风险威胁", async () => {
      const result = await validationEngine.validate("{{ process.env }}")
      expect(result.errors.some((e) => e.code === "SECURITY_THREAT")).toBe(true)
    })

    test("应该通过安全的表达式", async () => {
      const result = await validationEngine.validate("{{ $json.name }}")
      // 不应该有安全威胁错误
      expect(result.errors.filter((e) => e.code === "SECURITY_THREAT")).toHaveLength(0)
    })
  })

  describe("资源使用限制", () => {
    test("应该检测表达式过长", async () => {
      // 创建一个超长表达式
      const longExpression = "$json." + "a".repeat(10000)
      const template = `{{ ${longExpression} }}`

      const result = await validationEngine.validate(template)
      expect(result.errors.some((e) => e.code === "EXPRESSION_TOO_LONG")).toBe(true)
    })

    test("应该检测嵌套过深", async () => {
      // 创建一个语法正确但深度嵌套的表达式
      const deepExpression = "((((((((((((($json.value)))))))))))))"
      const template = `{{ ${deepExpression} }}`

      const result = await validationEngine.validate(template)
      expect(result.errors.some((e) => e.code === "NESTING_TOO_DEEP")).toBe(true)
    })

    test("应该警告函数调用过多", async () => {
      // 创建包含大量函数调用的表达式
      const manyFunctions = Array(150).fill("Math.abs(1)").join(" + ")
      const template = `{{ ${manyFunctions} }}`

      const result = await validationEngine.validate(template)
      expect(result.warnings.some((w) => w.code === "TOO_MANY_FUNCTION_CALLS")).toBe(true)
    })

    test("应该通过正常的表达式", async () => {
      const result = await validationEngine.validate("{{ $json.name }}")
      // 不应该有资源限制错误
      const resourceErrors = result.errors.filter(
        (e) =>
          e.code === "EXPRESSION_TOO_LONG" ||
          e.code === "NESTING_TOO_DEEP" ||
          e.code === "TEMPLATE_TOO_LONG",
      )
      expect(resourceErrors).toHaveLength(0)
    })
  })

  describe("综合验证测试", () => {
    test("应该返回多层验证结果", async () => {
      // 使用一个有安全威胁但语法正确的表达式
      const template = '{{ eval("test") + $missingVar }}'

      const result = await validationEngine.validate(template)

      // 应该有多个层次的问题
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)

      // 验证不同层次的错误都被检测到
      const errorCodes = result.errors.map((e) => e.code)

      // 安全威胁应该被检测到
      expect(errorCodes).toContain("SECURITY_THREAT")
      // 变量未定义也应该被检测到（如果在严格模式下）
      expect(errorCodes).toContain("UNDEFINED_VARIABLE")
    })

    test("应该按层次组织验证结果", async () => {
      const template = "{{ Math.abs() + $missing }}"

      const result = await validationEngine.validate(template)

      // 验证有语义层错误
      expect(result.errors.some((e) => e.code === "INSUFFICIENT_ARGUMENTS")).toBe(true)
      expect(result.errors.some((e) => e.code === "UNDEFINED_VARIABLE")).toBe(true)
    })

    test("应该通过完全安全的表达式", async () => {
      const result = await validationEngine.validate("{{ $json.name }}")

      // 不应该有任何安全或语义错误
      const criticalErrors = result.errors.filter(
        (e) =>
          e.code === "SECURITY_THREAT" ||
          e.code === "UNDEFINED_VARIABLE" ||
          e.code === "INSUFFICIENT_ARGUMENTS" ||
          e.code === "TOO_MANY_ARGUMENTS",
      )
      expect(criticalErrors).toHaveLength(0)
    })
  })

  // ============================================================================
  // 扩充测试：覆盖实际使用中的语义验证问题
  // ============================================================================

  describe("内置函数识别测试", () => {
    test("应该识别 $if 函数", async () => {
      const result = await validationEngine.validate('{{ $if(true, "yes", "no") }}')
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数"))).toBe(false)
    })

    test("应该识别 $isEmpty 函数", async () => {
      const result = await validationEngine.validate("{{ $isEmpty($json.value) }}")
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数"))).toBe(false)
    })

    test("应该识别 $isNotEmpty 函数", async () => {
      const result = await validationEngine.validate("{{ $isNotEmpty($json.name) }}")
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数"))).toBe(false)
    })

    test("应该识别 $ifEmpty 函数", async () => {
      const result = await validationEngine.validate('{{ $ifEmpty($json.title, "默认标题") }}')
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数"))).toBe(false)
    })

    test("应该识别 $number 函数", async () => {
      const result = await validationEngine.validate("{{ $number($json.price, 2) }}")
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数"))).toBe(false)
    })
  })

  describe("JMESPath 函数测试", () => {
    test("应该识别 jmespath 函数", async () => {
      const result = await validationEngine.validate('{{ jmespath($json, "users[*].name") }}')
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'jmespath'"))).toBe(false)
    })

    test("应该识别 search 函数", async () => {
      const result = await validationEngine.validate(
        '{{ search($json, "projects[?status == `active`]") }}',
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'search'"))).toBe(false)
    })

    test("应该处理 jmespath 结果的方法调用", async () => {
      const result = await validationEngine.validate(
        '{{ jmespath($json, "projects[*].name").join("、") }}',
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'join'"))).toBe(false)
    })
  })

  describe("DateTime 方法识别测试", () => {
    test("应该识别 $now.toFormat 方法", async () => {
      const result = await validationEngine.validate('{{ $now.toFormat("yyyy-MM-dd") }}')
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'toFormat'"))).toBe(false)
    })

    test("应该识别 DateTime.fromISO 方法", async () => {
      const result = await validationEngine.validate(
        '{{ DateTime.fromISO($json.date).toFormat("yyyy年MM月dd日") }}',
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'fromISO'"))).toBe(false)
      expect(result.errors.some((e) => e.message.includes("未知函数 'toFormat'"))).toBe(false)
    })

    test("应该识别 DateTime 链式调用", async () => {
      const result = await validationEngine.validate(
        '{{ DateTime.fromISO($json.startDate).plus({days: 7}).toFormat("yyyy-MM-dd") }}',
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数"))).toBe(false)
    })

    test("应该识别 $today 的方法", async () => {
      const result = await validationEngine.validate('{{ $today.toFormat("yyyy年MM月dd日") }}')
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'toFormat'"))).toBe(false)
    })
  })

  describe("数组和字符串方法测试", () => {
    test("应该识别数组的 join 方法", async () => {
      const result = await validationEngine.validate('{{ $json.items.join(", ") }}')
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'join'"))).toBe(false)
    })

    test("应该识别数组的 map 方法", async () => {
      const result = await validationEngine.validate("{{ $json.users.map(u => u.name) }}")
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'map'"))).toBe(false)
    })

    test("应该识别数组的 filter 方法", async () => {
      const result = await validationEngine.validate(
        "{{ $json.products.filter(p => p.price > 100) }}",
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'filter'"))).toBe(false)
    })

    test("应该识别数组的 reduce 方法", async () => {
      const result = await validationEngine.validate(
        "{{ $json.numbers.reduce((a, b) => a + b, 0) }}",
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'reduce'"))).toBe(false)
    })

    test("应该识别字符串的 includes 方法", async () => {
      const result = await validationEngine.validate('{{ $json.description.includes("关键词") }}')
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'includes'"))).toBe(false)
    })

    test("应该识别字符串的 slice 方法", async () => {
      const result = await validationEngine.validate("{{ $json.content.slice(0, 100) }}")
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数 'slice'"))).toBe(false)
    })
  })

  describe("复杂业务表达式测试", () => {
    test("应该处理完整的统计表达式", async () => {
      const result = await validationEngine.validate(
        "总预算：¥{{ $json.projects.map(p => p.budget).reduce((a, b) => a + b) / 10000 }}万元",
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    test("应该处理多个 $if 条件判断", async () => {
      const result = await validationEngine.validate(
        '{{ $if($json.statistics.growth > $vars.threshold.growth, "增长良好", "需要改进") }}，{{ $if($json.company.employees >= $vars.threshold.employees, "规模较大", "小型企业") }}',
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    test("应该处理时间格式化表达式", async () => {
      const result = await validationEngine.validate(
        '今天是{{ $now.toFormat("yyyy年MM月dd日") }}，项目A开始于{{ DateTime.fromISO($json.projects[0].startDate).toFormat("yyyy年MM月dd日") }}',
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数"))).toBe(false)
    })

    test("应该处理 JMESPath 查询表达式", async () => {
      const result = await validationEngine.validate(
        '进行中项目：{{ jmespath($json, "projects[?status == `in-progress`].name").join("、") }}',
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数"))).toBe(false)
    })
  })

  describe("边界情况测试", () => {
    test("应该处理链式方法调用", async () => {
      const result = await validationEngine.validate(
        "{{ $json.users.filter(u => u.active).map(u => u.name).slice(0, 5).join(', ') }}",
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数"))).toBe(false)
    })

    test("应该处理嵌套函数调用", async () => {
      const result = await validationEngine.validate(
        '{{ $if($isEmpty(jmespath($json, "users[?active]")), "无活跃用户", "有活跃用户") }}',
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.some((e) => e.message.includes("未知函数"))).toBe(false)
    })

    test("应该处理复杂的三元运算", async () => {
      const result = await validationEngine.validate(
        "{{ $json.user.age >= 18 ? ($json.user.hasLicense ? '可以开车' : '需要考驾照') : '未成年' }}",
      )
      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })
  })
})
