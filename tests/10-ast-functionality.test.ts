/**
 * AST功能测试套件
 * 测试新的AST输出功能
 */

import { describe, test, expect, beforeEach } from "vitest"
import { ExpressionEngine, ContextManager } from "../src/index.js"

describe("🌳 AST输出功能测试", () => {
  let engine: ExpressionEngine
  let contextManager: ContextManager

  beforeEach(() => {
    // 默认创建字符串输出引擎
    engine = new ExpressionEngine()
    contextManager = new ContextManager()
  })

  describe("输出格式控制", () => {
    test("应该支持设置和获取输出格式", () => {
      // 默认应该是字符串格式
      expect(engine.getOutputFormat()).toBe("string")

      // 设置为AST格式
      engine.setOutputFormat("ast")
      expect(engine.getOutputFormat()).toBe("ast")

      // 设置回字符串格式
      engine.setOutputFormat("string")
      expect(engine.getOutputFormat()).toBe("string")
    })

    test("应该在构造时支持设置输出格式", () => {
      const astEngine = new ExpressionEngine({
        output: { format: "ast", includeMetadata: false },
      })

      expect(astEngine.getOutputFormat()).toBe("ast")
    })
  })

  describe("字符串输出模式", () => {
    test("应该正常返回字符串结果", () => {
      const context = contextManager.createRuntimeContext({
        json: { name: "Alice", age: 30 },
      })

      const result = engine.evaluate("Hello {{ $json.name }}!", context)

      expect(result.success).toBe(true)
      expect(result.type).toBe("string")
      expect(result.value).toBe("Hello Alice!")
      expect(result.ast).toBeUndefined()
    })

    test("应该在includeMetadata时包含AST", () => {
      const engineWithMetadata = new ExpressionEngine({
        output: { format: "string", includeMetadata: true },
      })

      const context = contextManager.createRuntimeContext({
        json: { name: "Bob" },
      })

      const result = engineWithMetadata.evaluate("{{ $json.name }}", context)

      expect(result.success).toBe(true)
      expect(result.type).toBe("string")
      expect(result.value).toBe("Bob")
      expect(result.ast).toBeDefined()
      expect(result.ast?.type).toBe("Expression")
    })
  })

  describe("AST输出模式", () => {
    test("应该返回AST结构而非字符串结果", () => {
      engine.setOutputFormat("ast")

      const context = contextManager.createRuntimeContext({
        json: { name: "Charlie" },
      })

      const result = engine.evaluate("Hello {{ $json.name }}!", context)

      expect(result.success).toBe(true)
      expect(result.type).toBe("ast")
      expect(result.value).toBeUndefined()
      expect(result.ast).toBeDefined()
      expect(result.ast?.type).toBe("Template")
    })

    test("应该生成正确的模板AST结构", () => {
      engine.setOutputFormat("ast")

      const result = engine.evaluate(
        "Hello {{ $json.name }}!",
        contextManager.createRuntimeContext(),
      )

      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()

      const ast = result.ast!
      expect(ast.type).toBe("Template")

      if (ast.type === "Template") {
        expect(ast.parts).toBeDefined()
        expect(ast.parts.length).toBe(3)

        // 第一部分：静态文本
        expect(ast.parts[0]!.type).toBe("TemplateText")
        if (ast.parts[0]!.type === "TemplateText") {
          expect(ast.parts[0]!.value).toBe("Hello ")
        }

        // 第二部分：表达式
        expect(ast.parts[1]!.type).toBe("TemplateExpression")
        if (ast.parts[1]!.type === "TemplateExpression") {
          const expr = ast.parts[1]!.value
          expect(expr.type).toBe("Expression")
        }

        // 第三部分：静态文本
        expect(ast.parts[2]!.type).toBe("TemplateText")
        if (ast.parts[2]!.type === "TemplateText") {
          expect(ast.parts[2]!.value).toBe("!")
        }

        // 依赖关系
        expect(ast.dependencies).toContain("$json")
      }
    })

    test("应该生成简单表达式的AST", () => {
      engine.setOutputFormat("ast")

      const result = engine.evaluate("{{ $json.name }}", contextManager.createRuntimeContext())

      expect(result.success).toBe(true)
      expect(result.ast?.type).toBe("Template")
    })

    test("应该生成复杂表达式的AST", () => {
      engine.setOutputFormat("ast")

      const result = engine.evaluate(
        '{{ $json.age > 18 ? "成年" : "未成年" }}',
        contextManager.createRuntimeContext(),
      )

      expect(result.success).toBe(true)
      expect(result.ast?.type).toBe("Template")
    })
  })

  describe("直接AST生成", () => {
    test("应该支持直接生成AST（不求值）", () => {
      const ast = engine.generateAST("Hello {{ $json.name }}!")

      expect(ast.type).toBe("Template")
      if (ast.type === "Template") {
        expect(ast.parts.length).toBe(3)
        expect(ast.dependencies).toContain("$json")
      }
    })

    test("应该为非模板表达式生成Program节点", () => {
      const ast = engine.generateAST("simple text")

      expect(ast.type).toBe("Program")
      if (ast.type === "Program") {
        expect(ast.sourceType).toBe("expression")
      }
    })

    test("应该为包含表达式的内容生成Template节点", () => {
      const ast = engine.generateAST("Count: {{ $json.items.length }}")

      expect(ast.type).toBe("Template")
      if (ast.type === "Template") {
        expect(ast.dependencies).toContain("$json")
      }
    })
  })

  describe("AST元数据", () => {
    test("应该提供AST元数据", () => {
      engine.generateAST("{{ $json.test }}")
      const metadata = engine.getASTMetadata()

      expect(metadata).toBeDefined()
      expect(metadata.version).toBe("1.0.0")
      expect(metadata.sourceType).toBe("expression")
      expect(metadata.generated).toBeInstanceOf(Date)
      expect(metadata.originalSource).toBeDefined()
    })
  })

  describe("缓存行为", () => {
    test("应该为不同输出格式分别缓存", () => {
      const context = contextManager.createRuntimeContext({
        json: { name: "Test" },
      })

      // 字符串模式求值
      engine.setOutputFormat("string")
      const stringResult1 = engine.evaluate("Hello {{ $json.name }}!", context)
      expect(stringResult1.type).toBe("string")

      // 切换到AST模式
      engine.setOutputFormat("ast")
      const astResult = engine.evaluate("Hello {{ $json.name }}!", context)
      expect(astResult.type).toBe("ast")

      // 切换回字符串模式
      engine.setOutputFormat("string")
      const stringResult2 = engine.evaluate("Hello {{ $json.name }}!", context)
      expect(stringResult2.type).toBe("string")
    })

    test("应该在切换输出格式时清理缓存", () => {
      const context = contextManager.createRuntimeContext({
        json: { name: "CacheTest" },
      })

      // 第一次求值
      const result1 = engine.evaluate("{{ $json.name }}", context)

      // 切换输出格式（应该清理缓存）
      engine.setOutputFormat("ast")

      // 再次求值
      const result2 = engine.evaluate("{{ $json.name }}", context)

      expect(result1.type).toBe("string")
      expect(result2.type).toBe("ast")
    })
  })

  describe("错误处理", () => {
    test("应该在AST生成失败时返回错误", () => {
      engine.setOutputFormat("ast")

      // 使用无效语法
      const result = engine.evaluate("{{ $json.name }}}}", contextManager.createRuntimeContext())

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.type).toBe("error")
    })
  })

  describe("性能特性", () => {
    test("AST生成应该快速完成", () => {
      const startTime = performance.now()

      engine.setOutputFormat("ast")
      const result = engine.evaluate(
        'Complex: {{ $json.data.items[0].name + " - " + $json.data.items[0].value }}',
        contextManager.createRuntimeContext(),
      )

      const endTime = performance.now()

      expect(result.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
    })
  })
})
