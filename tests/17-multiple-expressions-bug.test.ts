import { describe, it, expect, beforeEach } from "vitest"
import { createDefaultValidationEngine } from "../src/validation/validation-engine.js"
import type { ValidationEngine } from "../src/validation/validation-engine.js"

describe("🐛 多表达式验证bug重现测试", () => {
  let validationEngine: ValidationEngine

  beforeEach(() => {
    validationEngine = createDefaultValidationEngine()
    validationEngine.updateConfig({ strict: true })
  })

  describe("多表达式场景 - 错误传播问题", () => {
    it("应该只报告有错误的表达式，而不是所有表达式", async () => {
      // 测试场景：第一个表达式正确，第二个表达式有错误
      const template = "{{ $json.name }} {{ $json.invalidProperty.nonExistent }}"

      const result = await validationEngine.validate(template, {
        $json: { name: "测试用户" }, // 只有 name 属性，没有 invalidProperty
      })

      console.log("验证结果:", result)
      console.log("错误列表:", result.errors)
      console.log("警告列表:", result.warnings)

      // 应该有错误（因为第二个表达式访问了不存在的属性）
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)

      // 关键测试：错误应该只指向有问题的表达式位置
      const errorPositions = result.errors.map((e) => ({
        start: e.position?.start,
        end: e.position?.end,
      }))
      console.log("错误位置:", errorPositions)

      // 检查是否所有错误都指向同一个位置（这会说明有bug）
      const uniquePositions = new Set(errorPositions.map((pos) => `${pos.start}-${pos.end}`))

      // 如果所有错误都指向同一个位置，说明有bug
      if (uniquePositions.size === 1) {
        console.error("🐛 发现bug：所有错误都指向同一个位置，可能存在错误传播问题")
      }
    })

    it("边缘情况：相同属性路径但不同表达式", async () => {
      // 这可能是触发缓存问题的场景
      const template = "{{ $json.user.name }} {{ $json.user.name.invalidProperty }}"

      const result = await validationEngine.validate(template, {
        $json: { user: { name: "John" } }, // name 是字符串，没有 invalidProperty
      })

      console.log("\n相同属性路径测试:")
      console.log("错误数量:", result.errors.length)
      result.errors.forEach((error, index) => {
        console.log(`错误${index + 1}: ${error.message}`)
        console.log(`  位置: ${error.position?.start}-${error.position?.end}`)
      })

      // 应该只有第二个表达式报错
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBe(1)

      // 错误应该指向第二个表达式
      const error = result.errors[0]
      expect(error.position?.start).toBeGreaterThan(15) // 第二个表达式的大概位置
    })

    it("相同变量但不同验证结果", async () => {
      // 测试同一个变量在不同表达式中的验证是否独立
      const template = "{{ $json }} {{ $json.invalidProperty }}"

      const result = await validationEngine.validate(template, {
        $json: { validProperty: "test" },
      })

      console.log("\n相同变量测试:")
      console.log("错误数量:", result.errors.length)
      result.errors.forEach((error, index) => {
        console.log(`错误${index + 1}: ${error.message}`)
        console.log(`  位置: ${error.position?.start}-${error.position?.end}`)
      })
    })

    it("快速连续验证测试", async () => {
      // 测试快速连续验证是否会有状态污染
      const templates = [
        "{{ $json.validProp }}",
        "{{ $json.invalidProp }}",
        "{{ $json.validProp }}", // 应该不受第二个的影响
      ]

      const context = { $json: { validProp: "valid" } }

      const results: Array<{ template: string; isValid: boolean; errorCount: number }> = []
      for (let i = 0; i < templates.length; i++) {
        const result = await validationEngine.validate(templates[i], context)
        results.push({
          template: templates[i]!,
          isValid: result.isValid,
          errorCount: result.errors.length,
        })
      }

      console.log("\n快速连续验证结果:")
      results.forEach((result, index) => {
        console.log(
          `第${index + 1}次: ${result.template} -> 有效: ${result.isValid}, 错误: ${result.errorCount}`,
        )
      })

      // 第一次和第三次应该都成功
      expect(results[0].isValid).toBe(true)
      expect(results[2].isValid).toBe(true)
      // 第二次应该失败
      expect(results[1].isValid).toBe(false)
    })

    it("大量表达式压力测试", async () => {
      // 创建包含大量表达式的模板，部分正确，部分错误
      const validExpressions = Array.from({ length: 10 }, (_, i) => `{{ $json.prop${i} }}`)
      const invalidExpressions = Array.from({ length: 5 }, (_, i) => `{{ $json.invalid${i} }}`)

      // 交替排列正确和错误的表达式
      const mixed: string[] = []
      for (let i = 0; i < Math.max(validExpressions.length, invalidExpressions.length); i++) {
        if (validExpressions[i]) mixed.push(validExpressions[i]!)
        if (invalidExpressions[i]) mixed.push(invalidExpressions[i]!)
      }

      const template = mixed.join(" ")

      // 创建只包含 prop0-prop9 的上下文
      const context = {
        $json: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`prop${i}`, `value${i}`])),
      }

      const result = await validationEngine.validate(template, context)

      console.log("\n大量表达式测试:")
      console.log(`模板长度: ${template.length}`)
      console.log(`错误数量: ${result.errors.length}`)
      console.log(`期望错误数量: 5 (invalid0-invalid4)`)

      // 应该有5个错误（对应5个 invalid 属性）
      expect(result.errors.length).toBe(5)

      // 检查错误位置是否都不同
      const positions = result.errors.map((e) => `${e.position?.start}-${e.position?.end}`)
      const uniquePositions = new Set(positions)
      expect(uniquePositions.size).toBe(5) // 应该有5个不同的位置
    })

    // 新增：特殊的缓存破坏测试
    it("缓存键冲突测试", async () => {
      // 创建可能导致缓存键冲突的场景
      const template1 = "{{ $json.user }} {{ $json.user.name }}"
      const template2 = "{{ $json.user.name }} {{ $json.user }}"

      const context = { $json: { user: { name: "John" } } }

      const result1 = await validationEngine.validate(template1, context)
      const result2 = await validationEngine.validate(template2, context)

      console.log("\n缓存键冲突测试:")
      console.log(`模板1错误: ${result1.errors.length}`)
      console.log(`模板2错误: ${result2.errors.length}`)

      // 两个模板都应该是有效的
      expect(result1.isValid).toBe(true)
      expect(result2.isValid).toBe(true)
    })

    it("应该独立验证每个表达式 - 简单情况", async () => {
      // 更简单的测试：一个正确，一个错误
      const template = "{{ $json.validProp }} {{ $unknownVar }}"

      const result = await validationEngine.validate(template, {
        $json: { validProp: "valid" },
      })

      console.log("\n简单测试结果:", result)

      // 应该有错误（$unknownVar 未定义）
      expect(result.isValid).toBe(false)

      // 检查错误位置
      const errors = result.errors.filter((e) => e.code === "UNDEFINED_VARIABLE")
      console.log("变量未定义错误:", errors)

      errors.forEach((error) => {
        console.log(
          `错误位置: ${error.position?.start}-${error.position?.end}, 消息: ${error.message}`,
        )
      })
    })

    it("应该独立验证每个表达式 - 属性访问", async () => {
      // 测试属性访问的具体场景
      const template = "{{ $json.user.name }} {{ $json.user.nonExistent.prop }}"

      const result = await validationEngine.validate(template, {
        $json: {
          user: {
            name: "John",
            // 没有 nonExistent 属性
          },
        },
      })

      console.log("\n属性访问测试结果:", result)
      console.log(
        "错误详情:",
        result.errors.map((e) => ({
          code: e.code,
          message: e.message,
          position: e.position,
        })),
      )
    })

    it("应该独立验证多个相同类型的错误", async () => {
      // 测试多个都有错误的情况
      const template = "{{ $unknown1 }} {{ $unknown2 }} {{ $unknown3 }}"

      const result = await validationEngine.validate(template)

      console.log("\n多个错误测试结果:", result)

      const undefinedVarErrors = result.errors.filter((e) => e.code === "UNDEFINED_VARIABLE")
      console.log(`变量未定义错误数量: ${undefinedVarErrors.length}`)

      // 应该有3个不同的错误，位置不同
      undefinedVarErrors.forEach((error, index) => {
        console.log(
          `错误${index + 1}: ${error.message}, 位置: ${error.position?.start}-${error.position?.end}`,
        )
      })

      // 检查是否错误位置都不同
      const positions = undefinedVarErrors.map((e) => `${e.position?.start}-${e.position?.end}`)
      const uniquePositions = new Set(positions)

      if (uniquePositions.size !== undefinedVarErrors.length) {
        console.error("🐛 发现bug：多个相同类型的错误位置重复了")
      }
    })

    it("验证器实例状态隔离测试", async () => {
      // 测试验证器实例是否有状态污染

      // 第一次验证：包含错误
      const template1 = "{{ $json.invalidProperty }}"
      const result1 = await validationEngine.validate(template1, {
        $json: { validProperty: "test" },
      })

      console.log("\n第一次验证结果:", result1.isValid, result1.errors.length)

      // 第二次验证：应该正常
      const template2 = "{{ $json.validProperty }}"
      const result2 = await validationEngine.validate(template2, {
        $json: { validProperty: "test" },
      })

      console.log("第二次验证结果:", result2.isValid, result2.errors.length)

      // 第二次验证应该成功，不应该受第一次的影响
      expect(result2.isValid).toBe(true)
      expect(result2.errors.length).toBe(0)
    })

    it("复杂场景：混合正确和错误的表达式", async () => {
      const template = `
        用户：{{ $json.user.name }}
        年龄：{{ $json.user.age }}
        无效属性：{{ $json.user.invalidProp.deep }}
        另一个正确属性：{{ $json.user.email }}
        另一个错误：{{ $unknownVariable }}
      `

      const result = await validationEngine.validate(template, {
        $json: {
          user: {
            name: "Alice",
            age: 25,
            email: "alice@example.com",
          },
        },
      })

      console.log("\n复杂场景测试结果:")
      console.log("是否有效:", result.isValid)
      console.log("错误数量:", result.errors.length)
      console.log("警告数量:", result.warnings.length)

      result.errors.forEach((error, index) => {
        console.log(`错误${index + 1}: [${error.code}] ${error.message}`)
        console.log(`  位置: ${error.position?.start}-${error.position?.end}`)
      })

      // 应该有错误，但不应该影响正确的表达式
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
