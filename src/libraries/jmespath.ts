/**
 * JMESPath 查询库集成
 * 为表达式引擎提供强大的JSON查询能力
 */

import jmespath from "jmespath"
import type { ExpressionValue } from "../types/index.js"

/**
 * 安全的JMESPath查询函数
 */
export function safeJMESPathSearch(data: unknown, query: string): ExpressionValue {
  try {
    // JMESPath只能处理普通的JavaScript对象/数组
    const cleanData = sanitizeForJMESPath(data)
    const result = jmespath.search(cleanData, query)
    return result as ExpressionValue
  } catch (error) {
    throw new Error(
      `JMESPath query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

/**
 * 编译JMESPath查询以提高性能
 * 注意：当前 jmespath 库版本可能不支持 compile 方法，所以直接返回 search 函数
 */
export function compileJMESPath(query: string): (data: unknown) => ExpressionValue {
  return (data: unknown) => {
    const cleanData = sanitizeForJMESPath(data)
    return jmespath.search(cleanData, query) as ExpressionValue
  }
}

/**
 * 清理数据以确保JMESPath兼容性
 */
function sanitizeForJMESPath(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data
  }

  // 如果是Observable对象，获取原始值
  if (data && typeof data === "object" && "get" in data && typeof data.get === "function") {
    return sanitizeForJMESPath((data as { get: () => unknown }).get())
  }

  // 如果是数组，递归清理
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForJMESPath(item))
  }

  // 如果是Date对象，转为ISO字符串
  if (data instanceof Date) {
    return data.toISOString()
  }

  // 如果是普通对象，递归清理
  if (data && typeof data === "object" && data.constructor === Object) {
    const cleanObj: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(data)) {
      cleanObj[key] = sanitizeForJMESPath(val)
    }
    return cleanObj
  }

  // 基础类型直接返回
  return data
}

/**
 * 创建JMESPath上下文，供表达式使用
 */
export function createJMESPathContext(): Record<string, unknown> {
  return {
    // JMESPath查询函数 - 作为函数直接调用
    jmespath: safeJMESPathSearch,

    // JMESPath相关工具函数
    search: safeJMESPathSearch,
    compile: compileJMESPath,
  }
}

/**
 * n8n风格的管道操作符支持
 */
export function processJMESPathPipeline(data: unknown, pipeline: string): ExpressionValue {
  // 将管道语法转换为JMESPath查询
  // 例如: items | [?price > 100] | [0].name
  const steps = pipeline.split("|").map((step) => step.trim())

  let result: unknown = data

  for (const step of steps) {
    if (step === "") continue

    // 如果是JMESPath查询
    if (step.startsWith("[") || step.includes(".")) {
      result = safeJMESPathSearch(result, step)
    } else {
      // 简单属性访问
      if (result && typeof result === "object" && step in (result as Record<string, unknown>)) {
        result = (result as Record<string, unknown>)[step]
      } else {
        return null
      }
    }
  }

  return result as ExpressionValue
}

/**
 * 常用的JMESPath查询示例
 */
export const JMESPATH_EXAMPLES = {
  // 基础查询
  simpleProperty: "{{ $json.name }}",
  nestedProperty: "{{ $json.user.profile.email }}",
  arrayElement: "{{ $json.items[0] }}",
  arraySlice: "{{ $json.items[1:3] }}",

  // 数组操作
  allItems: "{{ $json.items[*] }}",
  allNames: "{{ $json.items[*].name }}",
  flatten: "{{ $json.categories[*].products[*] }}",

  // 过滤
  filterByPrice: "{{ $json.items[?price > `100`] }}",
  filterByStatus: "{{ $json.users[?status == `active`] }}",
  filterByType: "{{ $json.products[?type == `electronics`] }}",

  // 投影
  nameAndPrice: "{{ $json.items[*].{name: name, price: price} }}",
  customFormat: "{{ $json.users[*].{id: id, fullName: join(` `, [firstName, lastName])} }}",

  // 函数使用
  length: "{{ length($json.items) }}",
  sum: "{{ sum($json.items[*].price) }}",
  max: "{{ max($json.scores) }}",
  min: "{{ min($json.scores) }}",
  sort: "{{ sort_by($json.items, &price) }}",
  reverse: "{{ reverse($json.items) }}",

  // 条件查询
  conditionalValue: "{{ $json.user && $json.user.name || `Anonymous` }}",
  firstActive: "{{ $json.users[?status == `active`] | [0] }}",

  // 复杂查询
  expensiveElectronics: "{{ $json.products[?category == `electronics` && price > `500`] }}",
  topUsers: "{{ $json.users | sort_by(@, &-score) | [0:5] }}",
  categoryStats:
    "{{ $json.products | group_by(@, &category) | {category: key, count: length(value), avgPrice: avg(value[*].price)} }}",

  // 管道操作
  pipeline: "{{ $json.orders | [?status == `completed`] | [*].items | [*] | [?price > `50`] }}",
  aggregation: "{{ $json.sales | [*].amount | sum(@) }}",
}

/**
 * 验证JMESPath查询语法
 */
export function validateJMESPathQuery(query: string): {
  error?: string
  isValid: boolean
} {
  try {
    // 尝试在空对象上执行查询来验证语法
    jmespath.search({}, query)
    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid JMESPath query",
    }
  }
}
