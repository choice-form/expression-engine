/**
 * n8n 内置函数集成
 * 提供n8n兼容的内置函数和工具
 */

import type { ExpressionContext } from "../types/index.js"

/**
 * n8n内置函数实现
 */
export const builtinFunctions = {
  /**
   * 条件函数 - n8n的 $if 函数
   */
  $if: (...args: unknown[]): unknown => {
    if (args.length < 3) {
      throw new Error("$if function requires exactly 3 arguments: condition, trueValue, falseValue")
    }
    const [condition, trueValue, falseValue] = args
    return condition ? trueValue : falseValue
  },

  /**
   * 检查值是否为空
   */
  $isEmpty: (value: unknown): boolean => {
    if (value === null || value === undefined) return true
    if (typeof value === "string") return value === ""
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length === 0
    return false
  },

  /**
   * 检查值是否不为空
   */
  $isNotEmpty: (value: unknown): boolean => {
    return !builtinFunctions.$isEmpty(value)
  },

  /**
   * 获取数组或对象的长度
   */
  $length: (...args: unknown[]): number => {
    if (args.length === 0) {
      throw new Error("$length function requires exactly 1 arguments: value")
    }
    const [value] = args
    if (Array.isArray(value)) return value.length
    if (typeof value === "string") return value.length
    if (value && typeof value === "object")
      return Object.keys(value as Record<string, unknown>).length
    return 0
  },

  /**
   * 获取对象的键
   */
  $keys: (obj: unknown): string[] => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      return Object.keys(obj as Record<string, unknown>)
    }
    return []
  },

  /**
   * 获取对象的值
   */
  $values: (obj: unknown): unknown[] => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      return Object.values(obj as Record<string, unknown>)
    }
    return []
  },

  /**
   * 数组去重
   */
  $unique: (arr: unknown): unknown[] => {
    if (!Array.isArray(arr)) return []
    return [...new Set(arr)]
  },

  /**
   * 数组排序
   */
  $sort: (arr: unknown, key?: string): unknown[] => {
    if (!Array.isArray(arr)) return []

    const sortedArr = [...arr]

    if (key) {
      // 按对象属性排序
      sortedArr.sort((a, b) => {
        const aVal = a && typeof a === "object" ? (a as Record<string, unknown>)[key] : a
        const bVal = b && typeof b === "object" ? (b as Record<string, unknown>)[key] : b

        if (typeof aVal === "string" && typeof bVal === "string") {
          return aVal.localeCompare(bVal)
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return aVal - bVal
        }

        return String(aVal).localeCompare(String(bVal))
      })
    } else {
      // 简单排序
      sortedArr.sort((a, b) => {
        if (typeof a === "string" && typeof b === "string") {
          return a.localeCompare(b)
        }

        if (typeof a === "number" && typeof b === "number") {
          return a - b
        }

        return String(a).localeCompare(String(b))
      })
    }

    return sortedArr
  },

  /**
   * 数组过滤
   */
  $filter: (arr: unknown, predicate: (item: unknown, index: number) => boolean): unknown[] => {
    if (!Array.isArray(arr)) return []
    return arr.filter(predicate)
  },

  /**
   * 数组映射
   */
  $map: (arr: unknown, mapper: (item: unknown, index: number) => unknown): unknown[] => {
    if (!Array.isArray(arr)) return []
    return arr.map(mapper)
  },

  /**
   * 数组查找
   */
  $find: (arr: unknown, predicate: (item: unknown, index: number) => boolean): unknown => {
    if (!Array.isArray(arr)) return null
    return arr.find(predicate) || null
  },

  /**
   * 数组分组
   */
  $groupBy: (arr: unknown, key: string): Record<string, unknown[]> => {
    if (!Array.isArray(arr)) return {}

    const groups: Record<string, unknown[]> = {}

    for (const item of arr) {
      const groupKey =
        item && typeof item === "object"
          ? String((item as Record<string, unknown>)[key] || "undefined")
          : "undefined"

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey]!.push(item)
    }

    return groups
  },

  /**
   * 字符串转换为大写
   */
  $upper: (str: unknown): string => {
    return String(str || "").toUpperCase()
  },

  /**
   * 字符串转换为小写
   */
  $lower: (str: unknown): string => {
    return String(str || "").toLowerCase()
  },

  /**
   * 字符串首字母大写
   */
  $capitalize: (str: unknown): string => {
    const s = String(str || "")
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  },

  /**
   * 字符串去除空白
   */
  $trim: (str: unknown): string => {
    return String(str || "").trim()
  },

  /**
   * 字符串替换
   */
  $replace: (str: unknown, search: string, replacement: string): string => {
    return String(str || "").replace(new RegExp(search, "g"), replacement)
  },

  /**
   * 字符串分割
   */
  $split: (...args: unknown[]): string[] => {
    if (args.length < 2) {
      throw new Error("$split function requires exactly 2 arguments: str, separator")
    }
    const [str, separator] = args
    return String(str || "").split(String(separator))
  },

  /**
   * 数组连接为字符串
   */
  $join: (arr: unknown, separator: string = ","): string => {
    if (!Array.isArray(arr)) return ""
    return arr.map((item) => String(item)).join(separator)
  },

  /**
   * 数字格式化
   */
  $number: (value: unknown, decimals?: number): number => {
    const num = Number(value)
    if (isNaN(num)) return 0

    if (typeof decimals === "number") {
      return Number(num.toFixed(decimals))
    }

    return num
  },

  /**
   * 随机数生成
   */
  $random: (min: number = 0, max: number = 1): number => {
    return Math.random() * (max - min) + min
  },

  /**
   * 随机整数生成
   */
  $randomInt: (min: number = 0, max: number = 100): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  /**
   * UUID生成（简单版本）
   */
  $uuid: (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  },

  /**
   * 时间戳生成
   */
  $timestamp: (): number => {
    return Date.now()
  },

  /**
   * 格式化时间戳
   */
  $formatDate: (timestamp: unknown, format: string = "YYYY-MM-DD"): string => {
    const date = new Date(Number(timestamp) || Date.now())

    // 简单的日期格式化
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")

    return format
      .replace(/YYYY/g, String(year))
      .replace(/MM/g, month)
      .replace(/DD/g, day)
      .replace(/HH/g, hours)
      .replace(/mm/g, minutes)
      .replace(/ss/g, seconds)
  },
}

/**
 * 创建n8n内置函数上下文
 */
export function createBuiltinContext(): Record<string, unknown> {
  return { ...builtinFunctions }
}

/**
 * 增强表达式上下文，添加内置函数
 */
export function enhanceContextWithBuiltins(context: ExpressionContext): ExpressionContext {
  const builtinContext = createBuiltinContext()

  return {
    ...context,
    ...builtinContext,
  }
}

/**
 * 内置函数使用示例
 */
export const BUILTIN_EXAMPLES = {
  // 条件函数
  conditional: '{{ $if($json.status === "active", "已激活", "未激活") }}',

  // 空值检查
  emptyCheck: '{{ $isEmpty($json.description) ? "无描述" : $json.description }}',
  notEmptyCheck: "{{ $isNotEmpty($json.tags) ? $json.tags.length : 0 }}",

  // 数组操作
  arrayLength: "{{ $length($json.items) }}",
  uniqueItems: "{{ $unique($json.categories) }}",
  sortItems: '{{ $sort($json.items, "name") }}',
  filterItems: "{{ $filter($json.items, item => item.price > 100) }}",

  // 字符串操作
  upperCase: "{{ $upper($json.name) }}",
  lowerCase: "{{ $lower($json.email) }}",
  capitalize: "{{ $capitalize($json.title) }}",
  trim: "{{ $trim($json.description) }}",
  replace: '{{ $replace($json.text, "old", "new") }}',
  split: '{{ $split($json.tags, ",") }}',
  join: '{{ $join($json.keywords, " | ") }}',

  // 数字操作
  formatNumber: "{{ $number($json.price, 2) }}",
  random: "{{ $random(1, 100) }}",
  randomInt: "{{ $randomInt(1, 10) }}",

  // 工具函数
  generateUuid: "{{ $uuid() }}",
  timestamp: "{{ $timestamp() }}",
  formatDate: '{{ $formatDate($json.createdAt, "YYYY-MM-DD HH:mm:ss") }}',

  // 对象操作
  objectKeys: "{{ $keys($json.user) }}",
  objectValues: "{{ $values($json.settings) }}",

  // 复合操作
  processUsers:
    "{{ $map($filter($json.users, user => $isNotEmpty(user.email)), user => $upper(user.name)) }}",
  groupByCategory: '{{ $groupBy($json.products, "category") }}',
  summarizeData: '{{ $join($map($keys($json), key => key + ": " + $json[key]), "; ") }}',
}
