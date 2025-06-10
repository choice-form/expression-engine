# 🛡️ 表达式验证系统指南

## 概述

表达式验证系统是一个多层次、全方位的安全和质量保障机制。它通过语法验证、安全检查、性能监控等多个层面，确保表达式的安全性、正确性和可靠性。

## 🏗️ 验证架构

### 🔍 五层验证流水线

| 层级                                    | 验证内容                                                      | 主要功能                   |
| --------------------------------------- | ------------------------------------------------------------- | -------------------------- |
| **1️⃣ 语法层**<br/>_(Syntax Layer)_      | • JavaScript 语法验证<br/>• 模板标记匹配<br/>• 结构完整性检查 | 确保表达式的基本语法正确性 |
| **2️⃣ 语义层**<br/>_(Semantic Layer)_    | • 变量依赖检查<br/>• 函数参数验证<br/>• 类型兼容性分析        | 验证表达式的逻辑正确性     |
| **3️⃣ 安全层**<br/>_(Security Layer)_    | • 危险代码检测<br/>• 原型污染防护<br/>• 代码注入阻断          | 阻止恶意代码和安全威胁     |
| **4️⃣ 性能层**<br/>_(Performance Layer)_ | • 资源使用限制<br/>• 复杂度控制<br/>• 执行时间监控            | 防止资源耗尽和性能问题     |
| **5️⃣ 业务层**<br/>_(Business Layer)_    | • 业务规则检查<br/>• 数据格式验证<br/>• 权限和范围控制        | 实施特定领域的规则约束     |

## 🚀 快速开始

### 基础验证

```typescript
import { ExpressionEngine, ValidationManager } from "@choiceform/expression-engine"

const engine = new ExpressionEngine()
const validator = new ValidationManager()

// 验证表达式
const result = validator.validate("{{ $json.name.toUpperCase() }}")

if (result.isValid) {
  console.log("✅ 表达式有效")
} else {
  console.log("❌ 验证失败:")
  result.errors.forEach((error) => {
    console.log(`  - ${error.message} (${error.code})`)
  })
}

// 检查警告
if (result.warnings.length > 0) {
  console.log("⚠️ 警告信息:")
  result.warnings.forEach((warning) => {
    console.log(`  - ${warning.message}`)
  })
}
```

### 配置验证规则

```typescript
import { ValidationConfig } from "@choiceform/expression-engine"

const config: ValidationConfig = {
  // 启用的验证层
  layers: {
    syntax: true, // 语法验证
    semantic: true, // 语义验证
    security: true, // 安全检查
    performance: true, // 性能监控
    business: false, // 业务规则（可选）
  },

  // 错误处理
  maxErrors: 10,
  strict: true,

  // 性能阈值
  performanceThresholds: {
    maxComplexity: 100,
    maxDepth: 10,
    maxLength: 1000,
  },
}

const result = validator.validate(expression, config)
```

## 🔍 语法层验证 (Syntax Layer)

语法层是验证的第一道防线，确保表达式的基本语法正确性。

### JavaScript 语法验证器

检查表达式是否符合有效的 JavaScript 语法：

```typescript
// ✅ 有效语法
"{{ 1 + 2 }}"
"{{ $json.name }}"
"{{ Math.max(1, 2, 3) }}"
"{{ $json.items.map(item => item.id) }}"

// ❌ 无效语法
"{{ (1 + 2 }}" // 括号不匹配
'{{ "unclosed string }}' // 引号不匹配
"{{ 123invalid() }}" // 非法函数名
"{{ function() }}" // 保留字语法错误
```

#### 检测能力

1. **括号匹配检查**

   ```typescript
   "{{ (1 + 2 }}" // ❌ 缺少闭合括号
   "{{ [1, 2, 3 }}" // ❌ 数组括号不匹配
   "{{ {a: 1, b: 2 }}" // ❌ 对象括号不匹配
   ```

2. **引号匹配检查**

   ```typescript
   '{{ "hello world }}' // ❌ 双引号未闭合
   "{{ 'test string }}" // ❌ 单引号未闭合
   "{{ `template literal }}" // ❌ 模板字符串未闭合
   ```

3. **标识符验证**
   ```typescript
   "{{ 123abc }}" // ❌ 数字开头的标识符
   "{{ function }}" // ❌ 保留字作为标识符
   "{{ var }}" // ❌ 保留字作为标识符
   ```

### 模板语法验证器

检查模板标记的正确性：

```typescript
// ✅ 正确的模板语法
"Hello {{ $json.name }}!"
"{{ $json.first }} and {{ $json.second }}"

// ❌ 错误的模板语法
"Hello {{ $json.name }!" // 缺少闭合标记
"Hello { $json.name }}" // 开始标记错误
"Hello {{ }}" // 空表达式（警告）
```

## 🧠 语义层验证 (Semantic Layer)

语义层验证表达式的逻辑正确性和上下文合理性。

### 变量依赖检查器

确保使用的变量在上下文中存在：

```typescript
// 上下文中可用的变量
const availableVars = ["$json", "$vars", "$node", "$workflow"]

// ✅ 有效的变量引用
;("{{ $json.name }}") // $json 存在
;("{{ $vars.threshold }}") // $vars 存在

// ❌ 无效的变量引用
;("{{ $unknown.value }}") // $unknown 不存在
;("{{ $custom.data }}") // $custom 未定义
```

### 函数参数验证器

验证函数调用的参数数量和类型：

```typescript
// ✅ 正确的函数调用
"{{ Math.max(1, 2, 3) }}" // 参数数量正确
"{{ $json.name.substring(0, 5) }}" // 参数类型正确

// ❌ 错误的函数调用
"{{ Math.max() }}" // 参数不足
'{{ "hello".substring() }}' // 必需参数缺失
"{{ unknownFunction() }}" // 未知函数（警告）
```

### 类型兼容性检查器

分析表达式中的类型操作：

```typescript
// ⚠️ 类型警告
'{{ "hello" + 123 }}' // 字符串和数字混合运算
"{{ $json.name / 2 }}" // 字符串除法操作
'{{ $json.count + "items" }}' // 数字和字符串相加
```

## 🔒 安全层验证 (Security Layer)

安全层是最重要的防护机制，阻止恶意代码执行。

### 危险代码检测器

检测和阻止高风险的 JavaScript 特性：

```typescript
// 🚨 高风险威胁（产生错误）
'{{ eval("malicious code") }}' // eval 函数
'{{ Function("return process.env") }}' // Function 构造器
"{{ __proto__.constructor }}" // 原型污染

// ⚠️ 中等风险威胁（产生警告）
"{{ setTimeout(code, 1000) }}" // 定时器函数
"{{ window.location.href }}" // 浏览器对象访问
"{{ document.cookie }}" // DOM 操作

// ⚠️ 低风险威胁（产生警告）
"{{ counter++ }}" // 自增自减操作
"{{ delete $json.prop }}" // delete 操作符
```

#### 威胁等级分类

| 威胁等级        | 行为     | 示例                                   |
| --------------- | -------- | -------------------------------------- |
| 🔴 **关键**     | 阻止执行 | `eval()`, `Function()`                 |
| 🟠 **高风险**   | 产生错误 | `__proto__`, `constructor.constructor` |
| 🟡 **中等风险** | 产生警告 | `setTimeout`, `window`, `document`     |
| 🟢 **低风险**   | 产生提示 | `++`, `--`, `delete`                   |

### 原型污染防护器

防止原型链污染攻击：

```typescript
// 🚨 原型污染检测
"{{ $json.__proto__.isAdmin = true }}" // __proto__ 访问
"{{ $json.constructor.constructor }}" // constructor 链
'{{ $json["__proto__"]["polluted"] = true }}' // 字符串形式访问
"{{ Object.prototype.polluted = true }}" // 直接原型修改
```

### 代码注入阻断器

检测和防止各种代码注入攻击：

```typescript
// 🚨 脚本注入检测
'{{ "<script>alert(1)</script>" }}' // HTML 脚本注入
'{{ "javascript:alert(1)" }}' // JavaScript URL
'{{ "SELECT * FROM users" }}' // SQL 注入模式
'{{ "\\u0061\\u006c\\u0065\\u0072\\u0074" }}' // Unicode 编码绕过
```

### 资源限制保护器

防止资源耗尽攻击：

```typescript
// 配置资源限制
const config: ValidationConfig = {
  performanceThresholds: {
    maxComplexity: 100, // 最大复杂度
    maxDepth: 10, // 最大嵌套深度
    maxLength: 1000, // 最大表达式长度
    maxFunctionCalls: 50, // 最大函数调用数
    maxMemoryUsage: 1024, // 最大内存使用 (KB)
  },
}

// 🚨 资源超限检测
// 表达式过长（>1000字符）
"{{ " + "very".repeat(500) + " }}"

// 嵌套过深（>10层）
;("{{ ((((((((((1 + 1)))))))))))) }}")

// 函数调用过多（>50次）
;("{{ func1().func2().func3()...[50次]...func50() }}")
```

## ⚡ 性能层验证 (Performance Layer)

性能层监控表达式的执行效率和资源消耗。

### 复杂度分析

```typescript
// 复杂度评分规则
const complexityRules = {
  literal: 1, // 字面量: 1分
  identifier: 1, // 标识符: 1分
  binaryExpression: 2, // 二元表达式: 2分
  callExpression: 3, // 函数调用: 3分
  conditionalExpression: 4, // 条件表达式: 4分
  memberExpression: 1, // 成员访问: 1分
  arrayExpression: 2, // 数组: 2分
  objectExpression: 3, // 对象: 3分
}

// 示例复杂度计算
;("{{ 1 + 2 }}") // 复杂度: 4 (1+1+2)
;("{{ $json.name }}") // 复杂度: 2 (1+1)
;('{{ $json.age > 18 ? "成年" : "未成年" }}') // 复杂度: 8
```

### 性能警告示例

```typescript
// ⚠️ 高复杂度警告
"{{ $json.items.filter(item => item.active).map(item => item.name).sort() }}"

// ⚠️ 深层嵌套警告
"{{ $json.user.profile.settings.display.theme.colors.primary }}"

// ⚠️ 大量计算警告
"{{ Array.from({length: 1000}, (_, i) => Math.pow(i, 2)).reduce((a, b) => a + b) }}"
```

## 🎯 业务层验证 (Business Layer)

业务层验证特定领域的规则和约束。

### 自定义验证器

```typescript
import { BaseValidator } from "@choiceform/expression-engine"

class CustomBusinessValidator extends BaseValidator {
  readonly name = "CustomBusiness"
  readonly layer = "business" as const

  validate(context: ValidationContext): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 业务规则：禁止访问敏感字段
    const sensitiveFields = ["password", "secret", "token"]
    const template = context.template

    sensitiveFields.forEach((field) => {
      if (template.includes(field)) {
        errors.push(
          this.createError(
            "SENSITIVE_FIELD_ACCESS",
            `不允许访问敏感字段: ${field}`,
            this.findFieldPosition(template, field),
          ),
        )
      }
    })

    // 业务规则：检查数据格式
    if (template.includes("email") && !template.includes("@")) {
      warnings.push(this.createWarning("EMAIL_FORMAT_WARNING", "邮箱字段可能需要格式验证"))
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }
}

// 注册自定义验证器
validator.addValidator(new CustomBusinessValidator())
```

## 🔧 验证配置

### 完整配置示例

```typescript
const validationConfig: ValidationConfig = {
  // 验证层配置
  layers: {
    syntax: true, // 启用语法验证
    semantic: true, // 启用语义验证
    security: true, // 启用安全检查
    performance: true, // 启用性能监控
    business: false, // 禁用业务验证
  },

  // 错误处理配置
  maxErrors: 10, // 最大错误数量
  strict: false, // 严格模式（warnings 也作为错误）

  // 性能阈值配置
  performanceThresholds: {
    maxComplexity: 100, // 最大复杂度
    maxDepth: 10, // 最大嵌套深度
    maxLength: 1000, // 最大表达式长度
    maxFunctionCalls: 50, // 最大函数调用数
    maxMemoryUsage: 1024, // 最大内存使用 (KB)
    maxLoops: 100, // 最大循环次数
  },

  // 安全配置
  security: {
    allowedGlobals: ["Math", "Date"], // 允许的全局对象
    bannedKeywords: ["eval", "Function"], // 禁用的关键字
    maxStringLength: 10000, // 最大字符串长度
    allowPrototypeAccess: false, // 禁止原型访问
  },
}
```

### 预设配置模板

```typescript
// 开发环境配置（宽松）
const developmentConfig: ValidationConfig = {
  layers: { syntax: true, semantic: false, security: false, performance: false },
  strict: false,
  maxErrors: -1, // 无限制
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
```

## 📊 验证结果

### 结果结构

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

### 错误代码参考

| 代码                      | 层级        | 描述                |
| ------------------------- | ----------- | ------------------- |
| `SYNTAX_ERROR`            | syntax      | JavaScript 语法错误 |
| `BRACKET_MISMATCH`        | syntax      | 括号不匹配          |
| `QUOTE_MISMATCH`          | syntax      | 引号不匹配          |
| `TEMPLATE_MISMATCH`       | syntax      | 模板标记不匹配      |
| `UNDEFINED_VARIABLE`      | semantic    | 未定义变量          |
| `INVALID_FUNCTION_ARGS`   | semantic    | 函数参数错误        |
| `TYPE_MISMATCH`           | semantic    | 类型不匹配          |
| `DANGEROUS_CODE`          | security    | 危险代码            |
| `PROTOTYPE_POLLUTION`     | security    | 原型污染            |
| `CODE_INJECTION`          | security    | 代码注入            |
| `RESOURCE_LIMIT_EXCEEDED` | performance | 资源限制超出        |
| `COMPLEXITY_TOO_HIGH`     | performance | 复杂度过高          |
| `BUSINESS_RULE_VIOLATION` | business    | 业务规则违反        |

## 🚀 最佳实践

### 1. 渐进式验证

```typescript
// 开发阶段：只启用语法检查
const devValidator = new ValidationManager({
  layers: { syntax: true },
})

// 测试阶段：增加语义和性能检查
const testValidator = new ValidationManager({
  layers: { syntax: true, semantic: true, performance: true },
})

// 生产阶段：启用全部验证
const prodValidator = new ValidationManager({
  layers: { syntax: true, semantic: true, security: true, performance: true },
})
```

### 2. 错误处理策略

```typescript
function handleValidationResult(result: ValidationResult) {
  if (!result.isValid) {
    // 错误处理
    result.errors.forEach((error) => {
      switch (error.layer) {
        case "syntax":
          console.error(`语法错误: ${error.message}`)
          break
        case "security":
          console.error(`安全威胁: ${error.message}`)
          // 立即阻止执行
          throw new Error("Security violation detected")
        case "performance":
          console.warn(`性能问题: ${error.message}`)
          break
      }
    })
  }

  // 警告处理
  if (result.warnings.length > 0) {
    console.group("验证警告:")
    result.warnings.forEach((warning) => {
      console.warn(`${warning.code}: ${warning.message}`)
    })
    console.groupEnd()
  }
}
```

### 3. 自定义验证器开发

```typescript
class EmailValidator extends BaseValidator {
  readonly name = "Email"
  readonly layer = "business" as const

  validate(context: ValidationContext): ValidationResult {
    const errors: ValidationError[] = []
    const template = context.template

    // 检查邮箱格式
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const emails = template.match(emailPattern) || []

    emails.forEach((email) => {
      if (!this.isValidEmail(email)) {
        errors.push(
          this.createError(
            "INVALID_EMAIL_FORMAT",
            `无效的邮箱格式: ${email}`,
            this.findPosition(template, email),
          ),
        )
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}
```

### 4. 性能优化

```typescript
// 缓存验证结果
const validationCache = new Map<string, ValidationResult>()

function validateWithCache(expression: string): ValidationResult {
  if (validationCache.has(expression)) {
    return validationCache.get(expression)!
  }

  const result = validator.validate(expression)
  validationCache.set(expression, result)
  return result
}

// 批量验证
function validateBatch(expressions: string[]): ValidationResult[] {
  return expressions.map((expr) => validateWithCache(expr))
}
```

## 📈 监控和指标

### 验证指标收集

```typescript
interface ValidationMetrics {
  totalValidations: number // 总验证次数
  successRate: number // 成功率
  averageTime: number // 平均验证时间
  errorsByLayer: Record<string, number> // 各层错误统计
  commonErrors: Array<{
    // 常见错误
    code: string
    count: number
    percentage: number
  }>
}

class ValidationMetricsCollector {
  private metrics: ValidationMetrics = {
    totalValidations: 0,
    successRate: 0,
    averageTime: 0,
    errorsByLayer: {},
    commonErrors: [],
  }

  recordValidation(result: ValidationResult, duration: number) {
    this.metrics.totalValidations++

    // 更新成功率
    if (result.isValid) {
      this.metrics.successRate =
        (this.metrics.successRate * (this.metrics.totalValidations - 1) + 1) /
        this.metrics.totalValidations
    }

    // 更新平均时间
    this.metrics.averageTime =
      (this.metrics.averageTime * (this.metrics.totalValidations - 1) + duration) /
      this.metrics.totalValidations

    // 统计错误
    result.errors.forEach((error) => {
      this.metrics.errorsByLayer[error.layer] = (this.metrics.errorsByLayer[error.layer] || 0) + 1
    })
  }

  getMetrics(): ValidationMetrics {
    return { ...this.metrics }
  }
}
```

## 🎓 总结

表达式验证系统提供了：

1. **🛡️ 全面防护**：五层验证体系，覆盖语法、语义、安全、性能、业务各个层面
2. **⚡ 高性能**：智能缓存和优化算法，最小化验证开销
3. **🔧 易扩展**：插件化架构，支持自定义验证器和规则
4. **📊 可监控**：详细的验证结果和性能指标
5. **🎯 易使用**：直观的 API 和丰富的配置选项

通过合理配置和使用验证系统，可以确保表达式引擎在各种环境下的安全性和可靠性，为业务应用提供坚实的基础保障。
