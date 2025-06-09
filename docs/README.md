# 表达式引擎使用指南

欢迎来到表达式引擎使用指南！这里提供了完整的文档帮助你快速掌握在workflow中使用表达式的技巧。

## 📚 文档导航

### 🎯 快速开始

- [**入门指南**](./getting-started.md) - 5分钟上手表达式基础
- [**基础语法**](./syntax-basics.md) - 表达式语法入门
- [**常用示例**](./common-examples.md) - 最实用的表达式示例

### 📖 深入学习

- [**变量使用指南**](./variables-guide.md) - 掌握所有内置变量
- [**函数库参考**](./functions-reference.md) - 完整的内置函数说明
- [**数据处理技巧**](./data-processing.md) - 数据转换和处理方法

### 🌳 高级功能

- [**AST输出功能指南**](./ast-guide.md) - 语法树输出与静态分析
- [**AST设计文档**](./AST-OUTPUT-DESIGN.md) - 技术设计与架构说明
- [**🛡️ 表达式验证系统**](./validation-guide.md) - 五层验证体系与安全防护
- [**🚀 验证系统快速参考**](./validation-quick-reference.md) - 验证功能速查指南

### 🎨 实战应用

- [**业务场景案例**](./business-cases.md) - 真实业务场景的表达式解决方案
- [**高级技巧**](./advanced-techniques.md) - 复杂表达式和性能优化
- [**最佳实践**](./best-practices.md) - 编写高质量表达式的建议

### 🛠 问题解决

- [**常见问题FAQ**](./FAQ.md) - 快速解决常见问题
- [**错误处理指南**](./error-handling.md) - 理解和修复表达式错误
- [**调试技巧**](./debugging-tips.md) - 高效调试表达式的方法

## 🚀 快速查找

### 我想要...

| 需求                   | 推荐文档                                            | 示例                                           |
| ---------------------- | --------------------------------------------------- | ---------------------------------------------- |
| 获取JSON数据的某个字段 | [变量使用指南](./variables-guide.md#json-变量)      | `{{ $json.user.name }}`                        |
| 条件判断和分支处理     | [函数库参考](./functions-reference.md#条件函数)     | `{{ $if($json.age >= 18, "成年", "未成年") }}` |
| 格式化日期时间         | [函数库参考](./functions-reference.md#日期时间函数) | `{{ $now.toFormat("yyyy-MM-dd") }}`            |
| 处理数组数据           | [数据处理技巧](./data-processing.md#数组处理)       | `{{ $json.items.length }}`                     |
| 字符串操作             | [函数库参考](./functions-reference.md#字符串函数)   | `{{ $json.name.toUpperCase() }}`               |
| 数学计算               | [基础语法](./syntax-basics.md#数学运算)             | `{{ $json.price * 1.1 }}`                      |
| 复杂数据查询           | [高级技巧](./advanced-techniques.md#jmespath-查询)  | `{{ $json.users[?age > 25].name }}`            |
| 错误处理               | [错误处理指南](./error-handling.md)                 | `{{ $json.data ?? "默认值" }}`                 |
| AST分析和代码生成      | [AST输出功能指南](./ast-guide.md)                   | `engine.generateAST(template)`                 |
| 🛡️ 表达式安全验证      | [验证系统快速参考](./validation-quick-reference.md) | `validator.validate(expression)`               |
| 🚨 检测危险代码        | [表达式验证系统](./validation-guide.md#安全层验证)  | 自动检测eval、原型污染等威胁                   |

### 按功能分类

#### 🔢 数据操作

- **数字计算**: [基础语法 > 数学运算](./syntax-basics.md#数学运算)
- **字符串处理**: [函数库参考 > 字符串函数](./functions-reference.md#字符串函数)
- **数组操作**: [数据处理技巧 > 数组处理](./data-processing.md#数组处理)
- **对象访问**: [变量使用指南 > 数据访问](./variables-guide.md#数据访问)

#### 🧠 逻辑控制

- **条件判断**: [函数库参考 > 条件函数](./functions-reference.md#条件函数)
- **循环遍历**: [高级技巧 > 循环处理](./advanced-techniques.md#循环处理)
- **错误处理**: [错误处理指南](./error-handling.md)

#### ⏰ 时间日期

- **当前时间**: [变量使用指南 > 时间变量](./variables-guide.md#时间变量)
- **日期格式化**: [函数库参考 > 日期时间函数](./functions-reference.md#日期时间函数)
- **日期计算**: [数据处理技巧 > 时间处理](./data-processing.md#时间处理)

#### 🔍 数据查询

- **简单筛选**: [基础语法 > 条件表达式](./syntax-basics.md#条件表达式)
- **复杂查询**: [高级技巧 > JMESPath查询](./advanced-techniques.md#jmespath-查询)
- **数据聚合**: [数据处理技巧 > 数据聚合](./data-processing.md#数据聚合)

#### 🛡️ 安全验证

- **语法验证**: [验证系统快速参考 > 语法层验证](./validation-quick-reference.md#语法层错误)
- **安全检查**: [表达式验证系统 > 安全层验证](./validation-guide.md#安全层验证)
- **性能监控**: [表达式验证系统 > 性能层验证](./validation-guide.md#性能层验证)
- **自定义验证**: [表达式验证系统 > 自定义验证器](./validation-guide.md#自定义验证器)

## 💡 学习路径推荐

### 🌟 新手路径 (1-2小时)

1. [入门指南](./getting-started.md) - 了解什么是表达式
2. [基础语法](./syntax-basics.md) - 学习基本语法规则
3. [常用示例](./common-examples.md) - 练习常见场景

### 🚀 进阶路径 (3-4小时)

1. [变量使用指南](./variables-guide.md) - 掌握所有内置变量
2. [函数库参考](./functions-reference.md) - 学习内置函数
3. [数据处理技巧](./data-processing.md) - 提升数据处理能力

### 🎯 专家路径 (5-6小时)

1. [业务场景案例](./business-cases.md) - 学习实际应用
2. [高级技巧](./advanced-techniques.md) - 掌握高级功能
3. [最佳实践](./best-practices.md) - 编写高质量代码

## 🔧 实用工具

### 表达式测试器

在workflow编辑器中，你可以：

- 实时预览表达式结果
- 查看详细的错误信息
- 使用自动补全功能

### 调试技巧

- 使用 `{{ JSON.stringify($json) }}` 查看完整数据结构
- 分步骤测试复杂表达式
- 查看执行日志中的详细错误信息

## 📞 获取帮助

遇到问题了？试试这些方法：

1. **查看FAQ**: [常见问题FAQ](./FAQ.md)
2. **检查语法**: [错误处理指南](./error-handling.md)
3. **学习案例**: [业务场景案例](./business-cases.md)
4. **提交反馈**: [GitHub Issues](https://github.com/automation/expression-engine/issues)

---

**提示**: 建议收藏本页面，方便随时查找需要的文档！
