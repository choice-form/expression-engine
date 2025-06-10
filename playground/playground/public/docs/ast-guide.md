# 🌳 AST输出功能使用指南

> **抽象语法树(AST)输出功能** - 将表达式转换为结构化的语法树，支持静态分析、代码生成、可视化编辑等高级应用场景

## 📖 目录

- [快速开始](#快速开始)
- [核心概念](#核心概念)
- [基础使用](#基础使用)
- [高级功能](#高级功能)
- [AST节点类型](#ast节点类型)
- [应用场景](#应用场景)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)

## 🚀 快速开始

### 基本使用

```typescript
import { ExpressionEngine } from "@choiceform/expression-engine"

// 创建引擎并设置AST输出模式
const engine = new ExpressionEngine({
  output: { format: "ast", includeMetadata: true },
})

// 或者运行时切换
engine.setOutputFormat("ast")

// 求值并获取AST
const result = engine.evaluate("Hello {{ $json.name }}!", context)
console.log(result.ast) // AST结构
```

### 直接生成AST

```typescript
// 不求值，仅分析语法结构
const ast = engine.generateAST('{{ $json.age > 18 ? "成年" : "未成年" }}')
console.log(ast.type) // 'Template'
console.log(ast.dependencies) // ['$json']
```

## 🎯 核心概念

### 输出格式对比

| 特性         | 字符串输出         | AST输出              |
| ------------ | ------------------ | -------------------- |
| **用途**     | 模板渲染、用户显示 | 静态分析、代码生成   |
| **返回值**   | 计算结果字符串     | 语法树结构           |
| **性能**     | 需要求值计算       | 仅解析语法           |
| **分析能力** | 无                 | 依赖分析、复杂度评估 |

### AST vs 字符串

```typescript
const template = "{{ $json.user.name }} ({{ $json.user.age }}岁)"

// 字符串输出 - 用于显示
engine.setOutputFormat("string")
const stringResult = engine.evaluate(template, context)
// => { value: "张三 (28岁)", type: "string" }

// AST输出 - 用于分析
engine.setOutputFormat("ast")
const astResult = engine.evaluate(template, context)
// => { ast: { type: "Template", parts: [...], dependencies: ["$json"] } }
```

## 🔧 基础使用

### 1. 设置输出格式

```typescript
// 方法1：构造时设置
const engine = new ExpressionEngine({
  output: {
    format: "ast", // 'string' | 'ast'
    includeMetadata: true, // 是否包含元数据
  },
})

// 方法2：运行时切换
engine.setOutputFormat("ast")
console.log(engine.getOutputFormat()) // 'ast'
```

### 2. 获取AST结构

```typescript
const result = engine.evaluate("{{ $json.items.length }} 个商品", context)

if (result.success && result.ast) {
  const ast = result.ast

  console.log("AST类型:", ast.type)
  if (ast.type === "Template") {
    console.log("组件数量:", ast.parts.length)
    console.log("依赖变量:", ast.dependencies)
    console.log("复杂度:", ast.complexity)
  }
}
```

### 3. 字符串模式包含AST

```typescript
// 字符串输出 + AST元数据
const engine = new ExpressionEngine({
  output: { format: "string", includeMetadata: true },
})

const result = engine.evaluate("{{ $json.name }}", context)
console.log("字符串结果:", result.value) // "张三"
console.log("同时包含AST:", result.ast) // AST结构
```

## 🏗️ 高级功能

### 1. 静态分析

```typescript
function analyzeExpression(template: string) {
  const ast = engine.generateAST(template)

  if (ast.type === "Template") {
    return {
      dependencies: ast.dependencies, // 依赖的变量
      complexity: ast.complexity, // 复杂度评分
      componentCount: ast.parts.length, // 组件数量
      hasExpressions: ast.parts.some((p) => p.type === "TemplateExpression"),
    }
  }
}

// 使用示例
const analysis = analyzeExpression("{{ $json.user.name }} 在 {{ $json.user.city }} 工作")
console.log(analysis)
// {
//   dependencies: ['$json'],
//   complexity: 8,
//   componentCount: 5,
//   hasExpressions: true
// }
```

### 2. 依赖验证

```typescript
function validateDependencies(template: string, availableVars: string[]) {
  const ast = engine.generateAST(template)

  if (ast.type === "Template") {
    const missing = ast.dependencies.filter((dep) => !availableVars.includes(dep))

    return {
      isValid: missing.length === 0,
      missingVars: missing,
      requiredVars: ast.dependencies,
    }
  }
}

// 使用示例
const validation = validateDependencies(
  "{{ $json.name }} - {{ $vars.title }}",
  ["$json"], // 只有$json可用
)
console.log(validation.missingVars) // ['$vars']
```

### 3. 代码转换

```typescript
function convertToJavaScript(ast: ASTNode): string {
  if (ast.type === "Template") {
    return ast.parts
      .map((part) => {
        if (part.type === "TemplateText") {
          return `"${part.value}"`
        } else {
          // 简化：将$json.name转换为data.name
          const expr = part.value.raw?.replace(/\$json\./g, "data.")
          return expr || ""
        }
      })
      .join(" + ")
  }
  return ""
}

// 使用示例
const ast = engine.generateAST("Hello {{ $json.name }}!")
const jsCode = convertToJavaScript(ast)
console.log(jsCode) // "Hello " + data.name + "!"
```

### 4. AST遍历

```typescript
function traverseAST(ast: ASTNode, visitor: (node: any) => void) {
  visitor(ast)

  if (ast.type === "Template") {
    ast.parts.forEach((part) => {
      visitor(part)
      if (part.type === "TemplateExpression") {
        traverseAST(part.value, visitor)
      }
    })
  }
}

// 使用示例：收集所有标识符
const identifiers: string[] = []
traverseAST(ast, (node) => {
  if (node.type === "Identifier") {
    identifiers.push(node.name)
  }
})
```

## 📊 AST节点类型

### 根节点类型

#### Template 节点

```typescript
interface TemplateNode {
  type: "Template"
  parts: TemplatePart[] // 模板组件
  dependencies: string[] // 依赖变量
  complexity?: number // 复杂度评分
  start: number // 起始位置
  end: number // 结束位置
  raw: string // 原始代码
}
```

#### Program 节点

```typescript
interface ProgramNode {
  type: "Program"
  body: StatementNode[] // 语句列表
  sourceType: "expression" | "template"
  complexity?: number
  dependencies?: string[]
}
```

### 模板组件类型

#### 静态文本

```typescript
interface TemplateTextPart {
  type: "TemplateText"
  value: string // 文本内容
  start: number
  end: number
}
```

#### 表达式组件

```typescript
interface TemplateExpressionPart {
  type: "TemplateExpression"
  value: ExpressionNode // 表达式AST
  start: number
  end: number
}
```

### 表达式节点类型

#### 标识符

```typescript
interface IdentifierNode {
  type: "Identifier"
  name: string // 标识符名称
  isVariable?: boolean // 是否是n8n变量($json等)
}
```

#### 成员访问

```typescript
interface MemberExpressionNode {
  type: "MemberExpression"
  object: AnyExpressionNode // 对象
  property: AnyExpressionNode // 属性
  computed: boolean // true: obj[prop], false: obj.prop
}
```

#### 二元表达式

```typescript
interface BinaryExpressionNode {
  type: "BinaryExpression"
  left: AnyExpressionNode // 左操作数
  operator: BinaryOperator // 运算符
  right: AnyExpressionNode // 右操作数
}
```

#### 条件表达式

```typescript
interface ConditionalExpressionNode {
  type: "ConditionalExpression"
  test: AnyExpressionNode // 条件
  consequent: AnyExpressionNode // 真值分支
  alternate: AnyExpressionNode // 假值分支
}
```

#### 函数调用

```typescript
interface CallExpressionNode {
  type: "CallExpression"
  callee: AnyExpressionNode // 函数
  arguments: AnyExpressionNode[] // 参数列表
}
```

## 🎨 应用场景

### 1. 静态代码分析

```typescript
// 复杂度分析工具
function analyzeComplexity(templates: string[]) {
  return templates
    .map((template) => {
      const ast = engine.generateAST(template)
      return {
        template,
        complexity: ast.type === "Template" ? ast.complexity : 1,
        dependencies: ast.type === "Template" ? ast.dependencies : [],
      }
    })
    .sort((a, b) => (b.complexity || 0) - (a.complexity || 0))
}

// 依赖关系图
function buildDependencyGraph(templates: string[]) {
  const graph = new Map<string, string[]>()

  templates.forEach((template) => {
    const ast = engine.generateAST(template)
    if (ast.type === "Template") {
      graph.set(template, ast.dependencies)
    }
  })

  return graph
}
```

### 2. 可视化编辑器

```typescript
// 表达式结构可视化
function createExpressionTree(template: string) {
  const ast = engine.generateAST(template)

  if (ast.type === "Template") {
    return ast.parts.map((part, index) => ({
      id: `part-${index}`,
      type: part.type,
      content: part.type === "TemplateText" ? part.value : "表达式",
      editable: part.type === "TemplateExpression",
      ast: part.type === "TemplateExpression" ? part.value : null,
    }))
  }

  return []
}

// 拖拽式编辑器数据结构
interface EditorNode {
  id: string
  type: "text" | "variable" | "function" | "condition"
  properties: Record<string, unknown>
  children?: EditorNode[]
}

function astToEditorNodes(ast: ASTNode): EditorNode[] {
  // 将AST转换为编辑器可用的节点结构
  // 实现略...
}
```

### 3. 代码生成工具

```typescript
// 多语言代码生成
class CodeGenerator {
  generateJavaScript(ast: ASTNode): string {
    // 生成JavaScript代码
  }

  generatePython(ast: ASTNode): string {
    // 生成Python代码
  }

  generateSQL(ast: ASTNode): string {
    // 生成SQL查询
  }
}

// 模板优化器
function optimizeTemplate(template: string): string {
  const ast = engine.generateAST(template)
  // 基于AST进行优化：
  // - 合并相邻的静态文本
  // - 简化表达式
  // - 删除不必要的括号
  return reconstructTemplate(ast)
}
```

### 4. 智能提示系统

```typescript
// 代码补全
function getCompletions(template: string, position: number) {
  const ast = engine.generateAST(template)

  // 根据光标位置和AST结构提供智能补全
  const context = findContextAtPosition(ast, position)

  if (context.type === "MemberExpression") {
    // 提供对象属性补全
    return getObjectProperties(context.object)
  } else if (context.type === "CallExpression") {
    // 提供函数参数提示
    return getFunctionSignature(context.callee)
  }

  return getGlobalCompletions()
}

// 语法错误检测
function validateSyntax(template: string) {
  try {
    const ast = engine.generateAST(template)
    return { isValid: true, ast }
  } catch (error) {
    return {
      isValid: false,
      error: error.message,
      suggestions: generateFixSuggestions(error),
    }
  }
}
```

## ⚡ 性能优化

### 1. 缓存策略

```typescript
// AST缓存比字符串缓存更高效
const engine = new ExpressionEngine({
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5分钟
  },
})

// 不同输出格式分别缓存
engine.setOutputFormat("string")
engine.evaluate(template, context) // 缓存字符串结果

engine.setOutputFormat("ast")
engine.evaluate(template, context) // 缓存AST结果
```

### 2. 按需生成

```typescript
// 根据需要选择输出格式
function smartEvaluate(template: string, context: any, needAnalysis: boolean) {
  if (needAnalysis) {
    // 需要分析时使用AST模式
    engine.setOutputFormat("ast")
    const result = engine.evaluate(template, context)
    return {
      analysis: extractAnalysis(result.ast),
      ast: result.ast,
    }
  } else {
    // 仅需要结果时使用字符串模式
    engine.setOutputFormat("string")
    const result = engine.evaluate(template, context)
    return { value: result.value }
  }
}
```

### 3. 批量处理

```typescript
// 批量AST生成
function batchGenerateAST(templates: string[]) {
  return templates.map((template) => ({
    template,
    ast: engine.generateAST(template),
    analysis: quickAnalyze(template),
  }))
}
```

## 🎯 最佳实践

### 1. 选择合适的输出格式

```typescript
// ✅ 正确使用场景
// 用户界面显示 -> 字符串模式
engine.setOutputFormat("string")
const displayText = engine.evaluate(template, context).value

// 代码分析工具 -> AST模式
engine.setOutputFormat("ast")
const dependencies = engine.evaluate(template, context).ast?.dependencies

// 同时需要结果和分析 -> 字符串模式 + includeMetadata
const engine = new ExpressionEngine({
  output: { format: "string", includeMetadata: true },
})
```

### 2. AST节点类型检查

```typescript
// ✅ 类型安全的AST处理
function processAST(ast: ASTNode) {
  if (ast.type === "Template") {
    // TypeScript会正确推断ast为TemplateNode
    ast.parts.forEach((part) => {
      if (part.type === "TemplateText") {
        console.log("静态文本:", part.value)
      } else if (part.type === "TemplateExpression") {
        console.log("表达式:", part.value.type)
      }
    })
  }
}
```

### 3. 错误处理

```typescript
// ✅ 完善的错误处理
function safeEvaluateAST(template: string) {
  try {
    const result = engine.evaluate(template, context)

    if (!result.success) {
      console.error("求值失败:", result.error)
      return null
    }

    if (!result.ast) {
      console.warn("未获取到AST结构")
      return null
    }

    return result.ast
  } catch (error) {
    console.error("引擎错误:", error)
    return null
  }
}
```

### 4. 内存管理

```typescript
// ✅ 合理的缓存配置
const engine = new ExpressionEngine({
  cache: {
    enabled: true,
    maxSize: 500, // 适中的缓存大小
    ttl: 2 * 60 * 1000, // 较短的TTL避免内存泄漏
  },
})

// 定期清理缓存
setInterval(
  () => {
    engine.clearCache()
  },
  10 * 60 * 1000,
) // 10分钟清理一次
```

## 🔗 相关资源

- [表达式语法指南](./syntax-basics.md)
- [内置函数参考](./functions-reference.md)
- [常用示例](./common-examples.md)
- [AST设计文档](./AST-OUTPUT-DESIGN.md)

---

> 💡 **提示**: AST功能为表达式引擎开启了无限可能，从静态分析到可视化编程，让你的应用更智能、更强大！
