# 🛡️ 验证系统快速参考

## 📋 快速开始

```typescript
import { ValidationManager } from "@choiceform/expression-engine"

// 1. 创建验证器
const validator = new ValidationManager()

// 2. 验证表达式
const result = validator.validate("{{ $json.name.toUpperCase() }}")

// 3. 检查结果
if (result.isValid) {
  console.log("✅ 验证通过")
} else {
  console.log("❌ 发现错误:", result.errors)
}
```

## 🏗️ 五层验证体系

| 层级          | 功能           | 检查内容                       |
| ------------- | -------------- | ------------------------------ |
| **🔤 语法层** | JavaScript语法 | 括号匹配、引号匹配、语法正确性 |
| **🧠 语义层** | 逻辑正确性     | 变量存在、函数参数、类型兼容   |
| **🔒 安全层** | 安全防护       | 危险代码、原型污染、代码注入   |
| **⚡ 性能层** | 性能监控       | 复杂度、嵌套深度、资源限制     |
| **🎯 业务层** | 业务规则       | 自定义业务逻辑、数据格式       |

## ⚙️ 常用配置

### 开发环境（宽松）

```typescript
const devConfig = {
  layers: { syntax: true },
  strict: false,
  maxErrors: -1,
}
```

### 生产环境（标准）

```typescript
const prodConfig = {
  layers: { syntax: true, semantic: true, security: true, performance: true },
  strict: true,
  maxErrors: 5,
}
```

### 高安全环境（严格）

```typescript
const secureConfig = {
  layers: { syntax: true, semantic: true, security: true, performance: true, business: true },
  strict: true,
  maxErrors: 1,
  performanceThresholds: {
    maxComplexity: 30,
    maxDepth: 3,
    maxLength: 200,
  },
}
```

## 🚨 常见错误代码

### 语法层错误

| 代码                | 描述               | 示例              |
| ------------------- | ------------------ | ----------------- |
| `SYNTAX_ERROR`      | JavaScript语法错误 | `{{ (1 + 2 }}`    |
| `BRACKET_MISMATCH`  | 括号不匹配         | `{{ [1, 2, 3 }}`  |
| `QUOTE_MISMATCH`    | 引号不匹配         | `{{ "hello }}`    |
| `TEMPLATE_MISMATCH` | 模板标记不匹配     | `{{ $json.name }` |

### 安全层错误

| 代码                  | 描述     | 示例                    |
| --------------------- | -------- | ----------------------- |
| `DANGEROUS_CODE`      | 危险代码 | `{{ eval("code") }}`    |
| `PROTOTYPE_POLLUTION` | 原型污染 | `{{ __proto__.x = 1 }}` |
| `CODE_INJECTION`      | 代码注入 | `{{ "<script>" }}`      |

### 性能层错误

| 代码                      | 描述       | 示例                |
| ------------------------- | ---------- | ------------------- |
| `RESOURCE_LIMIT_EXCEEDED` | 资源超限   | 表达式过长/嵌套过深 |
| `COMPLEXITY_TOO_HIGH`     | 复杂度过高 | 复杂计算表达式      |

## ✅ 安全表达式示例

```typescript
// ✅ 数学运算
"{{ 1 + 2 * 3 }}"
"{{ Math.max(1, 2, 3) }}"

// ✅ 字符串操作
"{{ $json.name.toUpperCase() }}"
'{{ "hello world".split(" ") }}'

// ✅ 条件判断
'{{ $json.age >= 18 ? "成年" : "未成年" }}'

// ✅ 数组操作
"{{ $json.items.length }}"
"{{ $json.items[0] }}"

// ✅ 日期时间
'{{ $now.toFormat("yyyy-MM-dd") }}'
"{{ $today.weekday }}"
```

## ❌ 危险表达式示例

```typescript
// 🚨 高危险 - 会被阻止
'{{ eval("malicious code") }}' // eval函数
'{{ Function("return process.env") }}' // Function构造器
"{{ __proto__.constructor }}" // 原型污染

// ⚠️ 中危险 - 产生警告
"{{ setTimeout(code, 1000) }}" // 定时器
"{{ window.location.href }}" // 浏览器对象
"{{ document.cookie }}" // DOM操作

// ⚠️ 低危险 - 产生提示
"{{ counter++ }}" // 自增操作
"{{ delete $json.prop }}" // delete操作
```

## 🛠️ 自定义验证器

```typescript
import { BaseValidator } from "@choiceform/expression-engine"

class EmailValidator extends BaseValidator {
  readonly name = "Email"
  readonly layer = "business" as const

  validate(context: ValidationContext): ValidationResult {
    const errors: ValidationError[] = []
    const template = context.template

    // 检查邮箱格式
    if (template.includes("email") && !template.includes("@")) {
      errors.push(this.createError("INVALID_EMAIL_FORMAT", "邮箱格式无效"))
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    }
  }
}

// 注册验证器
validator.addValidator(new EmailValidator())
```

## 📊 验证结果处理

```typescript
function handleValidation(result: ValidationResult) {
  // 处理错误
  if (!result.isValid) {
    result.errors.forEach((error) => {
      switch (error.layer) {
        case "syntax":
          console.error(`语法错误: ${error.message}`)
          break
        case "security":
          console.error(`安全威胁: ${error.message}`)
          throw new Error("Security violation")
        case "performance":
          console.warn(`性能问题: ${error.message}`)
          break
      }
    })
  }

  // 处理警告
  result.warnings.forEach((warning) => {
    console.warn(`⚠️ ${warning.layer}: ${warning.message}`)
  })

  // 显示统计
  console.log(`验证耗时: ${result.metadata.executionTime}ms`)
  console.log(`检查层级: ${result.metadata.layers.join(", ")}`)
}
```

## 🎯 最佳实践

### 1. 分阶段验证

```typescript
// 开发阶段：只检查语法
const devResult = validator.validate(expr, { layers: { syntax: true } })

// 测试阶段：增加语义和性能
const testResult = validator.validate(expr, {
  layers: { syntax: true, semantic: true, performance: true },
})

// 生产阶段：启用全部验证
const prodResult = validator.validate(expr, {
  layers: { syntax: true, semantic: true, security: true, performance: true },
})
```

### 2. 缓存验证结果

```typescript
const cache = new Map<string, ValidationResult>()

function validateWithCache(expression: string): ValidationResult {
  if (cache.has(expression)) {
    return cache.get(expression)!
  }

  const result = validator.validate(expression)
  cache.set(expression, result)
  return result
}
```

### 3. 批量验证

```typescript
function validateBatch(expressions: string[]): ValidationResult[] {
  return expressions.map((expr) => validator.validate(expr))
}

const results = validateBatch([
  "{{ $json.name }}",
  "{{ $json.age >= 18 }}",
  "{{ $json.items.length }}",
])
```

### 4. 错误统计

```typescript
function analyzeValidationResults(results: ValidationResult[]) {
  const stats = {
    total: results.length,
    valid: results.filter((r) => r.isValid).length,
    errors: results.reduce((sum, r) => sum + r.errors.length, 0),
    warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
  }

  console.log(`验证统计: ${stats.valid}/${stats.total} 通过`)
  console.log(`错误: ${stats.errors}, 警告: ${stats.warnings}`)
}
```

## 🔗 相关链接

- [完整验证指南](./validation-guide.md)
- [安全最佳实践](./security-guide.md)
- [自定义验证器开发](./custom-validators.md)
- [性能优化指南](./performance-guide.md)
