/**
 * AST生成器 - 将表达式转换为抽象语法树
 */

import type {
  AnyExpressionNode,
  ASTMetadata,
  ExpressionNode,
  ProgramNode,
  TemplateNode,
  TemplatePart,
} from "../types/ast.js"
import type { ParsedExpression, ParsedTemplate } from "../types/index.js"

export class ASTGenerator {
  private sourceCode: string = ""
  private metadata: Partial<ASTMetadata> = {}

  /**
   * 从模板生成AST
   */
  generateFromTemplate(template: string, parsed: ParsedTemplate): TemplateNode {
    this.sourceCode = template
    this.metadata = {
      sourceType: "template",
      generated: new Date(),
      originalSource: template,
      version: "1.0.0",
    }

    const parts: TemplatePart[] = []
    let currentPos = 0

    // 处理静态文本和表达式交替出现的情况
    for (let i = 0; i < parsed.expressions.length; i++) {
      const expr = parsed.expressions[i]!
      const staticPart = parsed.staticParts[i]

      // 添加静态文本部分
      if (staticPart) {
        parts.push({
          type: "TemplateText",
          value: staticPart,
          start: currentPos,
          end: currentPos + staticPart.length,
        })
        currentPos += staticPart.length
      }

      // 添加表达式部分
      const exprNode = this.generateFromExpression(expr)
      parts.push({
        type: "TemplateExpression",
        value: exprNode,
        start: expr.position.start,
        end: expr.position.end,
      })
      currentPos = expr.position.end
    }

    // 添加最后的静态文本部分
    const lastStatic = parsed.staticParts[parsed.expressions.length]
    if (lastStatic) {
      parts.push({
        type: "TemplateText",
        value: lastStatic,
        start: currentPos,
        end: currentPos + lastStatic.length,
      })
    }

    return {
      type: "Template",
      parts,
      dependencies: parsed.dependencies,
      complexity: this.calculateComplexity(parts),
      start: 0,
      end: template.length,
      raw: template,
    }
  }

  /**
   * 从表达式生成AST
   */
  generateFromExpression(expr: ParsedExpression): ExpressionNode {
    this.sourceCode = expr.raw
    this.metadata = {
      sourceType: "expression",
      generated: new Date(),
      originalSource: expr.raw,
      version: "1.0.0",
    }

    // 解析表达式内容
    const bodyNode = this.parseExpression(expr.cleaned)

    return {
      type: "Expression",
      body: {
        type: "ExpressionStatement",
        expression: bodyNode,
        start: expr.position.start,
        end: expr.position.end,
        raw: expr.raw,
      },
      complexity: this.calculateExpressionComplexity(bodyNode),
      start: expr.position.start,
      end: expr.position.end,
      raw: expr.raw,
    }
  }

  /**
   * 生成程序根节点
   */
  generateProgram(template: string, parsed: ParsedTemplate): ProgramNode {
    const isTemplate = parsed.isTemplate
    const body = isTemplate
      ? [this.generateFromTemplate(template, parsed)]
      : parsed.expressions.map((expr) => ({
          type: "ExpressionStatement" as const,
          expression: this.parseExpression(expr.cleaned),
          start: expr.position.start,
          end: expr.position.end,
          raw: expr.raw,
        }))

    return {
      type: "Program",
      body,
      sourceType: isTemplate ? "template" : "expression",
      dependencies: parsed.dependencies,
      complexity: this.calculateProgramComplexity(body),
      start: 0,
      end: template.length,
      raw: template,
    }
  }

  /**
   * 解析表达式字符串为AST节点
   */
  private parseExpression(expression: string): AnyExpressionNode {
    const trimmed = expression.trim()

    // 处理不同类型的表达式
    if (this.isStringLiteral(trimmed)) {
      return this.parseStringLiteral(trimmed)
    }

    if (this.isNumericLiteral(trimmed)) {
      return this.parseNumericLiteral(trimmed)
    }

    if (this.isBooleanLiteral(trimmed)) {
      return this.parseBooleanLiteral(trimmed)
    }

    if (this.isNullLiteral(trimmed)) {
      return this.parseNullLiteral(trimmed)
    }

    if (this.isArrayLiteral(trimmed)) {
      return this.parseArrayLiteral(trimmed)
    }

    if (this.isObjectLiteral(trimmed)) {
      return this.parseObjectLiteral(trimmed)
    }

    if (this.isVariable(trimmed)) {
      return this.parseVariable(trimmed)
    }

    if (this.isMemberExpression(trimmed)) {
      return this.parseMemberExpression(trimmed)
    }

    if (this.isFunctionCall(trimmed)) {
      return this.parseFunctionCall(trimmed)
    }

    if (this.isConditionalExpression(trimmed)) {
      return this.parseConditionalExpression(trimmed)
    }

    if (this.isBinaryExpression(trimmed)) {
      return this.parseBinaryExpression(trimmed)
    }

    if (this.isUnaryExpression(trimmed)) {
      return this.parseUnaryExpression(trimmed)
    }

    // 默认作为标识符处理
    return {
      type: "Identifier",
      name: trimmed,
      start: 0,
      end: trimmed.length,
      raw: trimmed,
    }
  }

  // ==========================================================================
  // 字面量解析器
  // ==========================================================================

  private isStringLiteral(expr: string): boolean {
    return /^(['"`]).*\1$/.test(expr)
  }

  private parseStringLiteral(expr: string): AnyExpressionNode {
    const quote = expr[0] as '"' | "'" | "`"
    const value = expr.slice(1, -1)

    return {
      type: "StringLiteral",
      value,
      quote,
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  private isNumericLiteral(expr: string): boolean {
    return /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(expr)
  }

  private parseNumericLiteral(expr: string): AnyExpressionNode {
    return {
      type: "NumericLiteral",
      value: Number(expr),
      raw: expr,
      start: 0,
      end: expr.length,
    }
  }

  private isBooleanLiteral(expr: string): boolean {
    return expr === "true" || expr === "false"
  }

  private parseBooleanLiteral(expr: string): AnyExpressionNode {
    return {
      type: "BooleanLiteral",
      value: expr === "true",
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  private isNullLiteral(expr: string): boolean {
    return expr === "null"
  }

  private parseNullLiteral(expr: string): AnyExpressionNode {
    return {
      type: "NullLiteral",
      value: null,
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  // ==========================================================================
  // 复合类型解析器
  // ==========================================================================

  private isArrayLiteral(expr: string): boolean {
    return /^\[.*\]$/.test(expr.trim())
  }

  private parseArrayLiteral(expr: string): AnyExpressionNode {
    const content = expr.slice(1, -1).trim()
    const elements: AnyExpressionNode[] = []

    if (content) {
      // 简化处理：按逗号分割（实际应该考虑嵌套）
      const parts = this.splitByComma(content)
      elements.push(...parts.map((part) => this.parseExpression(part.trim())))
    }

    return {
      type: "ArrayExpression",
      elements,
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  private isObjectLiteral(expr: string): boolean {
    return /^\{.*\}$/.test(expr.trim())
  }

  private parseObjectLiteral(expr: string): AnyExpressionNode {
    const content = expr.slice(1, -1).trim()
    const properties: Array<{
      computed: boolean
      end: number
      key: AnyExpressionNode
      start: number
      type: "ObjectProperty"
      value: AnyExpressionNode
    }> = []

    if (content) {
      // 简化处理：解析键值对
      const pairs = this.splitByComma(content)
      for (const pair of pairs) {
        const colonIndex = pair.indexOf(":")
        if (colonIndex > 0) {
          const key = pair.substring(0, colonIndex).trim()
          const value = pair.substring(colonIndex + 1).trim()

          properties.push({
            type: "ObjectProperty",
            key: this.parseExpression(key),
            value: this.parseExpression(value),
            computed: false,
            start: 0,
            end: pair.length,
          })
        }
      }
    }

    return {
      type: "ObjectExpression",
      properties,
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  // ==========================================================================
  // 变量和成员表达式解析器
  // ==========================================================================

  private isVariable(expr: string): boolean {
    return /^\$[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr)
  }

  private parseVariable(expr: string): AnyExpressionNode {
    return {
      type: "Identifier",
      name: expr,
      isVariable: true,
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  private isMemberExpression(expr: string): boolean {
    return /\./.test(expr) || /\[.*\]/.test(expr)
  }

  private parseMemberExpression(expr: string): AnyExpressionNode {
    // 处理点号访问
    if (expr.includes(".")) {
      const parts = expr.split(".")
      let result: AnyExpressionNode = {
        type: "Identifier",
        name: parts[0]!,
        isVariable: parts[0]!.startsWith("$"),
        start: 0,
        end: parts[0]!.length,
        raw: parts[0]!,
      }

      for (let i = 1; i < parts.length; i++) {
        result = {
          type: "MemberExpression",
          object: result,
          property: {
            type: "Identifier",
            name: parts[i]!,
            start: 0,
            end: parts[i]!.length,
            raw: parts[i]!,
          },
          computed: false,
          start: 0,
          end: expr.length,
          raw: expr,
        }
      }

      return result
    }

    // 处理方括号访问
    const bracketMatch = expr.match(/^(.+?)\[(.+)\]$/)
    if (bracketMatch) {
      const [, objectPart, propertyPart] = bracketMatch
      return {
        type: "MemberExpression",
        object: this.parseExpression(objectPart!),
        property: this.parseExpression(propertyPart!),
        computed: true,
        start: 0,
        end: expr.length,
        raw: expr,
      }
    }

    return {
      type: "Identifier",
      name: expr,
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  // ==========================================================================
  // 函数调用解析器
  // ==========================================================================

  private isFunctionCall(expr: string): boolean {
    return /\w+\s*\([^)]*\)/.test(expr)
  }

  private parseFunctionCall(expr: string): AnyExpressionNode {
    const match = expr.match(/^(\w+)\s*\(([^)]*)\)$/)
    if (!match) {
      return {
        type: "Identifier",
        name: expr,
        start: 0,
        end: expr.length,
        raw: expr,
      }
    }

    const [, funcName, argsStr] = match
    const args =
      argsStr && argsStr.trim()
        ? this.splitByComma(argsStr).map((arg) => this.parseExpression(arg.trim()))
        : []

    return {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: funcName!,
        start: 0,
        end: funcName!.length,
        raw: funcName!,
      },
      arguments: args,
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  // ==========================================================================
  // 运算符表达式解析器
  // ==========================================================================

  private isBinaryExpression(expr: string): boolean {
    return /[+\-*/%=!<>&|]/.test(expr)
  }

  private parseBinaryExpression(expr: string): AnyExpressionNode {
    const operators = [
      "===",
      "!==",
      "==",
      "!=",
      "<=",
      ">=",
      "<",
      ">",
      "&&",
      "||",
      "+",
      "-",
      "*",
      "/",
      "%",
    ]

    for (const op of operators) {
      const index = expr.indexOf(op)
      if (index > 0) {
        const left = expr.substring(0, index).trim()
        const right = expr.substring(index + op.length).trim()

        return {
          type: "BinaryExpression",
          left: this.parseExpression(left),
          operator: op as
            | "==="
            | "!=="
            | "=="
            | "!="
            | "<="
            | ">="
            | "<"
            | ">"
            | "&&"
            | "||"
            | "+"
            | "-"
            | "*"
            | "/"
            | "%",
          right: this.parseExpression(right),
          start: 0,
          end: expr.length,
          raw: expr,
        }
      }
    }

    return {
      type: "Identifier",
      name: expr,
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  private isUnaryExpression(expr: string): boolean {
    return /^[!-+~]\s*.+/.test(expr)
  }

  private parseUnaryExpression(expr: string): AnyExpressionNode {
    const match = expr.match(/^([!-+~])\s*(.+)/)
    if (!match) {
      return {
        type: "Identifier",
        name: expr,
        start: 0,
        end: expr.length,
        raw: expr,
      }
    }

    const [, operator, operand] = match
    return {
      type: "UnaryExpression",
      operator: operator as "!" | "-" | "+" | "~",
      argument: this.parseExpression(operand!),
      prefix: true,
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  private isConditionalExpression(expr: string): boolean {
    return expr.includes("?") && expr.includes(":")
  }

  private parseConditionalExpression(expr: string): AnyExpressionNode {
    const questionIndex = expr.indexOf("?")
    const colonIndex = expr.lastIndexOf(":")

    if (questionIndex > 0 && colonIndex > questionIndex) {
      const test = expr.substring(0, questionIndex).trim()
      const consequent = expr.substring(questionIndex + 1, colonIndex).trim()
      const alternate = expr.substring(colonIndex + 1).trim()

      return {
        type: "ConditionalExpression",
        test: this.parseExpression(test),
        consequent: this.parseExpression(consequent),
        alternate: this.parseExpression(alternate),
        start: 0,
        end: expr.length,
        raw: expr,
      }
    }

    return {
      type: "Identifier",
      name: expr,
      start: 0,
      end: expr.length,
      raw: expr,
    }
  }

  // ==========================================================================
  // 复杂度计算
  // ==========================================================================

  private calculateComplexity(parts: TemplatePart[]): number {
    let complexity = 1
    for (const part of parts) {
      if (part.type === "TemplateExpression" && typeof part.value !== "string") {
        const exprNode = part.value
        if (exprNode.type === "Expression" && exprNode.body.type === "ExpressionStatement") {
          complexity += this.calculateExpressionComplexity(exprNode.body.expression)
        }
      }
    }
    return complexity
  }

  private calculateExpressionComplexity(node: AnyExpressionNode): number {
    switch (node.type) {
      case "BinaryExpression":
        return (
          1 +
          this.calculateExpressionComplexity(node.left) +
          this.calculateExpressionComplexity(node.right)
        )
      case "ConditionalExpression":
        return (
          2 +
          this.calculateExpressionComplexity(node.test) +
          this.calculateExpressionComplexity(node.consequent) +
          this.calculateExpressionComplexity(node.alternate)
        )
      case "CallExpression":
        return (
          1 + node.arguments.reduce((sum, arg) => sum + this.calculateExpressionComplexity(arg), 0)
        )
      case "MemberExpression":
        return 1 + this.calculateExpressionComplexity(node.object)
      case "ArrayExpression":
        return (
          1 +
          node.elements.reduce(
            (sum, elem) => sum + (elem ? this.calculateExpressionComplexity(elem) : 0),
            0,
          )
        )
      case "ObjectExpression":
        return (
          1 +
          node.properties.reduce(
            (sum, prop) =>
              sum +
              this.calculateExpressionComplexity(prop.key) +
              this.calculateExpressionComplexity(prop.value),
            0,
          )
        )
      default:
        return 1
    }
  }

  private calculateProgramComplexity(body: unknown[]): number {
    return body.length
  }

  // ==========================================================================
  // 工具方法
  // ==========================================================================

  private splitByComma(str: string): string[] {
    const parts: string[] = []
    let current = ""
    let depth = 0
    let inString = false
    let stringChar = ""

    for (let i = 0; i < str.length; i++) {
      const char = str[i]!

      if (!inString) {
        if (char === '"' || char === "'" || char === "`") {
          inString = true
          stringChar = char
        } else if (char === "(" || char === "[" || char === "{") {
          depth++
        } else if (char === ")" || char === "]" || char === "}") {
          depth--
        } else if (char === "," && depth === 0) {
          parts.push(current.trim())
          current = ""
          continue
        }
      } else {
        if (char === stringChar && str[i - 1] !== "\\") {
          inString = false
          stringChar = ""
        }
      }

      current += char
    }

    if (current.trim()) {
      parts.push(current.trim())
    }

    return parts
  }

  /**
   * 获取AST元数据
   */
  getMetadata(): ASTMetadata {
    return {
      version: "1.0.0",
      sourceType: "expression",
      generated: new Date(),
      originalSource: this.sourceCode,
      ...this.metadata,
    } as ASTMetadata
  }
}
