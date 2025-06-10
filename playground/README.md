# Expression Engine Playground

🚀 一个交互式的表达式引擎测试平台，基于 [@choiceform/expression-engine](https://www.npmjs.com/package/@choiceform/expression-engine) 构建。

## ✨ 功能特性

- 🎮 **交互式 Playground** - 实时测试和验证表达式
- 📚 **完整文档中心** - 内置详细的使用指南和API参考
- 🎨 **智能代码补全** - 基于AST的上下文感知自动补全
- 🛡️ **实时验证** - 五层验证体系，确保表达式安全性
- 🌙 **主题切换** - 支持浅色/深色主题
- 📱 **响应式设计** - 支持各种设备尺寸

## 🌐 在线体验

访问 **[Expression Engine Playground](https://your-username.github.io/expression-engine-playground/)** 立即开始使用！

## 🏗️ 本地开发

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 📦 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: @choiceform/design-system
- **代码编辑器**: CodeMirror 6
- **文档渲染**: React Markdown
- **样式**: Tailwind CSS
- **表达式引擎**: @choiceform/expression-engine

## 🚀 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 main 分支
2. GitHub Actions 自动构建和部署
3. 访问 GitHub Pages 链接查看结果

### 手动部署

```bash
pnpm deploy
```

## 📖 使用指南

### 基础表达式

```javascript
// 数学计算
{
  {
    1 + 1
  }
} // 输出: 2
{
  {
    $json.price * 0.9
  }
} // 打9折

// 字符串操作
{
  {
    "Hello " + $json.name
  }
} // 字符串拼接
{
  {
    $json.message.toUpperCase()
  }
} // 转大写

// 条件判断
{
  {
    $json.age >= 18 ? "成年" : "未成年"
  }
}

// 日期时间
{
  {
    $now.toFormat("yyyy-MM-dd")
  }
} // 格式化日期
```

### 内置变量

- `$json` - 当前数据上下文
- `$now` - 当前时间 (Luxon DateTime)
- `$vars` - 工作流变量
- `$node` - 节点信息

### 内置函数

- `$if(condition, trueValue, falseValue)` - 条件函数
- `$length(array)` - 获取数组长度
- `Math.*` - 数学函数库
- `String.*` - 字符串处理函数

## 🔗 相关链接

- [npm包地址](https://www.npmjs.com/package/@choiceform/expression-engine)
- [GitHub仓库](https://github.com/choice-form/expression-engine)
- [完整文档](https://your-username.github.io/expression-engine-playground/documentation)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
# Deployment Test
# Lockfile Fix Test Tue Jun 10 14:19:25 CST 2025
# Workflow Fix Test Tue Jun 10 14:20:51 CST 2025
# Pages Configuration Test Tue Jun 10 14:21:52 CST 2025
