# 表达式入门指南

欢迎来到表达式的世界！这个指南将在5分钟内让你掌握表达式的基础知识，让你的workflow变得更加智能和强大。

## 🤔 什么是表达式？

表达式是一种特殊的代码片段，可以让你在workflow中进行动态的数据处理、计算和逻辑判断。

### 简单来说

- **静态文本**: `Hello World` - 总是输出 "Hello World"
- **表达式**: `Hello {{ $json.name }}` - 根据数据动态输出，比如 "Hello Alice"

### 表达式的力量

```
输入数据: { "name": "张三", "age": 25, "city": "北京" }

静态文本: "用户信息"
表达式: "用户 {{ $json.name }} 今年 {{ $json.age }} 岁，来自 {{ $json.city }}"
输出: "用户 张三 今年 25 岁，来自 北京"
```

## 🎯 表达式的基本结构

### 双花括号语法

表达式必须包含在双花括号 `{{ }}` 中：

```javascript
{
  {
    表达式内容
  }
}
```

### 三种基本类型

#### 1. 🔢 数值计算

```javascript
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
{
  {
    $json.quantity * $json.unitPrice
  }
} // 计算总价
```

#### 2. 📝 文本处理

```javascript
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
{
  {
    $json.description.length
  }
} // 获取文本长度
```

#### 3. 🧠 逻辑判断

```javascript
{
  {
    $json.age >= 18
  }
} // 输出: true 或 false
{
  {
    $json.status === "active"
  }
} // 判断状态
{
  {
    $json.score > 60 ? "及格" : "不及格"
  }
} // 条件表达式
```

## 🗂 认识内置变量

在workflow中，你可以访问这些预定义的变量：

### 📋 `$json` - 当前节点的数据

```javascript
// 假设当前数据是: { "user": { "name": "李四", "email": "lisi@example.com" } }

{
  {
    $json.user.name
  }
} // 输出: "李四"
{
  {
    $json.user.email
  }
} // 输出: "lisi@example.com"
```

### 🔧 `$vars` - 工作流变量

```javascript
// 在workflow中设置的变量

{
  {
    $vars.apiKey
  }
} // 获取API密钥
{
  {
    $vars.baseUrl
  }
} // 获取基础URL
{
  {
    $vars.retryCount
  }
} // 获取重试次数
```

### 📄 `$node` - 节点信息

```javascript
{
  {
    $node.name
  }
} // 当前节点名称
{
  {
    $node.type
  }
} // 节点类型
```

### ⏰ `$now` - 当前时间

```javascript
{
  {
    $now.toFormat("yyyy-MM-dd")
  }
} // 输出: "2024-01-15"
{
  {
    $now.toFormat("HH:mm:ss")
  }
} // 输出: "14:30:25"
{
  {
    $now.weekday
  }
} // 输出: 1-7 (周一到周日)
```

## 🌟 第一个实用表达式

让我们创建一个实际的例子：

### 场景：用户注册欢迎邮件

**输入数据:**

```json
{
  "user": {
    "name": "王小明",
    "email": "wangxiaoming@example.com",
    "registrationDate": "2024-01-15T10:30:00Z"
  }
}
```

**表达式:**

```javascript
亲爱的 {{ $json.user.name }}，

欢迎加入我们！您的账户 {{ $json.user.email }} 已于 {{ $now.toFormat("yyyy年MM月dd日") }} 成功注册。

感谢您的信任！
```

**输出:**

```
亲爱的 王小明，

欢迎加入我们！您的账户 wangxiaoming@example.com 已于 2024年01月15日 成功注册。

感谢您的信任！
```

## 🎮 动手练习

试试这些练习：

### 练习1：基础计算

**数据**: `{ "items": [{"price": 100}, {"price": 200}, {"price": 50}] }`

**目标**: 计算商品总价

<details>
<summary>💡 点击查看答案</summary>

```javascript
{
  {
    $json.items[0].price + $json.items[1].price + $json.items[2].price
  }
}
// 或者使用更简洁的方式（后面会学到）:
{
  {
    $json.items.reduce((sum, item) => sum + item.price, 0)
  }
}
```

</details>

### 练习2：条件判断

**数据**: `{ "user": { "age": 25, "membership": "premium" } }`

**目标**: 判断用户是否可以享受高级功能（年龄>=18且是premium会员）

<details>
<summary>💡 点击查看答案</summary>

```javascript
{
  {
    $json.user.age >= 18 && $json.user.membership === "premium"
  }
}
// 输出: true
```

</details>

### 练习3：文本处理

**数据**: `{ "user": { "firstName": "小明", "lastName": "王" } }`

**目标**: 生成完整姓名

<details>
<summary>💡 点击查看答案</summary>

```javascript
{
  {
    $json.user.lastName + $json.user.firstName
  }
}
// 输出: "王小明"
```

</details>

## 🚀 常见使用场景

### 📧 邮件内容生成

```javascript
主题: {{ $json.orderType === "urgent" ? "【紧急】" : "" }}订单 #{{ $json.orderId }} 已确认

您好 {{ $json.customer.name }}，
您的订单总金额为 ¥{{ $json.totalAmount }}，预计 {{ $json.estimatedDelivery }} 送达。
```

### 🔗 API请求URL构建

```javascript
{{ $vars.baseUrl }}/api/users/{{ $json.userId }}/orders?status={{ $json.filterStatus }}
```

### 📊 数据验证

```javascript
{
  {
    $json.email.includes("@") && $json.email.includes(".")
  }
} // 简单邮箱验证
{
  {
    $json.phone.length === 11
  }
} // 手机号长度验证
{
  {
    $json.age >= 0 && $json.age <= 120
  }
} // 年龄范围验证
```

### 🏷 标签生成

```javascript
{
  {
    $json.score >= 90 ? "优秀" : $json.score >= 60 ? "合格" : "需改进"
  }
}
```

## ⚠️ 初学者常见错误

### 1. 忘记双花括号

```javascript
❌ $json.name           // 这会被当作普通文本
✅ {{ $json.name }}     // 正确的表达式
```

### 2. 访问不存在的属性

```javascript
❌ {{ $json.user.nonExistentField }}  // 可能报错
✅ {{ $json.user.nonExistentField ?? "默认值" }}  // 安全访问
```

### 3. 字符串拼接错误

```javascript
❌ {{ "Hello " $json.name }}           // 语法错误
✅ {{ "Hello " + $json.name }}         // 正确拼接
```

### 4. 数据类型混淆

```javascript
❌ {{ $json.stringNumber + 1 }}        // "10" + 1 = "101" (字符串拼接)
✅ {{ Number($json.stringNumber) + 1 }} // Number("10") + 1 = 11 (数值计算)
```

## 🎯 下一步学习

掌握了基础知识后，建议按以下顺序继续学习：

1. **[基础语法](./syntax-basics.md)** - 学习更详细的语法规则
2. **[常用示例](./common-examples.md)** - 看更多实用案例
3. **[变量使用指南](./variables-guide.md)** - 深入了解所有内置变量
4. **[函数库参考](./functions-reference.md)** - 掌握强大的内置函数

## 💡 小贴士

- **实时预览**: workflow编辑器中可以实时看到表达式结果
- **错误提示**: 如果表达式有错误，编辑器会显示详细的错误信息
- **自动补全**: 输入 `$` 会自动提示可用的变量和函数
- **调试技巧**: 使用 `{{ JSON.stringify($json) }}` 查看完整数据结构

---

🎉 **恭喜！你已经掌握了表达式的基础知识！** 现在你可以在workflow中创建动态、智能的数据处理逻辑了。
