# @choiceform/expression-engine

[![npm version](https://badge.fury.io/js/@choiceform/expression-engine.svg)](https://badge.fury.io/js/@choiceform/expression-engine)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](#测试覆盖)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

高性能、安全的前端表达式引擎。专为现代前端应用设计，提供实时表达式求值、模板解析和数据处理能力。

## ✨ 核心特性

### 🚀 高性能

- **零依赖核心**：轻量级架构，快速启动
- **智能缓存**：表达式解析结果缓存，避免重复计算
- **惰性求值**：按需解析和执行表达式

### 🔒 安全可靠

- **🛡️ 五层验证体系**：语法、语义、安全、性能、业务全方位验证
- **🔍 智能安全检测**：自动识别危险代码、原型污染、代码注入等威胁
- **⚡ 资源限制保护**：防止资源耗尽和无限循环攻击
- **🎯 沙箱执行环境**：安全隔离的表达式运行空间
- **📊 实时监控**：详细的验证结果和性能指标

### 🎯 完全兼容

- **n8n 语法**：100% 兼容 n8n 工作流表达式
- **内置变量**：支持 `$json`、`$node`、`$vars` 等所有 n8n 变量
- **内置函数**：完整的 n8n 函数库支持
- **JMESPath**：原生支持 JMESPath 查询语法

### 🛠 开发友好

- **TypeScript 原生支持**：完整的类型定义
- **AST 输出支持**：结构化语法树，支持静态分析和代码生成
- **模块化设计**：可按需引入功能模块
- **丰富的 API**：灵活的配置和扩展接口
- **详细错误信息**：精确的错误定位和提示

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add @choiceform/expression-engine

# 使用 npm
npm install @choiceform/expression-engine

# 使用 yarn
yarn add @choiceform/expression-engine
```

## 🚀 快速开始

### 基础使用

```typescript
import { ExpressionEngine, ContextManager } from "@choiceform/expression-engine"

// 创建引擎实例
const engine = new ExpressionEngine()
const contextManager = new ContextManager()

// 创建运行时上下文
const context = contextManager.createRuntimeContext({
  // 用户数据
  json: { name: "Alice", age: 30 },
  // 工作流变量
  vars: { threshold: 100 },
  // 节点数据
  node: { id: "node1", type: "transform" },
})

// 执行表达式
const result = engine.evaluate("Hello {{ $json.name }}!", context)
console.log(result.value) // "Hello Alice!"
```

### 数学计算

```typescript
// 基础数学运算
engine.evaluate("{{ 1 + 2 * 3 }}", context) // 7
engine.evaluate("{{ Math.pow(2, 3) }}", context) // 8
engine.evaluate("{{ Math.round(3.14159, 2) }}", context) // 3.14

// 条件表达式
engine.evaluate('{{ $json.age >= 18 ? "成年" : "未成年" }}', context) // "成年"
```

### 字符串处理

```typescript
// 字符串操作
engine.evaluate("{{ $json.name.toUpperCase() }}", context) // "ALICE"
engine.evaluate('{{ "Hello World".split(" ")[1] }}', context) // "World"
engine.evaluate("{{ $json.name.length > 3 }}", context) // true
```

### 日期时间处理

```typescript
// Luxon DateTime 支持
engine.evaluate('{{ $now.toFormat("yyyy-MM-dd") }}', context) // "2024-01-15"
engine.evaluate("{{ $now.plus({days: 7}).toISO() }}", context) // ISO 日期字符串
engine.evaluate("{{ $today.weekday }}", context) // 星期几 (1-7)
```

### 内置函数

```typescript
// 条件函数
engine.evaluate('{{ $if($json.age >= 18, "adult", "minor") }}', context)

// 数组操作
const arrayContext = contextManager.createRuntimeContext({
  json: { items: [1, 2, 3, 4, 5] },
})
engine.evaluate("{{ $json.items.length }}", arrayContext) // 5
engine.evaluate("{{ $json.items[0] }}", arrayContext) // 1

// 字符串函数
engine.evaluate("{{ $length($json.name) }}", context) // 5
engine.evaluate('{{ $split("a,b,c", ",") }}', context) // ["a", "b", "c"]
```

### JMESPath 查询

```typescript
const complexData = {
  users: [
    { name: "Alice", age: 30, city: "Beijing" },
    { name: "Bob", age: 25, city: "Shanghai" },
    { name: "Charlie", age: 35, city: "Guangzhou" },
  ],
}

const complexContext = contextManager.createRuntimeContext({ json: complexData })

// 复杂数据查询
engine.evaluate("{{ $json.users[?age > `30`].name }}", complexContext)
// ["Charlie"]

engine.evaluate("{{ $json.users[*].city }}", complexContext)
// ["Beijing", "Shanghai", "Guangzhou"]
```

### 🛡️ 表达式验证系统

强大的五层验证体系，确保表达式的安全性和可靠性：

```typescript
import { ValidationManager } from "@choiceform/expression-engine"

const validator = new ValidationManager({
  layers: {
    syntax: true, // 语法验证
    semantic: true, // 语义验证
    security: true, // 安全检查
    performance: true, // 性能监控
    business: false, // 业务规则
  },
})

// 验证表达式
const result = validator.validate("{{ $json.name.toUpperCase() }}")

if (result.isValid) {
  console.log("✅ 表达式安全有效")
} else {
  console.log("❌ 发现问题:")
  result.errors.forEach((error) => {
    console.log(`  ${error.layer}: ${error.message}`)
  })
}
```

#### 🔍 安全威胁检测

自动识别和阻止各种安全威胁：

```typescript
// 🚨 危险代码检测
validator.validate('{{ eval("malicious") }}') // ❌ 阻止 eval 函数
validator.validate("{{ __proto__.constructor }}") // ❌ 阻止原型污染
validator.validate('{{ Function("return process") }}') // ❌ 阻止 Function 构造器

// ⚠️ 可疑模式警告
validator.validate("{{ setTimeout(code, 100) }}") // ⚠️ 定时器函数警告
validator.validate('{{ "SELECT * FROM users" }}') // ⚠️ SQL 注入模式警告
validator.validate("{{ counter++ }}") // ⚠️ 副作用操作警告

// ✅ 安全表达式
validator.validate("{{ Math.max(1, 2, 3) }}") // ✅ 数学函数安全
validator.validate("{{ $json.items.length }}") // ✅ 属性访问安全
```

#### 📊 性能和资源监控

防止资源耗尽和性能问题：

```typescript
const config = {
  performanceThresholds: {
    maxComplexity: 100, // 最大复杂度
    maxDepth: 10, // 最大嵌套深度
    maxLength: 1000, // 最大表达式长度
    maxFunctionCalls: 50, // 最大函数调用数
  },
}

// 复杂度检查
validator.validate("{{ very.deep.nested.object.access }}", config)
// ⚠️ 警告：嵌套层次过深

// 表达式长度检查
validator.validate("{{ " + "long".repeat(500) + " }}", config)
// ❌ 错误：表达式过长

// 函数调用限制
validator.validate("{{ func1().func2().func3()...[50次] }}", config)
// ❌ 错误：函数调用过多
```

### 🌳 AST 输出功能

```typescript
// 切换到AST输出模式
engine.setOutputFormat("ast")

// 获取表达式的AST结构
const astResult = engine.evaluate("Hello {{ $json.name }}!", context)
console.log(astResult.ast.type) // "Template"
console.log(astResult.ast.dependencies) // ["$json"]
console.log(astResult.ast.complexity) // 4

// 直接生成AST（不求值）
const ast = engine.generateAST('{{ $json.age > 18 ? "成年" : "未成年" }}')
console.log(ast.type) // "Template"
console.log(ast.dependencies) // ["$json"]

// 静态分析
function analyzeExpression(template: string) {
  const ast = engine.generateAST(template)
  if (ast.type === "Template") {
    return {
      dependencies: ast.dependencies, // 依赖的变量
      complexity: ast.complexity, // 复杂度评分
      componentCount: ast.parts.length, // 组件数量
    }
  }
}

const analysis = analyzeExpression("{{ $json.user.name }} 在 {{ $json.user.city }} 工作")
console.log(analysis)
// {
//   dependencies: ['$json'],
//   complexity: 8,
//   componentCount: 5
// }

// 字符串模式 + AST元数据
const engineWithMetadata = new ExpressionEngine({
  output: { format: "string", includeMetadata: true },
})

const result = engineWithMetadata.evaluate("{{ $json.name }}", context)
console.log("字符串结果:", result.value) // "Alice"
console.log("AST结构:", result.ast) // AST对象
```

## 🔧 API 参考

### ExpressionEngine

主引擎类，提供表达式解析和求值功能。

#### 构造函数

```typescript
new ExpressionEngine(config?: EngineConfig)
```

#### 主要方法

##### `evaluate(expression: string, context: ExpressionContext): EvaluationResult`

执行表达式并返回结果。

```typescript
const result = engine.evaluate("{{ 1 + 1 }}", context)
if (result.success) {
  console.log("结果:", result.value)
  console.log("类型:", result.type)
  console.log("执行时间:", result.executionTime)
} else {
  console.error("错误:", result.error.message)
  console.error("位置:", result.error.position)
}
```

##### `parse(template: string): ParsedTemplate`

解析模板字符串，提取表达式和静态部分。

```typescript
const parsed = engine.parse("Hello {{ $json.name }}!")
console.log("是否为模板:", parsed.isTemplate)
console.log("表达式数量:", parsed.expressions.length)
console.log("依赖变量:", parsed.dependencies)
```

##### `validate(expression: string): ValidationResult`

验证表达式语法。

```typescript
const validation = engine.validate("{{ $json.invalidSyntax... }}")
if (!validation.isValid) {
  console.log("语法错误:", validation.errors)
  console.log("警告信息:", validation.warnings)
}
```

##### `setOutputFormat(format: 'string' | 'ast'): void`

设置输出格式。

```typescript
// 设置为字符串输出（默认）
engine.setOutputFormat("string")

// 设置为AST输出
engine.setOutputFormat("ast")

// 获取当前输出格式
console.log(engine.getOutputFormat()) // 'ast'
```

##### `generateAST(template: string): ASTNode`

直接生成AST结构，不执行求值。

```typescript
const ast = engine.generateAST("{{ $json.user.name }} ({{ $json.user.age }}岁)")

if (ast.type === "Template") {
  console.log("依赖变量:", ast.dependencies) // ['$json']
  console.log("复杂度:", ast.complexity) // 8
  console.log("组件数量:", ast.parts.length) // 5

  // 遍历AST组件
  ast.parts.forEach((part, index) => {
    if (part.type === "TemplateText") {
      console.log(`${index}: 静态文本 "${part.value}"`)
    } else {
      console.log(`${index}: 表达式 ${part.value.type}`)
    }
  })
}
```

##### `getASTMetadata(): ASTMetadata`

获取AST生成器的元数据信息。

```typescript
const metadata = engine.getASTMetadata()
console.log("版本:", metadata.version) // "1.0.0"
console.log("源类型:", metadata.sourceType) // "expression"
console.log("生成时间:", metadata.generated) // Date对象
```

### ContextManager

上下文管理器，负责创建和管理表达式执行环境。

```typescript
const contextManager = new ContextManager()

// 创建基础上下文
const context = contextManager.createRuntimeContext({
  json: {
    /* 当前数据 */
  },
  vars: {
    /* 工作流变量 */
  },
  node: {
    /* 节点信息 */
  },
  workflow: {
    /* 工作流信息 */
  },
  execution: {
    /* 执行信息 */
  },
})

// 添加自定义函数
contextManager.addFunction("customFunc", (arg1, arg2) => {
  return arg1 + arg2
})

// 添加自定义变量
contextManager.addVariable("$custom", { value: "custom data" })
```

### 🛡️ ValidationManager

表达式验证管理器，提供五层验证体系的完整验证功能。

#### 构造函数

```typescript
new ValidationManager(config?: ValidationConfig)
```

#### 主要方法

##### `validate(expression: string, config?: ValidationConfig): ValidationResult`

验证表达式的安全性、正确性和性能。

```typescript
const validator = new ValidationManager()

const result = validator.validate("{{ $json.name.toUpperCase() }}", {
  layers: {
    syntax: true, // 语法验证
    semantic: true, // 语义验证
    security: true, // 安全检查
    performance: true, // 性能监控
    business: false, // 业务规则
  },
})

if (result.isValid) {
  console.log("✅ 验证通过")
} else {
  result.errors.forEach((error) => {
    console.log(`❌ ${error.layer}: ${error.message}`)
  })
}

// 检查警告
result.warnings.forEach((warning) => {
  console.log(`⚠️ ${warning.layer}: ${warning.message}`)
})
```

##### `addValidator(validator: BaseValidator): void`

添加自定义验证器。

```typescript
import { BaseValidator } from "@choiceform/expression-engine"

class CustomValidator extends BaseValidator {
  readonly name = "Custom"
  readonly layer = "business" as const

  validate(context: ValidationContext): ValidationResult {
    // 自定义验证逻辑
    return {
      isValid: true,
      errors: [],
      warnings: [],
    }
  }
}

validator.addValidator(new CustomValidator())
```

##### `removeValidator(name: string): void`

移除指定的验证器。

```typescript
validator.removeValidator("Custom")
```

##### `getValidators(): BaseValidator[]`

获取所有已注册的验证器列表。

```typescript
const validators = validator.getValidators()
console.log(validators.map((v) => v.name)) // ['JavaScriptSyntax', 'TemplateSyntax', ...]
```

#### ValidationResult 结构

```typescript
interface ValidationResult {
  isValid: boolean // 整体验证是否通过
  errors: ValidationError[] // 错误列表
  warnings: ValidationWarning[] // 警告列表
  metadata: {
    totalChecks: number // 总检查数
    executionTime: number // 验证耗时 (ms)
    layers: string[] // 执行的验证层
  }
}

interface ValidationError {
  code: string // 错误代码
  message: string // 错误消息
  layer: string // 所属验证层
  severity: "error" // 严重程度
  position?: {
    // 错误位置
    start: number
    end: number
    line: number
    column: number
  }
  suggestions?: string[] // 修复建议
}
```

#### 验证配置选项

```typescript
interface ValidationConfig {
  // 验证层配置
  layers: {
    syntax?: boolean // 语法验证
    semantic?: boolean // 语义验证
    security?: boolean // 安全检查
    performance?: boolean // 性能监控
    business?: boolean // 业务规则
  }

  // 错误处理配置
  maxErrors?: number // 最大错误数量 (-1 = 无限制)
  strict?: boolean // 严格模式 (warnings 也作为错误)

  // 性能阈值配置
  performanceThresholds?: {
    maxComplexity?: number // 最大复杂度
    maxDepth?: number // 最大嵌套深度
    maxLength?: number // 最大表达式长度
    maxFunctionCalls?: number // 最大函数调用数
    maxMemoryUsage?: number // 最大内存使用 (KB)
    maxLoops?: number // 最大循环次数
  }

  // 安全配置
  security?: {
    allowedGlobals?: string[] // 允许的全局对象
    bannedKeywords?: string[] // 禁用的关键字
    maxStringLength?: number // 最大字符串长度
    allowPrototypeAccess?: boolean // 是否允许原型访问
  }
}
```

#### 预设配置

```typescript
// 开发环境配置（宽松）
const developmentConfig: ValidationConfig = {
  layers: { syntax: true },
  strict: false,
  maxErrors: -1,
}

// 生产环境配置（严格）
const productionConfig: ValidationConfig = {
  layers: { syntax: true, semantic: true, security: true, performance: true },
  strict: true,
  maxErrors: 5,
  performanceThresholds: {
    maxComplexity: 50,
    maxDepth: 5,
    maxLength: 500,
  },
}

// 高安全配置（最严格）
const highSecurityConfig: ValidationConfig = {
  layers: { syntax: true, semantic: true, security: true, performance: true, business: true },
  strict: true,
  maxErrors: 1,
  performanceThresholds: {
    maxComplexity: 30,
    maxDepth: 3,
    maxLength: 200,
  },
  security: {
    allowedGlobals: [],
    bannedKeywords: ["eval", "Function", "setTimeout", "setInterval"],
    allowPrototypeAccess: false,
  },
}

// 使用预设配置
const result = validator.validate(expression, productionConfig)
```

### 配置选项

```typescript
interface EngineConfig {
  // 安全配置
  security?: {
    maxExecutionTime?: number // 最大执行时间 (ms)
    maxMemoryUsage?: number // 最大内存使用 (bytes)
    allowedGlobals?: string[] // 允许的全局变量
    bannedKeywords?: string[] // 禁用的关键字
  }

  // 输出配置
  output?: {
    format?: "string" | "ast" // 输出格式：字符串或AST
    includeMetadata?: boolean // 字符串模式下是否包含AST元数据
  }

  // 性能配置
  performance?: {
    enableCache?: boolean // 启用表达式缓存
    cacheSize?: number // 缓存大小
    enableOptimization?: boolean // 启用优化
  }

  // 功能配置
  features?: {
    enableJMESPath?: boolean // 启用 JMESPath 支持
    enableDateTime?: boolean // 启用日期时间函数
    enableBuiltins?: boolean // 启用内置函数
  }
}
```

## 🧪 内置函数库

### 条件函数

- `$if(condition, trueValue, falseValue)` - 条件判断
- `$switch(value, case1, result1, case2, result2, ..., defaultResult)` - 多条件判断

### 字符串函数

- `$length(string)` - 获取字符串长度
- `$split(string, delimiter)` - 分割字符串
- `$join(array, delimiter)` - 连接数组元素
- `$trim(string)` - 去除首尾空格
- `$replace(string, search, replace)` - 替换字符串

### 数组函数

- `$first(array)` - 获取第一个元素
- `$last(array)` - 获取最后一个元素
- `$slice(array, start, end)` - 数组切片
- `$filter(array, expression)` - 过滤数组
- `$map(array, expression)` - 映射数组

### 数学函数

- `$abs(number)` - 绝对值
- `$ceil(number)` - 向上取整
- `$floor(number)` - 向下取整
- `$round(number, precision)` - 四舍五入

### 日期时间函数

- `$now()` - 当前时间 (Luxon DateTime)
- `$today()` - 今天日期
- `$formatDate(date, format)` - 格式化日期
- `$addDays(date, days)` - 添加天数

## 📊 测试覆盖

本项目拥有完整的测试覆盖，包含 16 个测试套件，265 个测试用例，覆盖率 100%：

### 核心功能测试

- ✅ **基础功能测试** (15/15) - 数学运算、逻辑判断、字符串处理
- ✅ **n8n 变量兼容性** (14/14) - 所有 n8n 内置变量支持
- ✅ **内置函数库** (17/17) - 完整的函数库测试
- ✅ **Luxon 日期时间** (20/20) - 日期时间处理能力
- ✅ **JMESPath 查询** (9/9) - 复杂数据查询支持

### 错误处理与性能

- ✅ **错误处理** (20/20) - 全面的错误处理机制
- ✅ **性能与安全** (8/8) - 性能优化和安全防护
- ✅ **集成测试** (9/9) - 真实场景测试
- ✅ **压力测试** (7/7) - 极限条件测试

### 高级功能测试

- ✅ **AST 输出功能** (16/16) - AST生成、分析和应用场景测试
- ✅ **极限AST测试** (15/15) - AST系统的极限挑战和边界测试
- ✅ **代码补全** (23/23) - 智能代码补全功能测试

### 🛡️ 验证系统测试

- ✅ **安全验证器** (26/26) - 危险代码检测、原型污染防护、代码注入阻断
- ✅ **语法验证器** (32/32) - JavaScript语法检查、模板语法验证、结构完整性
- ✅ **语义安全验证** (20/20) - 变量依赖、函数参数、类型兼容性检查
- ✅ **基础验证器** (14/14) - 验证系统核心功能测试

```bash
# 运行测试
pnpm test

# 生成覆盖率报告
pnpm test:coverage

# 运行验证系统测试
pnpm test tests/*validator*.test.ts
```

## 🏗 开发指南

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- TypeScript >= 5.4.0

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/automation/expression-engine.git
cd expression-engine/packages/expression-engine

# 安装依赖
pnpm install

# 开发模式构建
pnpm dev

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 代码格式化
pnpm lint:fix
```

### 项目结构

```
src/
├── engine.ts              # 主引擎类
├── index.ts               # 导出接口
├── config/                # 配置文件
├── context/               # 上下文管理
├── evaluator/             # 表达式求值器
├── libraries/             # 内置函数库
├── parser/                # 模板解析器
├── security/              # 安全沙箱
├── types/                 # TypeScript 类型定义
└── utils/                 # 工具函数

tests/                     # 测试文件
docs/                      # 文档
```

### 构建

```bash
# 构建生产版本
pnpm build

# 监听模式构建
pnpm build:watch

# 清理构建文件
pnpm clean
```

## 🤝 贡献指南

我们欢迎任何形式的贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

### 提交流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 为新功能添加测试
- 更新相关文档

## 🎨 AST 应用场景

AST（抽象语法树）输出功能为表达式引擎开启了无限可能，特别适用于以下场景：

### 🔍 静态代码分析

```typescript
// 依赖分析 - 检查表达式使用了哪些变量
const dependencies = engine.generateAST(template).dependencies
if (!dependencies.every((dep) => availableVars.includes(dep))) {
  console.warn("表达式包含未定义的变量")
}

// 复杂度评估 - 识别过于复杂的表达式
const complexity = engine.generateAST(template).complexity
if (complexity > 10) {
  console.warn("表达式过于复杂，建议简化")
}
```

### 🎨 可视化编程

```typescript
// 将AST转换为可视化编辑器的节点
function createVisualNodes(template: string) {
  const ast = engine.generateAST(template)
  return ast.parts.map((part) => ({
    id: generateId(),
    type: part.type === "TemplateText" ? "text" : "expression",
    content: part.type === "TemplateText" ? part.value : "{{...}}",
    editable: part.type === "TemplateExpression",
  }))
}
```

### 🔄 代码转换

```typescript
// 将n8n表达式转换为其他语言
function convertToJavaScript(template: string): string {
  const ast = engine.generateAST(template)
  return ast.parts
    .map((part) => {
      if (part.type === "TemplateText") {
        return `"${part.value}"`
      } else {
        return part.value.raw?.replace(/\$json/g, "data") || ""
      }
    })
    .join(" + ")
}

// n8n: "Hello {{ $json.name }}!"
// JavaScript: "Hello " + data.name + "!"
```

### 🚀 智能IDE插件

```typescript
// 代码补全
function getCompletions(template: string, position: number) {
  const ast = engine.generateAST(template)
  const context = findNodeAtPosition(ast, position)

  if (context?.type === "MemberExpression") {
    return getObjectProperties(context.object)
  }

  return getGlobalVariables()
}

// 语法高亮
function getSyntaxHighlighting(template: string) {
  const ast = engine.generateAST(template)
  return ast.parts.map((part) => ({
    range: [part.start, part.end],
    type: part.type === "TemplateText" ? "string" : "expression",
  }))
}
```

### 📋 模板优化

```typescript
// 自动优化表达式
function optimizeTemplate(template: string): string {
  const ast = engine.generateAST(template)

  // 合并相邻的静态文本
  const optimized = mergeAdjacentText(ast)

  // 简化常量表达式
  const simplified = simplifyConstants(optimized)

  return reconstructTemplate(simplified)
}
```

更多AST功能详情请查看：[AST使用指南](./docs/ast-guide.md)

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)。

## 🔗 相关链接

- [n8n 官方文档](https://docs.n8n.io/)
- [JMESPath 语法参考](https://jmespath.org/)
- [Luxon 日期时间库](https://moment.github.io/luxon/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 📞 技术支持

如果您在使用过程中遇到问题或有任何建议，请：

- 提交 [Issue](https://github.com/automation/expression-engine/issues)
- 查看 [文档](./docs/)
- 参考 [FAQ](./docs/FAQ.md)
