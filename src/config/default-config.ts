/**
 * 默认配置
 */

import type { EngineConfig } from "../types/index.js"

export const DEFAULT_CONFIG: EngineConfig = {
  // 安全配置
  security: {
    // 执行超时 5秒
    timeout: 5000,

    // 内存限制 10MB
    maxMemory: 10 * 1024 * 1024,

    // 调用栈深度限制
    maxCallStackSize: 100,

    // 允许的全局对象
    allowedGlobals: new Set([
      "Math",
      "String",
      "Number",
      "Boolean",
      "Array",
      "Object",
      "Date",
      "JSON",
      "parseInt",
      "parseFloat",
      "isNaN",
      "isFinite",
    ]),

    // 允许的方法 (暂时空，后续可扩展)
    allowedMethods: new Set([]),

    // 禁止的模式
    blockedPatterns: [
      /\beval\b/, // eval函数
      /\bFunction\b/, // Function构造器
      /\bsetTimeout\b/, // 定时器
      /\bsetInterval\b/, // 定时器
      /\bsetImmediate\b/, // 立即执行
      /\brequire\b/, // 模块导入
      /\bimport\b/, // ES6导入
      /\bprocess\b/, // Node进程
      /\bglobal\b/, // 全局对象
      /\bwindow\b/, // 浏览器窗口
      /\bdocument\b/, // DOM文档
      /\.constructor\b/, // 构造器访问
      /\.__proto__\b/, // 原型链访问
      /\.prototype\b/, // 原型访问
      /\balert\b/, // 浏览器弹窗
      /\bconfirm\b/, // 浏览器确认
      /\bprompt\b/, // 浏览器输入
    ],

    // 不允许函数构造器
    allowFunctionConstructor: false,
  },

  // 性能配置
  cache: {
    enabled: true,
    maxSize: 1000, // 最多缓存1000个表达式结果
    ttl: 5 * 60 * 1000, // 缓存5分钟
  },

  // 调试配置
  debug: {
    enabled: false,
    traceExecution: false,
    logPerformance: false,
  },

  // 扩展库配置
  libraries: {
    luxon: true, // 启用Luxon日期时间库
    jmespath: true, // 启用JMESPath查询库
  },

  // 输出配置
  output: {
    format: "string", // 默认字符串输出，保持向后兼容
    includeMetadata: false, // 默认不包含元数据
  },
}
