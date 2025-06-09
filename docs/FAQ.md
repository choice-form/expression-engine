# 常见问题FAQ

本文档收集了用户在使用表达式时最常遇到的问题和解决方案。如果你的问题没有在这里找到答案，请查看其他文档或提交issue。

## 🔍 快速查找

| 问题类型 | 跳转链接                         |
| -------- | -------------------------------- |
| 语法错误 | [语法问题](#📝-语法问题)         |
| 数据访问 | [数据访问问题](#🗂-数据访问问题) |
| 函数使用 | [函数相关问题](#🔧-函数相关问题) |
| 性能优化 | [性能问题](#⚡-性能问题)         |
| 调试技巧 | [调试相关](#🐛-调试相关)         |

## 📝 语法问题

### Q: 为什么我的表达式显示为纯文本而不是执行结果？

**A: 最常见的原因是忘记添加双花括号**

```javascript
❌ $json.name                    // 这会显示为纯文本
✅ {{ $json.name }}              // 正确的表达式语法
```

**其他可能原因：**

- 花括号数量不对：`{ $json.name }` 或 `{{{ $json.name }}}`
- 使用了中文花括号：`｛｛ $json.name ｝｝`
- 花括号前后有其他字符：`{{$json.name}}`应该是`{{ $json.name }}`

### Q: 表达式中可以使用注释吗？

**A: 不支持，但有替代方案**

```javascript
❌ {{ $json.name /* 这是注释 */ }}   // 不支持注释
✅ // 在节点描述中添加说明，然后使用:
   {{ $json.name }}
```

**建议：**

- 在workflow节点的描述字段中添加表达式说明
- 使用有意义的变量名：`{{ $vars.user_max_login_attempts }}`而不是`{{ $vars.max }}`

### Q: 可以在表达式中换行吗？

**A: 支持，但需要注意格式**

```javascript
✅ {{ $json.user.name +
      " - " +
      $json.user.email }}

✅ {{ $if($json.age >= 18,
          "成年人",
          "未成年人") }}
```

**注意：**

- 确保逻辑完整，不要在操作符中间换行
- 保持缩进一致，提高可读性

### Q: 字符串中如何包含双引号？

**A: 使用转义字符或不同的引号**

```javascript
✅ {{ "他说：\"你好\"" }}           // 使用转义字符
✅ {{ '他说："你好"' }}             // 使用单引号包含双引号
✅ {{ `他说："你好"` }}             // 使用模板字符串
```

## 🗂 数据访问问题

### Q: 如何安全访问可能不存在的属性？

**A: 使用可选链操作符和默认值**

```javascript
❌ {{ $json.user.profile.avatar }}  // 如果user或profile不存在会报错

✅ {{ $json.user?.profile?.avatar ?? "默认头像.jpg" }}
✅ {{ $json.user && $json.user.profile && $json.user.profile.avatar || "默认头像.jpg" }}
```

### Q: 数组为空时如何避免错误？

**A: 先检查数组长度**

```javascript
❌ {{ $json.items[0].name }}        // 数组为空时会报错

✅ {{ $json.items?.length > 0 ? $json.items[0].name : "无数据" }}
✅ {{ $json.items?.[0]?.name ?? "无数据" }}
```

### Q: 如何动态访问对象属性？

**A: 使用方括号语法**

```javascript
✅ {{ $json[$vars.fieldName] }}     // 动态属性名
✅ {{ $json.user[$vars.property] }} // 动态访问用户属性
✅ {{ $json[$json.type + "_config"] }}  // 根据类型访问配置
```

### Q: 为什么我无法访问某些数据？

**A: 检查数据结构和作用域**

```javascript
// 1. 首先查看完整数据结构
{
  {
    JSON.stringify($json, null, 2)
  }
}

// 2. 检查数据类型
{
  {
    typeof $json.field
  }
}
{
  {
    Array.isArray($json.items)
  }
}

// 3. 确认属性存在
{
  {
    Object.keys($json)
  }
}
```

## 🔧 函数相关问题

### Q: 内置函数和JavaScript原生方法有什么区别？

**A: 内置函数经过特殊优化，推荐优先使用**

```javascript
✅ {{ $length($json.message) }}     // 内置函数，更安全
✅ {{ $json.message.length }}       // JavaScript方法，也可用

✅ {{ $split($json.tags, ",") }}    // 内置函数
✅ {{ $json.tags.split(",") }}      // JavaScript方法
```

**内置函数的优势：**

- 自动处理null/undefined情况
- 统一的错误处理
- 更好的性能优化

### Q: 如何在表达式中定义自己的函数？

**A: 不能定义函数，但可以使用立即执行函数**

```javascript
❌ {{ function add(a, b) { return a + b } }}  // 不支持函数定义

✅ {{ ((a, b) => a + b)(1, 2) }}             // 立即执行的箭头函数
✅ {{ (() => {
  const userData = $json.user;
  return userData ? `${userData.name} - ${userData.email}` : "未知用户";
})() }}
```

### Q: 函数参数类型错误怎么办？

**A: 添加类型检查和转换**

```javascript
❌ {{ $length($json.maybeArray) }}   // 如果不是数组会报错

✅ {{ Array.isArray($json.maybeArray) ? $length($json.maybeArray) : 0 }}
✅ {{ $length($json.maybeArray || []) }}
✅ {{ typeof $json.text === 'string' ? $split($json.text, ",") : [] }}
```

### Q: 如何处理日期时间函数的时区问题？

**A: 使用Luxon的时区处理功能**

```javascript
// 获取特定时区的时间
{
  {
    $now.setZone("Asia/Shanghai").toFormat("yyyy-MM-dd HH:mm:ss")
  }
}

// 转换时区
{
  {
    $json.utcTime.setZone("Asia/Shanghai")
  }
}

// 检查是否为有效日期
{
  {
    DateTime.isDateTime($json.timestamp)
  }
}
```

## ⚡ 性能问题

### Q: 复杂表达式执行很慢怎么办？

**A: 优化表达式结构和避免重复计算**

```javascript
❌ // 重复计算，性能差
{{ $json.items.filter(item => item.active).length > 0 ?
   $json.items.filter(item => item.active)[0].name : "无数据" }}

✅ // 优化版本，避免重复计算
{{ (() => {
  const activeItems = $json.items.filter(item => item.active);
  return activeItems.length > 0 ? activeItems[0].name : "无数据";
})() }}
```

### Q: 大数组处理导致超时怎么办？

**A: 使用分页或限制处理数量**

```javascript
❌ {{ $json.largeArray.map(item => heavyProcessing(item)) }}  // 可能超时

✅ {{ $json.largeArray.slice(0, 100).map(item => heavyProcessing(item)) }}  // 限制数量
✅ {{ $json.largeArray.filter(item => item.important).map(item => process(item)) }}  // 先过滤
```

### Q: 如何缓存复杂计算结果？

**A: 使用工作流变量存储计算结果**

```javascript
// 在第一个节点中计算并存储到$vars
{
  {
    $vars.expensiveResult = complexCalculation($json.data)
  }
}

// 在后续节点中直接使用
{
  {
    $vars.expensiveResult
  }
}
```

## 🐛 调试相关

### Q: 表达式出错了，如何定位问题？

**A: 分步调试和查看错误信息**

```javascript
// 1. 查看完整数据结构
{
  {
    JSON.stringify($json, null, 2)
  }
}

// 2. 分步测试复杂表达式
{
  {
    $json.user
  }
} // 先测试第一层
{
  {
    $json.user.profile
  }
} // 再测试第二层
{
  {
    $json.user.profile.settings
  }
} // 最后测试目标

// 3. 添加类型检查
{
  {
    typeof $json.field
  }
}
{
  {
    $json.field === null ? "null" : "not null"
  }
}
```

### Q: 如何在生产环境中调试表达式？

**A: 使用安全的调试方法**

```javascript
// 添加调试输出（生产环境移除）
{
  {
    $if($vars.debug, JSON.stringify({ input: $json, result: $json.processed }), $json.processed)
  }
}

// 使用错误处理
{
  {
    ;(() => {
      try {
        return complexExpression($json)
      } catch (error) {
        return { error: error.message, input: $json }
      }
    })()
  }
}
```

### Q: 表达式结果和预期不符怎么办？

**A: 检查数据类型和逻辑**

```javascript
// 检查数据类型
{
  {
    typeof $json.value
  }
} // 确认数据类型
{
  {
    $json.value === "123"
  }
} // 字符串比较
{
  {
    $json.value === 123
  }
} // 数字比较

// 检查逻辑运算符
{
  {
    $json.value || "default"
  }
} // 如果value为0、false、""，会使用default
{
  {
    $json.value ?? "default"
  }
} // 只有value为null、undefined才使用default

// 检查数组/对象操作
{
  {
    Array.isArray($json.items)
  }
}
{
  {
    Object.keys($json.object)
  }
}
```

## 📊 数据类型问题

### Q: 字符串数字如何转换为数字类型？

**A: 使用类型转换函数**

```javascript
✅ {{ Number($json.stringNumber) }}     // 转换为数字
✅ {{ +$json.stringNumber }}            // 一元加号转换
✅ {{ $json.stringNumber * 1 }}         // 乘法转换
✅ {{ parseInt($json.stringNumber) }}   // 转换为整数
✅ {{ parseFloat($json.stringNumber) }} // 转换为浮点数

// 安全转换（失败时返回默认值）
✅ {{ Number($json.stringNumber) || 0 }}
✅ {{ isNaN(Number($json.stringNumber)) ? 0 : Number($json.stringNumber) }}
```

### Q: 如何检查变量是否为空？

**A: 根据"空"的定义选择合适的方法**

```javascript
// 检查 null 或 undefined
{
  {
    $json.value == null
  }
} // null 或 undefined
{
  {
    $json.value === null
  }
} // 严格检查 null
{
  {
    $json.value === undefined
  }
} // 严格检查 undefined

// 检查"假值"（false, 0, "", null, undefined, NaN）
{
  {
    !$json.value
  }
}

// 检查空字符串
{
  {
    $json.value === ""
  }
}
{
  {
    $json.value.length === 0
  }
}

// 检查空数组
{
  {
    $json.array.length === 0
  }
}
{
  {
    Array.isArray($json.array) && $json.array.length === 0
  }
}

// 检查空对象
{
  {
    Object.keys($json.object).length === 0
  }
}
```

### Q: 日期时间格式不正确怎么办？

**A: 统一使用ISO格式或Luxon处理**

```javascript
// 标准ISO格式
{
  {
    $now.toISO()
  }
} // 2024-01-15T10:30:00.000Z

// 自定义格式
{
  {
    $now.toFormat("yyyy-MM-dd")
  }
} // 2024-01-15
{
  {
    $now.toFormat("HH:mm:ss")
  }
} // 10:30:00

// 解析不同格式的日期
{
  {
    DateTime.fromFormat($json.dateString, "dd/MM/yyyy")
  }
}
{
  {
    DateTime.fromISO($json.isoString)
  }
}
{
  {
    DateTime.fromSQL($json.sqlDate)
  }
}

// 安全的日期解析
{
  {
    ;(() => {
      const parsed = DateTime.fromISO($json.dateString)
      return parsed.isValid ? parsed.toFormat("yyyy-MM-dd") : "无效日期"
    })()
  }
}
```

## 🔒 安全相关

### Q: 表达式有安全限制吗？

**A: 有，为了安全不能访问某些全局对象**

```javascript
❌ {{ window.location }}            // 不能访问浏览器对象
❌ {{ process.env }}                // 不能访问Node.js环境
❌ {{ eval("malicious code") }}     // 不能使用eval
❌ {{ require("fs") }}              // 不能导入模块

✅ {{ $json, $vars, $node, $now }}  // 只能访问预定义变量
✅ {{ Math.random() }}              // 可以使用Math对象
✅ {{ JSON.stringify($json) }}      // 可以使用JSON对象
```

### Q: 如何处理用户输入的安全问题？

**A: 始终验证和清理用户输入**

```javascript
// 清理HTML标签
{
  {
    $replace($json.userInput, /<[^>]*>/g, "")
  }
}

// 转义特殊字符
{
  {
    $json.userInput
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
  }
}

// 限制字符串长度
{
  {
    $json.userInput.substring(0, 100)
  }
}

// 验证格式
{
  {
    ;/^[a-zA-Z0-9_]+$/.test($json.username) ? $json.username : "invalid"
  }
}
```

## 🎯 最佳实践

### Q: 如何编写可维护的表达式？

**A: 遵循这些最佳实践**

```javascript
// 1. 使用有意义的变量名
✅ {{ $vars.user_session_timeout_minutes }}
❌ {{ $vars.timeout }}

// 2. 添加适当的注释（在节点描述中）
// 节点描述：计算用户的会员等级基于积分数

// 3. 保持表达式简洁
✅ {{ $json.score >= 1000 ? "金牌会员" : "普通会员" }}
❌ {{ $if($if($json.score >= 1000, true, false), "金牌会员", "普通会员") }}

// 4. 使用安全访问
✅ {{ $json.user?.profile?.level ?? "未设置" }}
❌ {{ $json.user.profile.level }}
```

### Q: 什么情况下应该拆分复杂表达式？

**A: 遵循这些原则**

**应该拆分的情况：**

- 表达式超过3-4行
- 有重复的子表达式
- 逻辑复杂难以理解
- 有多个嵌套的条件判断

```javascript
❌ // 复杂的单个表达式
{{ $json.users.filter(u => u.active && u.type === 'premium' && u.lastLogin > $now.minus({days: 30})).map(u => ({name: u.name, revenue: u.orders.reduce((sum, o) => sum + o.amount, 0)})).sort((a, b) => b.revenue - a.revenue).slice(0, 10) }}

✅ // 拆分为多个节点
// 节点1：筛选活跃高级用户
{{ $json.users.filter(u => u.active && u.type === 'premium' && u.lastLogin > $now.minus({days: 30})) }}

// 节点2：计算收入
{{ $json.users.map(u => ({name: u.name, revenue: u.orders.reduce((sum, o) => sum + o.amount, 0)})) }}

// 节点3：排序和限制
{{ $json.users.sort((a, b) => b.revenue - a.revenue).slice(0, 10) }}
```

---

## 🆘 仍然遇到问题？

如果你的问题没有在FAQ中找到答案：

1. **查看其他文档**：

   - [入门指南](./getting-started.md) - 基础概念
   - [语法基础](./syntax-basics.md) - 详细语法
   - [函数参考](./functions-reference.md) - 所有函数说明

2. **使用调试技巧**：

   - 使用`{{ JSON.stringify($json, null, 2) }}`查看数据结构
   - 分步测试复杂表达式
   - 检查数据类型：`{{ typeof $json.field }}`

3. **提交反馈**：

   - [GitHub Issues](https://github.com/automation/expression-engine/issues)
   - 提供具体的错误信息和表达式代码
   - 描述期望的结果和实际结果

4. **社区支持**：
   - 查看其他用户的问题和解决方案
   - 分享你的使用经验和技巧
