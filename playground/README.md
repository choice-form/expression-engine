# 🚀 Expression Engine Playground

高性能、安全的表达式引擎在线测试平台，基于 Vite + React + CodeMirror 构建。

## ✨ 功能特性

### 🎯 实时表达式测试

- **左侧编辑区**：表达式输入、JSON 数据、自定义变量
- **右侧结果区**：计算结果、验证结果、字符串/AST 输出切换

### 🔧 智能代码编辑

- **自动补全**：输入 `{{` 自动补全 `}}`，光标定位在中间
- **智能提示**：输入 `{{` 显示代码提示，选择后完整插入
- **错误提示**：验证不通过的表达式显示红色，hover 显示错误原因

### 🛡️ 五层验证系统

- **语法验证**：JavaScript 语法检查
- **语义验证**：变量和函数有效性
- **安全验证**：防止代码注入和原型污染
- **性能验证**：防止资源耗尽攻击
- **业务验证**：自定义业务规则

### 🎨 表达式能力展示

- **n8n 兼容**：完全兼容 n8n 工作流表达式语法
- **内置变量**：`$json`、`$vars`、`$node`、`$now` 等
- **内置函数**：`$if`、`$length`、`$split` 等 25+ 函数
- **数学计算**：`Math.*` 函数支持
- **日期处理**：Luxon DateTime 支持
- **JMESPath**：JSON 查询语法

## 🚀 快速开始

### 安装依赖

```bash
# 安装 playground 依赖
pnpm run playground:install

# 或者直接在 playground 目录中
cd playground
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm run playground:dev

# 或者
cd playground
pnpm dev
```

访问 http://localhost:5173 查看 playground

### 构建生产版本

```bash
# 构建 playground
pnpm run playground:build

# 预览构建结果
pnpm run playground:preview
```

## 📖 使用指南

### 1. 基础表达式测试

在表达式输入框输入：

```javascript
{{ $json.name }} 在 {{ $json.city }} 工作
```

在 JSON 数据输入框输入：

```json
{
  "name": "张三",
  "age": 30,
  "city": "北京"
}
```

点击右侧查看结果：`张三 在 北京 工作`

### 2. 数学计算

```javascript
{
  {
    Math.round($json.age / 10) * 10
  }
}
```

结果：`30`（年龄按 10 取整）

### 3. 条件判断

```javascript
{
  {
    $json.age >= 18 ? "成年人" : "未成年"
  }
}
```

结果：`成年人`

### 4. 日期处理

```javascript
{
  {
    $now.toFormat("yyyy-MM-dd HH:mm:ss")
  }
}
```

结果：当前时间的格式化字符串

### 5. 数组操作

JSON 数据：

```json
{
  "items": [1, 2, 3, 4, 5],
  "tags": ["JavaScript", "TypeScript", "React"]
}
```

表达式：

```javascript
{{ $json.items.length }} 个数字，{{ $json.tags.join(", ") }}
```

结果：`5 个数字，JavaScript, TypeScript, React`

### 6. JMESPath 查询

JSON 数据：

```json
{
  "users": [
    { "name": "Alice", "age": 30, "city": "Beijing" },
    { "name": "Bob", "age": 25, "city": "Shanghai" }
  ]
}
```

表达式：

```javascript
{{ $json.users[?age > `28`].name }}
```

结果：`["Alice"]`

## 🎯 高级功能

### AST 输出模式

切换到 "AST 输出" 可以查看表达式的抽象语法树结构：

```javascript
{
  {
    $json.user.name
  }
}
```

AST 输出：

```json
{
  "type": "Template",
  "dependencies": ["$json"],
  "complexity": 4,
  "parts": [
    {
      "type": "Expression",
      "value": "..."
    }
  ]
}
```

### 验证结果分析

右侧验证面板显示详细的验证信息：

- ✅ **验证通过**：表达式安全有效
- ❌ **语法错误**：JavaScript 语法问题
- ⚠️ **安全警告**：潜在的安全风险
- 📊 **性能信息**：复杂度和执行时间

### 自动补全功能

1. 输入 `{{` 自动补全为 `{{ }}`
2. 输入 `$` 显示所有变量提示
3. 输入 `Math.` 显示数学函数
4. 输入 `DateTime.` 显示日期函数
5. 选择函数自动插入括号并定位光标

## 🛠️ 技术栈

- **前端框架**：React 18
- **构建工具**：Vite 5
- **编辑器**：CodeMirror 6
- **语言**：TypeScript
- **表达式引擎**：@choiceform/expression-engine

## 📝 项目结构

```
playground/
├── src/
│   ├── components/
│   │   ├── expression-playground.tsx    # 主组件
│   │   ├── expression-editor.tsx        # 表达式编辑器
│   │   ├── json-editor.tsx             # JSON 编辑器
│   │   ├── vars-editor.tsx             # 变量编辑器
│   │   ├── result-panel.tsx            # 结果面板
│   │   └── validation-panel.tsx        # 验证面板
│   ├── hooks/
│   │   └── use-expression-editor.tsx   # 编辑器 hooks
│   ├── App.tsx                         # 应用入口
│   └── main.tsx                        # React 入口
├── package.json                        # 依赖配置
├── vite.config.ts                      # Vite 配置
├── tsconfig.json                       # TypeScript 配置
└── index.html                          # HTML 模板
```

## 🔧 开发说明

### 组件命名规范

遵循公司规定：组件名全部使用小写 + 破折号命名

- `expression-playground.tsx`
- `expression-editor.tsx`
- `result-panel.tsx`

### 样式设计

采用简洁的内联样式，无需样式系统：

- 简单的 CSS 实现
- 响应式网格布局
- 清晰的视觉层次

### API 集成

- 使用 `engine.getCompletions()` 获取自动补全
- 使用 `createDefaultValidationEngine()` 进行验证
- 充分展示表达式引擎的所有能力

## 🚫 注意事项

**playground 不会包含在发布包中**：

- `package.json` 的 `files` 字段只包含 `["dist", "src", "README.md"]`
- `.gitignore` 已配置忽略 `playground/dist/` 等构建产物
- playground 是独立的开发和演示工具

## 📞 问题反馈

如有问题或建议，请在项目仓库提交 Issue。
