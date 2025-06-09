/**
 * 语义层验证器
 *
 * 负责检查：
 * - 变量依赖检查：验证使用的变量是否存在
 * - 函数参数验证：检查函数调用的参数数量和类型
 * - 类型兼容性检查：验证操作符和函数的类型兼容性
 */

import { BaseValidator } from "../base-validator.js"
import type {
  ValidationContext,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "../base-validator.js"
import type { ParsedExpression, ExpressionContext } from "../../types/index.js"

/**
 * 内置函数签名定义
 */
interface FunctionSignature {
  description: string
  maxArgs?: number
  minArgs: number
  name: string
  parameters: Array<{
    description?: string
    name: string
    required: boolean
    type: string
  }>
  returnType: string
}

/**
 * 内置函数库
 */
const BUILTIN_FUNCTIONS: Record<string, FunctionSignature> = {
  $if: {
    name: "$if",
    minArgs: 3,
    maxArgs: 3,
    parameters: [
      { name: "condition", type: "any", required: true },
      { name: "trueValue", type: "any", required: true },
      { name: "falseValue", type: "any", required: true },
    ],
    returnType: "any",
    description: "条件函数，根据条件返回不同的值",
  },
  $isEmpty: {
    name: "$isEmpty",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "value", type: "any", required: true }],
    returnType: "boolean",
    description: "检查值是否为空",
  },
  $isNotEmpty: {
    name: "$isNotEmpty",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "value", type: "any", required: true }],
    returnType: "boolean",
    description: "检查值是否不为空",
  },
  $length: {
    name: "$length",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "value", type: "array|string|object", required: true }],
    returnType: "number",
    description: "获取数组、字符串或对象的长度",
  },
  $keys: {
    name: "$keys",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "object", type: "object", required: true }],
    returnType: "array",
    description: "获取对象的所有键",
  },
  $values: {
    name: "$values",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "object", type: "object", required: true }],
    returnType: "array",
    description: "获取对象的所有值",
  },
  $upper: {
    name: "$upper",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "string", type: "string", required: true }],
    returnType: "string",
    description: "将字符串转换为大写",
  },
  $lower: {
    name: "$lower",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "string", type: "string", required: true }],
    returnType: "string",
    description: "将字符串转换为小写",
  },
  $number: {
    name: "$number",
    minArgs: 1,
    maxArgs: 2,
    parameters: [
      { name: "value", type: "any", required: true },
      { name: "decimalPlaces", type: "number", required: false },
    ],
    returnType: "number",
    description: "将值转换为数字",
  },
  jmespath: {
    name: "jmespath",
    minArgs: 2,
    maxArgs: 2,
    parameters: [
      { name: "data", type: "object|array", required: true },
      { name: "query", type: "string", required: true },
    ],
    returnType: "any",
    description: "JMESPath查询函数，用于从JSON数据中提取值",
  },
  search: {
    name: "search",
    minArgs: 2,
    maxArgs: 2,
    parameters: [
      { name: "data", type: "object|array", required: true },
      { name: "query", type: "string", required: true },
    ],
    returnType: "any",
    description: "JMESPath搜索函数，等同于jmespath函数",
  },
}

/**
 * Math函数库
 */
const MATH_FUNCTIONS: Record<string, FunctionSignature> = {
  abs: {
    name: "Math.abs",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "value", type: "number", required: true }],
    returnType: "number",
    description: "返回数字的绝对值",
  },
  round: {
    name: "Math.round",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "value", type: "number", required: true }],
    returnType: "number",
    description: "四舍五入到最近的整数",
  },
  floor: {
    name: "Math.floor",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "value", type: "number", required: true }],
    returnType: "number",
    description: "向下取整",
  },
  ceil: {
    name: "Math.ceil",
    minArgs: 1,
    maxArgs: 1,
    parameters: [{ name: "value", type: "number", required: true }],
    returnType: "number",
    description: "向上取整",
  },
  max: {
    name: "Math.max",
    minArgs: 1,
    maxArgs: Infinity,
    parameters: [{ name: "values", type: "number", required: true }],
    returnType: "number",
    description: "返回最大值",
  },
  min: {
    name: "Math.min",
    minArgs: 1,
    maxArgs: Infinity,
    parameters: [{ name: "values", type: "number", required: true }],
    returnType: "number",
    description: "返回最小值",
  },
}

/**
 * 标准变量定义
 */
const STANDARD_VARIABLES = new Set([
  "$json",
  "$item",
  "$node",
  "$vars",
  "$now",
  "$today",
  "$workflow",
  "$execution",
  "$binary",
  "$input",
  "$runIndex",
  "$itemIndex",
  // 内置函数
  "$if",
  "$isEmpty",
  "$isNotEmpty",
  "$ifEmpty",
  "$number",
  "$string",
  "$boolean",
  "$upper",
  "$lower",
  "$trim",
  "$uuid",
  "$timestamp",
  "$formatDate",
  "$groupBy",
  "$sort",
  "$join",
  "$map",
  "$filter",
  "$reduce",
  "$sum",
  "$min",
  "$max",
  "$avg",
  "$count",
  "$unique",
  "$first",
  "$last",
  "$nth",
  "$length",
  "$reverse",
  "$flatten",
  "$compact",
  "$chunk",
  "$zip",
  "$unzip",
  "$keys",
  "$values",
  "$pairs",
  "$fromPairs",
  "$merge",
  "$pick",
  "$omit",
  "$clone",
  "$isArray",
  "$isObject",
  "$isString",
  "$isNumber",
  "$isBoolean",
  "$isNull",
  "$isUndefined",
  "$isDefined",
])

/**
 * 变量依赖检查器
 */
export class VariableDependencyValidator extends BaseValidator {
  readonly name = "VariableDependency"
  readonly layer = "semantic" as const

  validate(context: ValidationContext): ValidationResult {
    const { template, parsed, context: exprContext } = context
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!parsed) {
      // 如果没有解析信息，尝试基础检查
      return this.validateRawTemplate(template, exprContext)
    }

    // 验证每个表达式的变量依赖
    for (const expression of parsed.expressions) {
      const variableResult = this.validateExpressionVariables(expression, template, exprContext)
      errors.push(...variableResult.errors)
      warnings.push(...variableResult.warnings)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 验证原始模板的变量依赖
   */
  private validateRawTemplate(
    template: string,
    exprContext?: Partial<ExpressionContext>,
  ): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      const expressionMatches = template.matchAll(/\{\{([^}]+)\}\}/g)

      for (const match of expressionMatches) {
        const expression = match[1]?.trim()
        if (!expression) continue

        const position = this.calculatePosition(
          template,
          match.index!,
          match.index! + match[0].length,
        )
        const variables = this.extractVariables(expression)

        for (const variable of variables) {
          if (!this.isVariableAvailable(variable, exprContext)) {
            errors.push(
              this.createError("UNDEFINED_VARIABLE", `变量 '${variable}' 未定义或不可用`, position),
            )
          }
        }
      }
    } catch (error) {
      errors.push(
        this.createError(
          "VARIABLE_ANALYSIS_ERROR",
          `变量分析失败: ${error instanceof Error ? error.message : "未知错误"}`,
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
   * 验证表达式中的变量
   */
  private validateExpressionVariables(
    expression: ParsedExpression,
    template: string,
    exprContext?: Partial<ExpressionContext>,
  ): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const position = this.calculatePosition(
      template,
      expression.position.start,
      expression.position.end,
    )
    const variables = this.extractVariables(expression.cleaned)

    for (const variable of variables) {
      if (!this.isVariableAvailable(variable, exprContext)) {
        errors.push(
          this.createError("UNDEFINED_VARIABLE", `变量 '${variable}' 未定义或不可用`, position),
        )
      } else if (this.isDeprecatedVariable(variable)) {
        warnings.push(
          this.createWarning(
            "DEPRECATED_VARIABLE",
            `变量 '${variable}' 已弃用，建议使用替代方案`,
            position,
          ),
        )
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 从表达式中提取变量
   */
  private extractVariables(expression: string): string[] {
    const variables = new Set<string>()

    // 匹配以$开头的变量
    const dollarVariables = expression.match(/\$[a-zA-Z_][a-zA-Z0-9_]*/g) || []
    dollarVariables.forEach((v) => variables.add(v))

    // 匹配对象属性访问（简化版）
    const propertyAccess =
      expression.match(/\$[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*/g) || []
    propertyAccess.forEach((v) => {
      const baseVariable = v.split(".")[0]
      if (baseVariable) variables.add(baseVariable)
    })

    return Array.from(variables)
  }

  /**
   * 检查变量是否可用
   */
  private isVariableAvailable(variable: string, context?: Partial<ExpressionContext>): boolean {
    // 检查标准变量
    if (STANDARD_VARIABLES.has(variable)) {
      return true
    }

    // 检查上下文中是否存在
    if (context && variable in context) {
      return true
    }

    // 检查是否是Math对象
    if (variable === "Math") {
      return true
    }

    // 检查是否是DateTime对象
    if (variable === "DateTime") {
      return true
    }

    return false
  }

  /**
   * 检查变量是否已弃用
   */
  private isDeprecatedVariable(variable: string): boolean {
    const deprecatedVariables = new Set([
      "$binary", // 建议使用 $item.binary
    ])

    return deprecatedVariables.has(variable)
  }
}

/**
 * 函数参数验证器
 */
export class FunctionParameterValidator extends BaseValidator {
  readonly name = "FunctionParameter"
  readonly layer = "semantic" as const

  validate(context: ValidationContext): ValidationResult {
    const { template, parsed } = context
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!parsed) {
      return this.validateRawTemplate(template)
    }

    // 验证每个表达式的函数调用
    for (const expression of parsed.expressions) {
      const functionResult = this.validateExpressionFunctions(expression, template)
      errors.push(...functionResult.errors)
      warnings.push(...functionResult.warnings)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 验证原始模板的函数调用
   */
  private validateRawTemplate(template: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      const expressionMatches = template.matchAll(/\{\{([^}]+)\}\}/g)

      for (const match of expressionMatches) {
        const expression = match[1]?.trim()
        if (!expression) continue

        const position = this.calculatePosition(
          template,
          match.index!,
          match.index! + match[0].length,
        )
        const functions = this.extractFunctionCalls(expression)

        for (const func of functions) {
          const validationResult = this.validateFunctionCall(func)
          if (validationResult.errors.length > 0) {
            errors.push(
              ...validationResult.errors.map((e) => this.createError(e.code, e.message, position)),
            )
          }
          if (validationResult.warnings.length > 0) {
            warnings.push(
              ...validationResult.warnings.map((w) =>
                this.createWarning(w.code, w.message, position),
              ),
            )
          }
        }
      }
    } catch (error) {
      errors.push(
        this.createError(
          "FUNCTION_ANALYSIS_ERROR",
          `函数分析失败: ${error instanceof Error ? error.message : "未知错误"}`,
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
   * 验证表达式中的函数调用
   */
  private validateExpressionFunctions(
    expression: ParsedExpression,
    template: string,
  ): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    const position = this.calculatePosition(
      template,
      expression.position.start,
      expression.position.end,
    )
    const functions = this.extractFunctionCalls(expression.cleaned)

    for (const func of functions) {
      const validationResult = this.validateFunctionCall(func)
      if (validationResult.errors.length > 0) {
        errors.push(
          ...validationResult.errors.map((e) => this.createError(e.code, e.message, position)),
        )
      }
      if (validationResult.warnings.length > 0) {
        warnings.push(
          ...validationResult.warnings.map((w) => this.createWarning(w.code, w.message, position)),
        )
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 从表达式中提取函数调用
   */
  private extractFunctionCalls(
    expression: string,
  ): Array<{ argCount: number; fullMatch: string; name: string }> {
    const functions: Array<{
      argCount: number
      fullMatch: string
      name: string
    }> = []

    // 使用更智能的方法提取函数调用，正确处理嵌套括号
    return this.extractFunctionCallsWithNesting(expression)
  }

  /**
   * 验证单个函数调用
   */
  private validateFunctionCall(func: { argCount: number; fullMatch: string; name: string }): {
    errors: Array<{ code: string; message: string }>
    warnings: Array<{ code: string; message: string }>
  } {
    const errors: Array<{ code: string; message: string }> = []
    const warnings: Array<{ code: string; message: string }> = []

    let signature: FunctionSignature | undefined

    // 检查内置函数
    if (func.name.startsWith("$")) {
      signature = BUILTIN_FUNCTIONS[func.name]
    }
    // 检查Math函数
    else if (func.name.startsWith("Math.")) {
      const mathFunc = func.name.substring(5) // 移除 'Math.' 前缀
      signature = MATH_FUNCTIONS[mathFunc]
    }
    // 检查其他已知函数（jmespath等）
    else {
      signature = BUILTIN_FUNCTIONS[func.name]
    }

    if (signature) {
      // 验证参数数量
      if (func.argCount < signature.minArgs) {
        errors.push({
          code: "INSUFFICIENT_ARGUMENTS",
          message: `函数 '${func.name}' 需要至少 ${signature.minArgs} 个参数，但只提供了 ${func.argCount} 个`,
        })
      } else if (signature.maxArgs !== undefined && func.argCount > signature.maxArgs) {
        errors.push({
          code: "TOO_MANY_ARGUMENTS",
          message: `函数 '${func.name}' 最多接受 ${signature.maxArgs} 个参数，但提供了 ${func.argCount} 个`,
        })
      }

      // 特殊检查：某些函数的常见错误
      if (func.name === "$if" && func.argCount !== 3) {
        warnings.push({
          code: "CONDITIONAL_FUNCTION_USAGE",
          message: "$if函数需要准确3个参数：condition, trueValue, falseValue",
        })
      }
    } else {
      // 未知函数警告
      if (!this.isKnownGlobalFunction(func.name)) {
        warnings.push({
          code: "UNKNOWN_FUNCTION",
          message: `未知函数 '${func.name}'，请确认函数名称是否正确`,
        })
      }
    }

    return { errors, warnings }
  }

  /**
   * 智能提取函数调用，正确处理嵌套括号
   */
  private extractFunctionCallsWithNesting(
    expression: string,
  ): Array<{ argCount: number; fullMatch: string; name: string }> {
    const functions: Array<{
      argCount: number
      fullMatch: string
      name: string
    }> = []

    // 匹配函数名的正则
    const functionNamePattern =
      /(\$[a-zA-Z_][a-zA-Z0-9_]*|Math\.[a-zA-Z_][a-zA-Z0-9_]*|[a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g
    let match

    while ((match = functionNamePattern.exec(expression)) !== null) {
      const functionName = match[1]!
      const startPos = match.index!
      const openParenPos = match.index! + match[0].length - 1

      // 找到匹配的结束括号
      const { endPos, argsString } = this.findMatchingParen(expression, openParenPos)

      if (endPos !== -1) {
        const fullMatch = expression.substring(startPos, endPos + 1)
        const argCount = this.countFunctionArguments(argsString)

        functions.push({
          name: functionName,
          argCount,
          fullMatch,
        })
      }
    }

    return functions
  }

  /**
   * 找到匹配的结束括号
   */
  private findMatchingParen(
    expression: string,
    startPos: number,
  ): { endPos: number; argsString: string } {
    let parenDepth = 1
    let inSingleQuote = false
    let inDoubleQuote = false
    let inBacktick = false
    let i = startPos + 1

    while (i < expression.length && parenDepth > 0) {
      const char = expression[i]
      const prevChar = i > 0 ? expression[i - 1] : ""

      // 处理转义字符
      if (prevChar === "\\") {
        i++
        continue
      }

      // 处理引号
      if (char === '"' && !inSingleQuote && !inBacktick) {
        inDoubleQuote = !inDoubleQuote
      } else if (char === "'" && !inDoubleQuote && !inBacktick) {
        inSingleQuote = !inSingleQuote
      } else if (char === "`" && !inDoubleQuote && !inSingleQuote) {
        inBacktick = !inBacktick
      }

      // 如果在引号内，跳过括号处理
      if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
        if (char === "(") {
          parenDepth++
        } else if (char === ")") {
          parenDepth--
        }
      }

      i++
    }

    if (parenDepth === 0) {
      const argsString = expression.substring(startPos + 1, i - 1)
      return { endPos: i - 1, argsString }
    }

    return { endPos: -1, argsString: "" }
  }

  /**
   * 智能计算函数参数数量，考虑嵌套括号和引号
   */
  private countFunctionArguments(argsString: string): number {
    if (!argsString.trim()) {
      return 0
    }

    let parenDepth = 0
    let bracketDepth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let inBacktick = false
    let argCount = 1 // 如果有内容，至少有一个参数
    let i = 0

    while (i < argsString.length) {
      const char = argsString[i]
      const prevChar = i > 0 ? argsString[i - 1] : ""

      // 处理转义字符
      if (prevChar === "\\") {
        i++
        continue
      }

      // 处理引号
      if (char === '"' && !inSingleQuote && !inBacktick) {
        inDoubleQuote = !inDoubleQuote
      } else if (char === "'" && !inDoubleQuote && !inBacktick) {
        inSingleQuote = !inSingleQuote
      } else if (char === "`" && !inDoubleQuote && !inSingleQuote) {
        inBacktick = !inBacktick
      }

      // 如果在引号内，跳过其他处理
      if (inSingleQuote || inDoubleQuote || inBacktick) {
        i++
        continue
      }

      // 处理括号
      if (char === "(" || char === "[") {
        if (char === "(") parenDepth++
        if (char === "[") bracketDepth++
      } else if (char === ")" || char === "]") {
        if (char === ")") parenDepth--
        if (char === "]") bracketDepth--
      } else if (char === "," && parenDepth === 0 && bracketDepth === 0) {
        // 只有在最外层的逗号才算作参数分隔符
        argCount++
      }

      i++
    }

    return argCount
  }

  /**
   * 检查是否是已知的全局函数
   */
  private isKnownGlobalFunction(name: string): boolean {
    const knownGlobals = new Set([
      "parseInt",
      "parseFloat",
      "isNaN",
      "isFinite",
      "String",
      "Number",
      "Boolean",
      "Array",
      "Object",
      "JSON.parse",
      "JSON.stringify",
      "encodeURIComponent",
      "decodeURIComponent",
      // 常见的数组方法
      "join",
      "map",
      "filter",
      "reduce",
      "forEach",
      "slice",
      "includes",
      "indexOf",
      "push",
      "pop",
      // 常见的字符串方法
      "substring",
      "substr",
      "toLowerCase",
      "toUpperCase",
      "trim",
      "split",
      "replace",
      "match",
      // 常见的对象方法
      "hasOwnProperty",
      "toString",
      "valueOf",
      // DateTime/Luxon 方法
      "toFormat",
      "toISO",
      "toISODate",
      "toISOTime",
      "toLocaleString",
      "plus",
      "minus",
      "startOf",
      "endOf",
      "diff",
      "equals",
      "hasSame",
      "setZone",
      "toUTC",
      "fromISO",
      "fromFormat",
      "fromMillis",
      "fromSeconds",
      "fromJSDate",
      "now",
    ])

    return knownGlobals.has(name)
  }
}

/**
 * 类型兼容性验证器
 */
export class TypeCompatibilityValidator extends BaseValidator {
  readonly name = "TypeCompatibility"
  readonly layer = "semantic" as const

  validate(context: ValidationContext): ValidationResult {
    const { template } = context
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      const expressionMatches = template.matchAll(/\{\{([^}]+)\}\}/g)

      for (const match of expressionMatches) {
        const expression = match[1]?.trim()
        if (!expression) continue

        const position = this.calculatePosition(
          template,
          match.index!,
          match.index! + match[0].length,
        )
        const typeIssues = this.analyzeTypeCompatibility(expression)

        errors.push(...typeIssues.errors.map((e) => this.createError(e.code, e.message, position)))
        warnings.push(
          ...typeIssues.warnings.map((w) => this.createWarning(w.code, w.message, position)),
        )
      }
    } catch (error) {
      errors.push(
        this.createError(
          "TYPE_ANALYSIS_ERROR",
          `类型分析失败: ${error instanceof Error ? error.message : "未知错误"}`,
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
   * 分析类型兼容性
   */
  private analyzeTypeCompatibility(expression: string): {
    errors: Array<{ code: string; message: string }>
    warnings: Array<{ code: string; message: string }>
  } {
    const errors: Array<{ code: string; message: string }> = []
    const warnings: Array<{ code: string; message: string }> = []

    // 检查算术操作
    if (/["'].*["']\s*[+\-*/]\s*\d+|\d+\s*[+\-*/]\s*["'].*["']/.test(expression)) {
      warnings.push({
        code: "MIXED_TYPE_ARITHMETIC",
        message: "字符串和数字的算术操作可能产生意外结果",
      })
    }

    // 检查除零操作
    if (/\/\s*0(?![.]|\d)/.test(expression)) {
      warnings.push({
        code: "DIVISION_BY_ZERO",
        message: "可能存在除零操作",
      })
    }

    return { errors, warnings }
  }
}
