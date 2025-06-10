/**
 * 模板解析器 - 解析n8n风格的模板语法 {{ }}
 */

import type {
  ParsedTemplate,
  ParsedExpression,
  ExpressionType,
  EvaluationError,
} from "../types/index.js"

/**
 * 检查是否是JMESPath查询
 */
export function isJMESPath(expression: string): boolean {
  const jmesPathPatterns = ["|", "[?", "[*", "[]", ".length", ".keys()", ".values()"]
  return jmesPathPatterns.some((pattern) => expression.includes(pattern))
}

export class TemplateParser {
  // n8n模板语法正则：{{ ... }} - 支持嵌套花括号
  private static readonly TEMPLATE_REGEX = /\{\{((?:[^{}]|{[^{}]*})*)\}\}/g

  // JMESPath管道操作符检测
  private static readonly JMESPATH_OPERATORS = ["|", "[?", "[*", "[]"]

  /**
   * 解析模板字符串
   */
  public parseTemplate(input: string): ParsedTemplate {
    const expressions: ParsedExpression[] = []
    const staticParts: string[] = []
    const dependencies = new Set<string>()

    let lastIndex = 0
    let match: RegExpExecArray | null

    // 重置正则表达式的lastIndex
    TemplateParser.TEMPLATE_REGEX.lastIndex = 0

    // 检查是否包含模板语法
    const isTemplate = TemplateParser.TEMPLATE_REGEX.test(input)
    TemplateParser.TEMPLATE_REGEX.lastIndex = 0

    if (!isTemplate) {
      // 非模板字符串，直接返回
      return {
        isTemplate: false,
        expressions: [],
        staticParts: [input],
        dependencies: [],
      }
    }

    // 解析模板表达式
    while ((match = TemplateParser.TEMPLATE_REGEX.exec(input)) !== null) {
      const fullMatch = match[0]
      const expressionContent = match[1]?.trim() || ""
      const startPos = match.index
      const endPos = match.index + fullMatch.length

      // 添加静态部分（包括空字符串）
      staticParts.push(input.slice(lastIndex, startPos))

      // 解析表达式内容
      const parsed = this.parseExpression(expressionContent, startPos + 2)
      expressions.push(parsed)

      // 收集依赖
      this.extractDependencies(expressionContent, dependencies)

      lastIndex = endPos
    }

    // 添加最后的静态部分（即使是空字符串也要添加，保证 staticParts.length = expressions.length + 1）
    staticParts.push(input.slice(lastIndex))

    return {
      isTemplate: true,
      expressions,
      staticParts,
      dependencies: Array.from(dependencies),
    }
  }

  /**
   * 解析单个表达式
   */
  private parseExpression(content: string, startPos: number): ParsedExpression {
    const cleaned = content.trim()
    const type = this.detectExpressionType(cleaned)

    return {
      raw: content,
      cleaned,
      type,
      position: {
        start: startPos,
        end: startPos + content.length,
      },
    }
  }

  /**
   * 检测表达式类型
   */
  private detectExpressionType(expression: string): ExpressionType {
    // 检查是否包含JMESPath操作符
    const hasJMESPath = TemplateParser.JMESPATH_OPERATORS.some((op) => expression.includes(op))

    // 检查是否包含JavaScript语法
    const hasJavaScript = this.hasJavaScriptSyntax(expression)

    if (hasJMESPath && hasJavaScript) {
      return "mixed"
    } else if (hasJMESPath) {
      return "jmespath"
    } else {
      return "javascript"
    }
  }

  /**
   * 检查是否包含JavaScript语法
   */
  private hasJavaScriptSyntax(expression: string): boolean {
    // JavaScript关键字和操作符
    const jsPatterns = [
      /\b(Math|String|Array|Object|Date)\b/, // 内置对象
      /\b(true|false|null|undefined)\b/, // 字面量
      /[+\-*/%](?!=)/, // 算术操作符
      /[=!<>]=?/, // 比较操作符
      /&&|\|\|/, // 逻辑操作符
      /\?.*:/, // 三元操作符
      /\.\w+\(/, // 方法调用
      /\[.*\]/, // 数组访问（但排除JMESPath）
      /=>/, // 箭头函数
    ]

    return jsPatterns.some((pattern) => pattern.test(expression))
  }

  /**
   * 提取表达式依赖
   */
  private extractDependencies(expression: string, dependencies: Set<string>): void {
    // n8n变量模式
    const variablePatterns = [
      /\$json\b/g,
      /\$item\b/g,
      /\$node\b/g,
      /\$vars\b/g,
      /\$workflow\b/g,
      /\$execution\b/g,
      /\$now\b/g,
      /\$today\b/g,
      /\$if\b/g,
      /\$isEmpty\b/g,
      /\$isNotEmpty\b/g,
    ]

    variablePatterns.forEach((pattern) => {
      let match
      while ((match = pattern.exec(expression)) !== null) {
        dependencies.add(match[0])
      }
    })

    // 节点引用: $node["NodeName"]
    const nodeRefPattern = /\$node\["([^"]+)"\]/g
    let nodeMatch
    while ((nodeMatch = nodeRefPattern.exec(expression)) !== null) {
      dependencies.add(`$node["${nodeMatch[1]}"]`)
    }
  }

  /**
   * 替换模板中的表达式
   */
  public replaceTemplate(template: string, evaluator: (expression: string) => unknown): string {
    return template.replace(TemplateParser.TEMPLATE_REGEX, (_match, expression) => {
      try {
        const result = evaluator(expression.trim())
        return String(result ?? "")
      } catch (error) {
        return `[Error: ${error instanceof Error ? error.message : "Unknown error"}]`
      }
    })
  }

  /**
   * 验证模板语法
   */
  public validateTemplate(template: string): {
    errors: EvaluationError[]
    isValid: boolean
  } {
    const errors: EvaluationError[] = []

    try {
      // 检查括号配对
      const openBraces = (template.match(/\{\{/g) || []).length
      const closeBraces = (template.match(/\}\}/g) || []).length

      if (openBraces !== closeBraces) {
        errors.push({
          code: "UNMATCHED_BRACES",
          message: `不匹配的模板括号: ${openBraces} 个开始括号，${closeBraces} 个结束括号`,
        })
      }

      // 检查嵌套括号 - 修复BUG：只检查真正的嵌套，不影响多个独立表达式
      // 正确的嵌套检查：在 {{ }} 内部不应该有完整的 {{ }}
      const templateMatches = template.match(/\{\{[^{}]*\{\{[^{}]*\}\}[^{}]*\}\}/g)
      if (templateMatches) {
        errors.push({
          code: "NESTED_TEMPLATES",
          message: "不支持嵌套的模板语法",
        })
      }

      // 检查空表达式
      if (/\{\{\s*\}\}/.test(template)) {
        errors.push({
          code: "EMPTY_EXPRESSION",
          message: "空的表达式",
        })
      }
    } catch (error) {
      errors.push({
        code: "PARSE_ERROR",
        message: error instanceof Error ? error.message : "Unknown parse error",
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
