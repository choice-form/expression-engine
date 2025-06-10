/**
 * 方法注册表工具
 * 支持自动生成和管理已知的全局函数和方法
 */

export interface FunctionSignature {
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

export interface MethodInfo {
  name: string
  type: "global" | "array" | "string" | "number" | "object" | "date" | "regexp" | "luxon"
  source: "builtin" | "library" | "custom"
  description?: string
  signature?: FunctionSignature // 函数签名信息
}

export interface VariableInfo {
  name: string
  type: "context" | "builtin" | "function" | "constant"
  source: "builtin" | "custom"
  description?: string
  deprecated?: boolean
  replacement?: string
}

/**
 * 自动生成方法注册表
 */
export class MethodRegistry {
  private static instance: MethodRegistry
  private methodMap = new Map<string, MethodInfo>()
  private variableMap = new Map<string, VariableInfo>()
  private knownMethodsCache: Set<string> | null = null
  private knownVariablesCache: Set<string> | null = null

  private constructor() {
    this.initializeBuiltinMethods()
    this.initializeBuiltinVariables()
    this.initializeBuiltinFunctions()
  }

  static getInstance(): MethodRegistry {
    if (!MethodRegistry.instance) {
      MethodRegistry.instance = new MethodRegistry()
    }
    return MethodRegistry.instance
  }

  /**
   * 初始化内置变量
   */
  private initializeBuiltinVariables(): void {
    // 上下文变量
    const contextVariables = [
      { name: "$json", type: "context" as const, description: "输入数据对象" },
      { name: "$item", type: "context" as const, description: "当前处理的数据项" },
      { name: "$node", type: "context" as const, description: "当前节点信息" },
      { name: "$vars", type: "context" as const, description: "变量存储" },
      { name: "$input", type: "context" as const, description: "输入数据" },
      { name: "$workflow", type: "context" as const, description: "工作流信息" },
      { name: "$execution", type: "context" as const, description: "执行上下文" },
      { name: "$runIndex", type: "context" as const, description: "运行索引" },
      { name: "$itemIndex", type: "context" as const, description: "项目索引" },
    ]

    // 内置常量
    const builtinConstants = [
      { name: "$now", type: "constant" as const, description: "当前时间戳" },
      { name: "$today", type: "constant" as const, description: "今天的日期" },
    ]

    // 已弃用变量
    const deprecatedVariables = [
      {
        name: "$binary",
        type: "context" as const,
        description: "二进制数据",
        deprecated: true,
        replacement: "$item.binary",
      },
    ]

    // 内置函数（以$开头的）
    const builtinFunctions = [
      { name: "$if", type: "function" as const, description: "条件函数" },
      { name: "$isEmpty", type: "function" as const, description: "检查是否为空" },
      { name: "$isNotEmpty", type: "function" as const, description: "检查是否不为空" },
      { name: "$ifEmpty", type: "function" as const, description: "空值处理函数" },
      { name: "$number", type: "function" as const, description: "转换为数字" },
      { name: "$string", type: "function" as const, description: "转换为字符串" },
      { name: "$boolean", type: "function" as const, description: "转换为布尔值" },
      { name: "$upper", type: "function" as const, description: "转换为大写" },
      { name: "$lower", type: "function" as const, description: "转换为小写" },
      { name: "$trim", type: "function" as const, description: "去除空白字符" },
      { name: "$uuid", type: "function" as const, description: "生成UUID" },
      { name: "$timestamp", type: "function" as const, description: "生成时间戳" },
      { name: "$formatDate", type: "function" as const, description: "格式化日期" },
      { name: "$groupBy", type: "function" as const, description: "分组操作" },
      { name: "$sort", type: "function" as const, description: "排序操作" },
      { name: "$join", type: "function" as const, description: "连接操作" },
      { name: "$map", type: "function" as const, description: "映射操作" },
      { name: "$filter", type: "function" as const, description: "过滤操作" },
      { name: "$reduce", type: "function" as const, description: "归约操作" },
      { name: "$sum", type: "function" as const, description: "求和" },
      { name: "$min", type: "function" as const, description: "最小值" },
      { name: "$max", type: "function" as const, description: "最大值" },
      { name: "$avg", type: "function" as const, description: "平均值" },
      { name: "$count", type: "function" as const, description: "计数" },
      { name: "$unique", type: "function" as const, description: "去重" },
      { name: "$first", type: "function" as const, description: "获取第一个" },
      { name: "$last", type: "function" as const, description: "获取最后一个" },
      { name: "$nth", type: "function" as const, description: "获取第N个" },
      { name: "$length", type: "function" as const, description: "获取长度" },
      { name: "$reverse", type: "function" as const, description: "反转" },
      { name: "$flatten", type: "function" as const, description: "扁平化" },
      { name: "$compact", type: "function" as const, description: "移除falsy值" },
      { name: "$chunk", type: "function" as const, description: "分块" },
      { name: "$zip", type: "function" as const, description: "压缩" },
      { name: "$unzip", type: "function" as const, description: "解压缩" },
      { name: "$keys", type: "function" as const, description: "获取键" },
      { name: "$values", type: "function" as const, description: "获取值" },
      { name: "$pairs", type: "function" as const, description: "转换为键值对" },
      { name: "$fromPairs", type: "function" as const, description: "从键值对构建对象" },
      { name: "$merge", type: "function" as const, description: "合并对象" },
      { name: "$pick", type: "function" as const, description: "选择属性" },
      { name: "$omit", type: "function" as const, description: "忽略属性" },
      { name: "$clone", type: "function" as const, description: "克隆对象" },
      { name: "$isArray", type: "function" as const, description: "检查是否为数组" },
      { name: "$isObject", type: "function" as const, description: "检查是否为对象" },
      { name: "$isString", type: "function" as const, description: "检查是否为字符串" },
      { name: "$isNumber", type: "function" as const, description: "检查是否为数字" },
      { name: "$isBoolean", type: "function" as const, description: "检查是否为布尔值" },
      { name: "$isNull", type: "function" as const, description: "检查是否为null" },
      { name: "$isUndefined", type: "function" as const, description: "检查是否为undefined" },
      { name: "$isDefined", type: "function" as const, description: "检查是否已定义" },
    ]

    // 注册所有变量
    const allVariables = [
      ...contextVariables,
      ...builtinConstants,
      ...deprecatedVariables,
      ...builtinFunctions,
    ]

    allVariables.forEach((variable) => {
      this.variableMap.set(variable.name, {
        ...variable,
        source: "builtin",
      })
    })
  }

  /**
   * 初始化内置函数签名
   */
  private initializeBuiltinFunctions(): void {
    // 内置函数（以$开头的）
    const builtinFunctions: Array<{ name: string; signature: FunctionSignature }> = [
      {
        name: "$if",
        signature: {
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
      },
      {
        name: "$isEmpty",
        signature: {
          name: "$isEmpty",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "value", type: "any", required: true }],
          returnType: "boolean",
          description: "检查值是否为空",
        },
      },
      {
        name: "$isNotEmpty",
        signature: {
          name: "$isNotEmpty",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "value", type: "any", required: true }],
          returnType: "boolean",
          description: "检查值是否不为空",
        },
      },
      {
        name: "$length",
        signature: {
          name: "$length",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "value", type: "array|string|object", required: true }],
          returnType: "number",
          description: "获取数组、字符串或对象的长度",
        },
      },
      {
        name: "$keys",
        signature: {
          name: "$keys",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "object", type: "object", required: true }],
          returnType: "array",
          description: "获取对象的所有键",
        },
      },
      {
        name: "$values",
        signature: {
          name: "$values",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "object", type: "object", required: true }],
          returnType: "array",
          description: "获取对象的所有值",
        },
      },
      {
        name: "$upper",
        signature: {
          name: "$upper",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "string", type: "string", required: true }],
          returnType: "string",
          description: "将字符串转换为大写",
        },
      },
      {
        name: "$lower",
        signature: {
          name: "$lower",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "string", type: "string", required: true }],
          returnType: "string",
          description: "将字符串转换为小写",
        },
      },
      {
        name: "$number",
        signature: {
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
      },
      {
        name: "jmespath",
        signature: {
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
      },
      {
        name: "search",
        signature: {
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
      },
    ]

    // Math 函数
    const mathFunctions: Array<{ name: string; signature: FunctionSignature }> = [
      {
        name: "abs",
        signature: {
          name: "Math.abs",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "value", type: "number", required: true }],
          returnType: "number",
          description: "返回数字的绝对值",
        },
      },
      {
        name: "round",
        signature: {
          name: "Math.round",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "value", type: "number", required: true }],
          returnType: "number",
          description: "四舍五入到最近的整数",
        },
      },
      {
        name: "floor",
        signature: {
          name: "Math.floor",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "value", type: "number", required: true }],
          returnType: "number",
          description: "向下取整",
        },
      },
      {
        name: "ceil",
        signature: {
          name: "Math.ceil",
          minArgs: 1,
          maxArgs: 1,
          parameters: [{ name: "value", type: "number", required: true }],
          returnType: "number",
          description: "向上取整",
        },
      },
      {
        name: "max",
        signature: {
          name: "Math.max",
          minArgs: 1,
          maxArgs: Infinity,
          parameters: [{ name: "values", type: "number", required: true }],
          returnType: "number",
          description: "返回最大值",
        },
      },
      {
        name: "min",
        signature: {
          name: "Math.min",
          minArgs: 1,
          maxArgs: Infinity,
          parameters: [{ name: "values", type: "number", required: true }],
          returnType: "number",
          description: "返回最小值",
        },
      },
    ]

    // 注册内置函数
    builtinFunctions.forEach(({ name, signature }) => {
      this.methodMap.set(name, {
        name,
        type: "global",
        source: "builtin",
        description: signature.description,
        signature,
      })
    })

    // 注册 Math 函数（使用完整名称作为键）
    mathFunctions.forEach(({ name, signature }) => {
      this.methodMap.set(signature.name, {
        name: signature.name,
        type: "global",
        source: "builtin",
        description: signature.description,
        signature,
      })
      // 同时注册简短名称用于查找
      this.methodMap.set(name, {
        name: signature.name,
        type: "global",
        source: "builtin",
        description: signature.description,
        signature,
      })
    })
  }

  /**
   * 初始化内置方法（运行时反射）
   */
  private initializeBuiltinMethods(): void {
    // 全局函数
    const globalFunctions = [
      "parseInt",
      "parseFloat",
      "isNaN",
      "isFinite",
      "String",
      "Number",
      "Boolean",
      "Array",
      "Object",
      "Date",
      "RegExp",
      "Error",
      "encodeURIComponent",
      "decodeURIComponent",
      "encodeURI",
      "decodeURI",
    ]
    globalFunctions.forEach((name) => {
      this.methodMap.set(name, { name, type: "global", source: "builtin" })
    })

    // JSON 方法
    this.methodMap.set("JSON.parse", { name: "JSON.parse", type: "global", source: "builtin" })
    this.methodMap.set("JSON.stringify", {
      name: "JSON.stringify",
      type: "global",
      source: "builtin",
    })

    // 从原型自动提取方法
    this.extractPrototypeMethods()
  }

  /**
   * 从 JavaScript 原型自动提取方法
   */
  private extractPrototypeMethods(): void {
    // 数组方法
    const arrayMethods = this.getPrototypeMethods(Array.prototype)
    arrayMethods.forEach((name) => {
      this.methodMap.set(name, { name, type: "array", source: "builtin" })
    })

    // 字符串方法
    const stringMethods = this.getPrototypeMethods(String.prototype)
    stringMethods.forEach((name) => {
      this.methodMap.set(name, { name, type: "string", source: "builtin" })
    })

    // 数字方法
    const numberMethods = this.getPrototypeMethods(Number.prototype)
    numberMethods.forEach((name) => {
      this.methodMap.set(name, { name, type: "number", source: "builtin" })
    })

    // 对象方法
    const objectMethods = this.getPrototypeMethods(Object.prototype)
    objectMethods.forEach((name) => {
      this.methodMap.set(name, { name, type: "object", source: "builtin" })
    })

    // Date 方法
    const dateMethods = this.getPrototypeMethods(Date.prototype)
    dateMethods.forEach((name) => {
      this.methodMap.set(name, { name, type: "date", source: "builtin" })
    })

    // RegExp 方法
    const regexpMethods = this.getPrototypeMethods(RegExp.prototype)
    regexpMethods.forEach((name) => {
      this.methodMap.set(name, { name, type: "regexp", source: "builtin" })
    })
  }

  /**
   * 从原型对象获取方法名
   */
  private getPrototypeMethods(prototype: object): string[] {
    const methods: string[] = []
    const descriptors = Object.getOwnPropertyDescriptors(prototype)

    for (const [name, descriptor] of Object.entries(descriptors)) {
      // 跳过构造函数和非函数属性
      if (name === "constructor") continue

      // 检查是否是方法（函数）或访问器属性
      if (typeof descriptor.value === "function" || descriptor.get || descriptor.set) {
        methods.push(name)
      }
    }

    return methods
  }

  /**
   * 添加第三方库方法（如 Luxon）
   */
  addLibraryMethods(
    libraryName: string,
    methods: Array<{ name: string; description?: string }>,
    type: MethodInfo["type"] = "global",
  ): void {
    methods.forEach(({ name, description }) => {
      this.methodMap.set(name, {
        name,
        type,
        source: "library",
        description: description || `${libraryName} 方法`,
      })
    })

    // 清除缓存
    this.knownMethodsCache = null
  }

  /**
   * 添加自定义方法
   */
  addCustomMethods(
    methods: Array<{ name: string; type?: MethodInfo["type"]; description?: string }>,
  ): void {
    methods.forEach(({ name, type = "global", description }) => {
      this.methodMap.set(name, {
        name,
        type,
        source: "custom",
        ...(description && { description }),
      })
    })

    // 清除缓存
    this.knownMethodsCache = null
  }

  /**
   * 获取所有已知方法的Set（带缓存）
   */
  getKnownMethods(): Set<string> {
    if (!this.knownMethodsCache) {
      this.knownMethodsCache = new Set(this.methodMap.keys())
    }
    return this.knownMethodsCache
  }

  /**
   * 检查方法是否已知
   */
  isKnownMethod(methodName: string): boolean {
    return this.getKnownMethods().has(methodName)
  }

  /**
   * 添加自定义变量
   */
  addCustomVariables(
    variables: Array<{ name: string; type?: VariableInfo["type"]; description?: string }>,
  ): void {
    variables.forEach(({ name, type = "builtin", description }) => {
      this.variableMap.set(name, {
        name,
        type,
        source: "custom",
        ...(description && { description }),
      })
    })

    // 清除缓存
    this.knownVariablesCache = null
  }

  /**
   * 获取所有已知变量的Set（带缓存）
   */
  getKnownVariables(): Set<string> {
    if (!this.knownVariablesCache) {
      this.knownVariablesCache = new Set(this.variableMap.keys())
    }
    return this.knownVariablesCache
  }

  /**
   * 检查变量是否已知
   */
  isKnownVariable(variableName: string): boolean {
    return this.getKnownVariables().has(variableName)
  }

  /**
   * 获取变量信息
   */
  getVariableInfo(variableName: string): VariableInfo | undefined {
    return this.variableMap.get(variableName)
  }

  /**
   * 按类型获取变量
   */
  getVariablesByType(type: VariableInfo["type"]): VariableInfo[] {
    return Array.from(this.variableMap.values()).filter((variable) => variable.type === type)
  }

  /**
   * 检查变量是否已弃用
   */
  isDeprecatedVariable(variableName: string): boolean {
    const variable = this.getVariableInfo(variableName)
    return variable?.deprecated === true
  }

  /**
   * 获取变量的替代方案
   */
  getVariableReplacement(variableName: string): string | undefined {
    const variable = this.getVariableInfo(variableName)
    return variable?.replacement
  }

  /**
   * 获取函数签名
   */
  getFunctionSignature(functionName: string): FunctionSignature | undefined {
    const methodInfo = this.getMethodInfo(functionName)
    return methodInfo?.signature
  }

  /**
   * 获取方法信息
   */
  getMethodInfo(methodName: string): MethodInfo | undefined {
    return this.methodMap.get(methodName)
  }

  /**
   * 按类型获取方法
   */
  getMethodsByType(type: MethodInfo["type"]): MethodInfo[] {
    return Array.from(this.methodMap.values()).filter((method) => method.type === type)
  }

  /**
   * 导出配置文件（可用于持久化）
   */
  exportConfig(): Record<string, MethodInfo[]> {
    const config: Record<string, MethodInfo[]> = {}

    for (const method of this.methodMap.values()) {
      if (!config[method.type]) {
        config[method.type] = []
      }
      config[method.type]!.push(method)
    }

    return config
  }

  /**
   * 从配置文件导入
   */
  importConfig(config: Record<string, MethodInfo[]>): void {
    this.methodMap.clear()

    for (const methods of Object.values(config)) {
      methods.forEach((method) => {
        this.methodMap.set(method.name, method)
      })
    }

    // 清除缓存
    this.knownMethodsCache = null
  }
}

/**
 * 初始化 Luxon 方法
 */
export function initializeLuxonMethods(registry: MethodRegistry): void {
  const luxonInstanceMethods = [
    { name: "toFormat", description: "格式化日期时间" },
    { name: "toISO", description: "转换为 ISO 格式" },
    { name: "toISODate", description: "转换为 ISO 日期格式" },
    { name: "toISOTime", description: "转换为 ISO 时间格式" },
    { name: "toISOWeekDate", description: "转换为 ISO 周日期格式" },
    { name: "toJSDate", description: "转换为 JavaScript Date 对象" },
    { name: "toLocaleString", description: "转换为本地化字符串" },
    { name: "toMillis", description: "转换为毫秒时间戳" },
    { name: "toSeconds", description: "转换为秒时间戳" },
    { name: "toSQL", description: "转换为 SQL 格式" },
    { name: "plus", description: "增加时间" },
    { name: "minus", description: "减少时间" },
    { name: "startOf", description: "获取时间单位的开始" },
    { name: "endOf", description: "获取时间单位的结束" },
    { name: "set", description: "设置时间属性" },
    { name: "setZone", description: "设置时区" },
    { name: "diff", description: "计算时间差" },
    { name: "equals", description: "比较时间是否相等" },
    { name: "hasSame", description: "检查时间单位是否相同" },
    { name: "isValid", description: "检查时间是否有效" },
  ]

  const luxonStaticMethods = [
    { name: "fromISO", description: "从 ISO 格式创建 DateTime" },
    { name: "fromFormat", description: "从指定格式创建 DateTime" },
    { name: "fromMillis", description: "从毫秒时间戳创建 DateTime" },
    { name: "fromSeconds", description: "从秒时间戳创建 DateTime" },
    { name: "fromJSDate", description: "从 JavaScript Date 创建 DateTime" },
    { name: "now", description: "获取当前时间" },
    { name: "utc", description: "创建 UTC 时间" },
    { name: "local", description: "创建本地时间" },
  ]

  const luxonDurationMethods = [
    { name: "as", description: "转换为指定单位的数值" },
    { name: "get", description: "获取指定单位的值" },
    { name: "toObject", description: "转换为对象表示" },
    { name: "toISO", description: "转换为 ISO 8601 格式" },
    { name: "toFormat", description: "格式化持续时间" },
    { name: "valueOf", description: "获取毫秒数" },
    { name: "toString", description: "转换为字符串" },
    { name: "toJSON", description: "转换为 JSON 格式" },
    { name: "plus", description: "增加时间" },
    { name: "minus", description: "减少时间" },
    { name: "multiply", description: "乘以倍数" },
    { name: "divide", description: "除以倍数" },
    { name: "negate", description: "取负值" },
    { name: "abs", description: "取绝对值" },
    { name: "normalize", description: "标准化单位" },
    { name: "shiftTo", description: "转换单位" },
    { name: "equals", description: "比较是否相等" },
    { name: "isValid", description: "检查是否有效" },
    { name: "invalidReason", description: "获取无效原因" },
    { name: "invalidExplanation", description: "获取无效说明" },
  ]

  registry.addLibraryMethods(
    "Luxon",
    [...luxonInstanceMethods, ...luxonStaticMethods, ...luxonDurationMethods],
    "luxon",
  )
}

/**
 * 默认方法注册表实例
 */
export const defaultMethodRegistry = MethodRegistry.getInstance()

// 初始化 Luxon 方法
initializeLuxonMethods(defaultMethodRegistry)
