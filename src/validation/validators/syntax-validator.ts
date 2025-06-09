/**
 * 语法层验证器
 *
 * 负责检查：
 * - JavaScript语法正确性
 * - 表达式结构验证
 * - 模板语法验证
 * - 函数调用语法
 */

import { BaseValidator } from "../base-validator.js"
import type {
  ValidationContext,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "../base-validator.js"
import type { ParsedExpression } from "../../types/index.js"

/**
 * JavaScript语法验证器
 */
export class JavaScriptSyntaxValidator extends BaseValidator {
  readonly name = "JavaScriptSyntax"
  readonly layer = "syntax" as const

  validate(context: ValidationContext): ValidationResult {
    const { template, parsed } = context
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 如果没有解析信息，尝试基础语法检查
    if (!parsed) {
      return this.validateRawTemplate(template)
    }

    // 验证每个表达式的JavaScript语法
    for (const expression of parsed.expressions) {
      const syntaxResult = this.validateExpressionSyntax(expression, template)
      errors.push(...syntaxResult.errors)
      warnings.push(...syntaxResult.warnings)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 验证原始模板
   */
  private validateRawTemplate(template: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 检查基本模板语法
    try {
      // 提取所有表达式
      const expressionMatches = template.matchAll(/\{\{([^}]+)\}\}/g)

      for (const match of expressionMatches) {
        const expression = match[1]?.trim()
        if (!expression) {
          continue
        }

        const position = this.calculatePosition(
          template,
          match.index!,
          match.index! + match[0].length,
        )

        // 1. 验证JavaScript语法
        const syntaxCheck = this.checkJavaScriptSyntax(expression)
        if (!syntaxCheck.isValid) {
          errors.push(
            this.createError("SYNTAX_ERROR", `JavaScript语法错误: ${syntaxCheck.error}`, position),
          )
          // 如果JavaScript语法就有问题，跳过其他检查
          continue
        }

        // 2. 检查表达式结构（即使没有解析信息也要检查）
        const structureCheck = this.checkExpressionStructure(expression)
        errors.push(
          ...structureCheck.errors.map((err) => this.createError(err.code, err.message, position)),
        )
        warnings.push(
          ...structureCheck.warnings.map((warn) =>
            this.createWarning(warn.code, warn.message, position),
          ),
        )

        // 3. 特殊语法检查
        const specialCheck = this.checkSpecialSyntax(expression)
        warnings.push(
          ...specialCheck.warnings.map((warn) =>
            this.createWarning(warn.code, warn.message, position),
          ),
        )
      }
    } catch (error) {
      errors.push(
        this.createError(
          "TEMPLATE_PARSE_ERROR",
          `模板解析失败: ${error instanceof Error ? error.message : "未知错误"}`,
        ),
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 验证单个表达式语法
   */
  private validateExpressionSyntax(
    expression: ParsedExpression,
    template: string,
  ): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 计算表达式在模板中的位置
    const position = this.calculatePosition(
      template,
      expression.position.start,
      expression.position.end,
    )

    // 1. 基础语法检查
    const syntaxCheck = this.checkJavaScriptSyntax(expression.cleaned)
    if (!syntaxCheck.isValid) {
      errors.push(
        this.createError("SYNTAX_ERROR", `JavaScript语法错误: ${syntaxCheck.error}`, position),
      )
      return { isValid: false, errors, warnings }
    }

    // 2. 表达式结构检查
    const structureCheck = this.checkExpressionStructure(expression.cleaned)
    errors.push(
      ...structureCheck.errors.map((err) => this.createError(err.code, err.message, position)),
    )
    warnings.push(
      ...structureCheck.warnings.map((warn) =>
        this.createWarning(warn.code, warn.message, position),
      ),
    )

    // 3. 特殊语法检查
    const specialCheck = this.checkSpecialSyntax(expression.cleaned)
    warnings.push(
      ...specialCheck.warnings.map((warn) => this.createWarning(warn.code, warn.message, position)),
    )

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 检查JavaScript语法
   */
  private checkJavaScriptSyntax(expression: string): {
    error?: string
    isValid: boolean
  } {
    try {
      // 尝试解析为表达式
      new Function(`return (${expression})`)
      return { isValid: true }
    } catch (error) {
      // 如果作为表达式失败，尝试作为语句
      try {
        new Function(expression)
        return { isValid: true }
      } catch (statementError) {
        return {
          isValid: false,
          error: error instanceof Error ? error.message : "语法错误",
        }
      }
    }
  }

  /**
   * 检查表达式结构
   */
  private checkExpressionStructure(expression: string): {
    errors: Array<{ code: string; message: string }>
    warnings: Array<{ code: string; message: string }>
  } {
    const errors: Array<{ code: string; message: string }> = []
    const warnings: Array<{ code: string; message: string }> = []

    // 检查括号匹配
    const brackets = this.checkBracketMatching(expression)
    if (!brackets.isValid) {
      errors.push({
        code: "BRACKET_MISMATCH",
        message: `括号不匹配: ${brackets.error}`,
      })
    }

    // 检查引号匹配
    const quotes = this.checkQuoteMatching(expression)
    if (!quotes.isValid) {
      errors.push({
        code: "QUOTE_MISMATCH",
        message: `引号不匹配: ${quotes.error}`,
      })
    }

    // 检查运算符使用
    const operators = this.checkOperatorUsage(expression)
    warnings.push(
      ...operators.warnings.map((w) => ({
        code: "OPERATOR_WARNING",
        message: w,
      })),
    )

    // 检查函数调用语法
    const functions = this.checkFunctionCallSyntax(expression)
    errors.push(
      ...functions.errors.map((e) => ({
        code: "FUNCTION_SYNTAX_ERROR",
        message: e,
      })),
    )
    warnings.push(
      ...functions.warnings.map((w) => ({
        code: "FUNCTION_WARNING",
        message: w,
      })),
    )

    return { errors, warnings }
  }

  /**
   * 检查特殊语法
   */
  private checkSpecialSyntax(expression: string): {
    warnings: Array<{ code: string; message: string }>
  } {
    const warnings: Array<{ code: string; message: string }> = []

    // 检查是否使用了可能有问题的JavaScript特性
    const problematicPatterns = [
      { pattern: /eval\s*\(/, message: "eval()函数可能存在安全风险" },
      { pattern: /Function\s*\(/, message: "Function构造函数可能存在安全风险" },
      {
        pattern: /setTimeout|setInterval/,
        message: "定时器函数在表达式中可能不会按预期工作",
      },
      {
        pattern: /document\.|window\./,
        message: "DOM和BOM对象在沙箱环境中可能不可用",
      },
      { pattern: /\+\+|--/, message: "自增自减操作符可能导致意外的副作用" },
    ]

    for (const { pattern, message } of problematicPatterns) {
      if (pattern.test(expression)) {
        warnings.push({
          code: "SUSPICIOUS_SYNTAX",
          message,
        })
      }
    }

    // 检查复杂的嵌套结构 (简化版)
    const openBrackets = (expression.match(/[([{]/g) || []).length
    if (openBrackets > 5) {
      warnings.push({
        code: "DEEP_NESTING",
        message: `表达式嵌套层次过深 (${openBrackets}层)，可能影响可读性`,
      })
    }

    return { warnings }
  }

  /**
   * 检查括号匹配
   */
  private checkBracketMatching(expression: string): {
    error?: string
    isValid: boolean
  } {
    const brackets = { "(": ")", "[": "]", "{": "}" }
    const stack: string[] = []

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i]!

      if (char in brackets) {
        stack.push(char)
      } else if (Object.values(brackets).includes(char)) {
        const last = stack.pop()
        if (!last || brackets[last as keyof typeof brackets] !== char) {
          return {
            isValid: false,
            error: `位置 ${i} 处的 '${char}' 没有匹配的开始括号`,
          }
        }
      }
    }

    if (stack.length > 0) {
      return {
        isValid: false,
        error: `未闭合的括号: ${stack.join(", ")}`,
      }
    }

    return { isValid: true }
  }

  /**
   * 检查引号匹配
   */
  private checkQuoteMatching(expression: string): {
    error?: string
    isValid: boolean
  } {
    let inSingleQuote = false
    let inDoubleQuote = false
    let inBacktick = false
    let escaped = false

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i]!

      if (escaped) {
        escaped = false
        continue
      }

      if (char === "\\") {
        escaped = true
        continue
      }

      if (char === "'" && !inDoubleQuote && !inBacktick) {
        inSingleQuote = !inSingleQuote
      } else if (char === '"' && !inSingleQuote && !inBacktick) {
        inDoubleQuote = !inDoubleQuote
      } else if (char === "`" && !inSingleQuote && !inDoubleQuote) {
        inBacktick = !inBacktick
      }
    }

    if (inSingleQuote || inDoubleQuote || inBacktick) {
      return {
        isValid: false,
        error: "存在未闭合的引号",
      }
    }

    return { isValid: true }
  }

  /**
   * 检查运算符使用
   */
  private checkOperatorUsage(expression: string): { warnings: string[] } {
    const warnings = []

    // 检查连续运算符
    if (/[+\-*/]{2,}/.test(expression)) {
      warnings.push("存在连续的运算符，请检查是否为意外输入")
    }

    // 检查赋值运算符（在表达式中可能不合适），但排除箭头函数
    if (/[^!=<>]=(?!=)/.test(expression) && !/=>/.test(expression)) {
      warnings.push("表达式中包含赋值运算符，这可能不是预期的行为")
    }

    // 检查位运算符（可能是意外输入）
    if (/[&|^~]/.test(expression) && !/&&|\|\|/.test(expression)) {
      warnings.push("使用了位运算符，请确认这是预期的操作")
    }

    return { warnings }
  }

  /**
   * 检查函数调用语法
   */
  private checkFunctionCallSyntax(expression: string): {
    errors: string[]
    warnings: string[]
  } {
    const errors = []
    const warnings = []

    // 检查函数调用的基本模式，包括 $ 开头的函数
    const functionCallPattern = /(\$?\w+)\s*\(/g
    let match

    while ((match = functionCallPattern.exec(expression)) !== null) {
      const functionName = match[1]!

      // 检查是否是保留字
      const reservedWords = [
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "export",
        "extends",
        "finally",
        "for",
        "function",
        "if",
        "import",
        "in",
        "instanceof",
        "let",
        "new",
        "return",
        "super",
        "switch",
        "this",
        "throw",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",
        "yield",
      ]

      if (reservedWords.includes(functionName)) {
        errors.push(`不能将保留字 '${functionName}' 用作函数名`)
      }

      // 检查函数名的合法性
      if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(functionName)) {
        errors.push(`函数名 '${functionName}' 不符合JavaScript命名规范`)
      }

      // 检查一些常见的拼写错误
      const commonMisspellings: Record<string, string> = {
        lenght: "length",
        indxOf: "indexOf",
        substirng: "substring",
        repalce: "replace",
      }

      if (functionName in commonMisspellings) {
        warnings.push(
          `函数名 '${functionName}' 可能拼写错误，建议使用 '${commonMisspellings[functionName]}'`,
        )
      }
    }

    return { errors, warnings }
  }
}

/**
 * 模板语法验证器
 */
export class TemplateSyntaxValidator extends BaseValidator {
  readonly name = "TemplateSyntax"
  readonly layer = "syntax" as const

  validate(context: ValidationContext): ValidationResult {
    const { template } = context
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 检查模板标记语法
    const templateCheck = this.checkTemplateSyntax(template)
    errors.push(...templateCheck.errors.map((e) => this.createError(e.code, e.message, e.position)))
    warnings.push(
      ...templateCheck.warnings.map((w) => this.createWarning(w.code, w.message, w.position)),
    )

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 检查模板语法
   */
  private checkTemplateSyntax(template: string): {
    errors: Array<{
      code: string
      message: string
      position: { column: number; end: number; line: number; start: number }
    }>
    warnings: Array<{
      code: string
      message: string
      position: { column: number; end: number; line: number; start: number }
    }>
  } {
    const errors: Array<{
      code: string
      message: string
      position: { column: number; end: number; line: number; start: number }
    }> = []
    const warnings: Array<{
      code: string
      message: string
      position: { column: number; end: number; line: number; start: number }
    }> = []

    // 检查模板标记的完整性
    const openBraces: Array<{
      index: number
      pos: { column: number; end: number; line: number; start: number }
    }> = []
    const closeBraces: Array<{
      index: number
      pos: { column: number; end: number; line: number; start: number }
    }> = []

    // 找到所有开始和结束标记
    let match
    const openPattern = /\{\{/g
    while ((match = openPattern.exec(template)) !== null) {
      openBraces.push({
        index: match.index,
        pos: this.calculatePosition(template, match.index),
      })
    }

    const closePattern = /\}\}/g
    while ((match = closePattern.exec(template)) !== null) {
      closeBraces.push({
        index: match.index,
        pos: this.calculatePosition(template, match.index),
      })
    }

    // 检查数量匹配
    if (openBraces.length !== closeBraces.length) {
      errors.push({
        code: "TEMPLATE_MISMATCH",
        message: `模板标记不匹配: ${openBraces.length} 个开始标记，${closeBraces.length} 个结束标记`,
        position: { start: 0, end: template.length, line: 1, column: 1 },
      })
    }

    // 检查空表达式
    const emptyPattern = /\{\{\s*\}\}/g
    while ((match = emptyPattern.exec(template)) !== null) {
      warnings.push({
        code: "EMPTY_EXPRESSION",
        message: "空的模板表达式",
        position: this.calculatePosition(template, match.index),
      })
    }

    return { errors, warnings }
  }
}
