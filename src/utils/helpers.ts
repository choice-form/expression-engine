/**
 * 表达式引擎工具函数
 * 提供通用的辅助功能
 */

import type { ExpressionValue } from "../types/index.js"

/**
 * 检查值是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value === ""
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length === 0
  return false
}

/**
 * 检查值是否不为空
 */
export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value)
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 安全地获取嵌套属性
 */
export function safeGet(obj: unknown, path: string): ExpressionValue {
  if (!obj || typeof obj !== "object") return null

  const keys = path.split(".")
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) return null
    if (typeof current !== "object") return null
    current = (current as Record<string, unknown>)[key]
  }

  return current as ExpressionValue
}

/**
 * 安全地设置嵌套属性
 */
export function safeSet(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".")
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!
    if (!(key in current) || typeof current[key] !== "object" || current[key] === null) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  const lastKey = keys[keys.length - 1]!
  current[lastKey] = value
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 创建缓存装饰器
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string,
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args) as ReturnType<T>
    cache.set(key, result)
    return result
  }) as T
}

/**
 * 格式化错误信息
 */
export function formatError(error: unknown): {
  message: string
  name?: string
  stack?: string
} {
  if (error instanceof Error) {
    const result: {
      message: string
      name?: string
      stack?: string
    } = {
      message: error.message,
      name: error.name,
    }

    if (error.stack) {
      result.stack = error.stack
    }

    return result
  }

  return {
    message: String(error),
    name: "UnknownError",
  }
}

/**
 * 生成唯一ID
 */
export function generateId(prefix = "id"): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2)
  return `${prefix}_${timestamp}_${randomStr}`
}

/**
 * 比较两个值是否相等（深度比较）
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true

  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b
  }

  if (typeof a !== typeof b) return false

  if (typeof a === "object") {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => deepEqual(item, b[index]))
    }

    if (Array.isArray(a) || Array.isArray(b)) return false

    const aKeys = Object.keys(a as Record<string, unknown>)
    const bKeys = Object.keys(b as Record<string, unknown>)

    if (aKeys.length !== bKeys.length) return false

    return aKeys.every((key) => {
      return deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    })
  }

  return false
}

/**
 * 将值转换为字符串
 */
export function toString(value: unknown): string {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return "[object Object]"
    }
  }
  return String(value)
}

/**
 * 将值转换为数字
 */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }
  if (typeof value === "boolean") return value ? 1 : 0
  return 0
}

/**
 * 将值转换为布尔值
 */
export function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value
  if (value === null || value === undefined) return false
  if (typeof value === "number") return value !== 0 && !isNaN(value)
  if (typeof value === "string") return value !== ""
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0
  return Boolean(value)
}

/**
 * 数组去重
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * 数组分组
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {}

  for (const item of array) {
    const key = keyFn(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key]!.push(item)
  }

  return groups
}

/**
 * 数组排序
 */
export function sortBy<T>(array: T[], keyFn: (item: T) => unknown): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a)
    const bVal = keyFn(b)

    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal)
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return aVal - bVal
    }

    return String(aVal).localeCompare(String(bVal))
  })
}

/**
 * 获取对象的类型字符串
 */
export function getType(value: unknown): string {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (Array.isArray(value)) return "array"
  if (value instanceof Date) return "date"
  if (value instanceof RegExp) return "regexp"
  return typeof value
}

/**
 * 检查是否为有效的JSON字符串
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * 安全的JSON解析
 */
export function safeJSONParse(str: string, fallback: unknown = null): unknown {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * 转义正则表达式特殊字符
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * 计算字符串的哈希值
 */
export function hashCode(str: string): number {
  let hash = 0
  if (str.length === 0) return hash

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 转换为32位整数
  }

  return hash
}

/**
 * 性能测量工具
 */
export class PerformanceMeasure {
  private startTime: number
  private marks: Map<string, number> = new Map()

  constructor() {
    this.startTime = performance.now()
  }

  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  measure(fromMark?: string): number {
    const now = performance.now()
    const start = fromMark ? this.marks.get(fromMark) || this.startTime : this.startTime
    return now - start
  }

  getMarks(): Record<string, number> {
    return Object.fromEntries(this.marks)
  }

  reset(): void {
    this.startTime = performance.now()
    this.marks.clear()
  }
}
