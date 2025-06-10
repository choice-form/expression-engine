# 表达式语法基础

本指南详细介绍表达式的语法规则，帮助你掌握所有可用的操作符和语法结构。

## 📝 基本语法规则

### 表达式边界

所有表达式必须包含在双花括号中：

```javascript
{
  {
    表达式内容
  }
}
```

### 空白字符

表达式内的空白字符会被忽略，以下写法等价：

```javascript
{
  {
    $json.name
  }
}
{
  {
    $json.name
  }
}
{
  {
    $json.name
  }
}
```

### 注释（不支持）

表达式内不支持注释，如需说明，请在workflow节点中添加描述。

## 🔢 数据类型

### 基本数据类型

#### 数字 (Number)

```javascript
{
  {
    42
  }
} // 整数
{
  {
    3.14
  }
} // 小数
{
  {
    ;-10
  }
} // 负数
{
  {
    1.23e-4
  }
} // 科学计数法
```

#### 字符串 (String)

```javascript
{
  {
    ;("hello")
  }
} // 双引号
{
  {
    ;("world")
  }
} // 单引号
{
  {
    ;`template`
  }
} // 模板字符串
{
  {
    ;('包含"引号"的字符串')
  }
} // 转义字符
```

#### 布尔值 (Boolean)

```javascript
{
  {
    true
  }
}
{
  {
    false
  }
}
```

#### 空值

```javascript
{
  {
    null
  }
}
{
  {
    undefined
  }
}
```

#### 数组 (Array)

```javascript
{
  {
    ;[1, 2, 3]
  }
}
{
  {
    ;["apple", "banana", "orange"]
  }
}
{
  {
    ;[true, false, null]
  }
}
{
  {
    ;[]
  }
} // 空数组
```

#### 对象 (Object)

```javascript
{{ {name: "张三", age: 25} }}
{{ {"key1": "value1", "key2": "value2"} }}
{{ {} }}  // 空对象
```

## ➕ 运算符

### 算术运算符

#### 基本运算

```javascript
{
  {
    5 + 3
  }
} // 8 - 加法
{
  {
    5 - 3
  }
} // 2 - 减法
{
  {
    5 * 3
  }
} // 15 - 乘法
{
  {
    5 / 3
  }
} // 1.6666... - 除法
{
  {
    5 % 3
  }
} // 2 - 取余
{
  {
    5 ** 3
  }
} // 125 - 幂运算
```

#### 运算优先级

```javascript
{
  {
    2 + 3 * 4
  }
} // 14 (先乘除后加减)
{
  {
    ;(2 + 3) * 4
  }
} // 20 (括号优先)
{
  {
    2 ** (3 ** 2)
  }
} // 512 (幂运算从右到左)
```

#### 字符串拼接

```javascript
{
  {
    "Hello" + " " + "World"
  }
} // "Hello World"
{
  {
    $json.firstName + $json.lastName
  }
}
{
  {
    "用户ID: " + $json.id
  }
}
```

### 比较运算符

```javascript
{
  {
    5 > 3
  }
} // true - 大于
{
  {
    5 < 3
  }
} // false - 小于
{
  {
    5 >= 5
  }
} // true - 大于等于
{
  {
    5 <= 4
  }
} // false - 小于等于
{
  {
    5 === 5
  }
} // true - 严格相等
{
  {
    5 !== 3
  }
} // true - 严格不等
{
  {
    5 == "5"
  }
} // true - 相等（类型转换）
{
  {
    5 != "3"
  }
} // true - 不等（类型转换）
```

#### 字符串比较

```javascript
{
  {
    "apple" < "banana"
  }
} // true - 字典序比较
{
  {
    "Apple" < "apple"
  }
} // true - ASCII码比较
{
  {
    $json.name === "张三"
  }
} // 精确匹配
```

### 逻辑运算符

```javascript
{
  {
    true && false
  }
} // false - 逻辑与
{
  {
    true || false
  }
} // true - 逻辑或
{
  {
    !true
  }
} // false - 逻辑非
```

#### 短路求值

```javascript
{
  {
    $json.user && $json.user.name
  }
} // 安全访问
{
  {
    $json.config || "默认配置"
  }
} // 默认值
```

### 条件（三元）运算符

```javascript
{
  {
    条件 ? 真值 : 假值
  }
}
```

**示例:**

```javascript
{
  {
    $json.age >= 18 ? "成年人" : "未成年人"
  }
}
{
  {
    $json.vip ? "VIP用户" : "普通用户"
  }
}
{
  {
    $json.score >= 60 ? "及格" : "不及格"
  }
}
```

#### 嵌套条件

```javascript
{
  {
    $json.score >= 90 ? "优秀" : $json.score >= 60 ? "及格" : "不及格"
  }
}
```

### 空值合并运算符

```javascript
{
  {
    $json.nickname ?? "匿名用户"
  }
} // 如果nickname为null/undefined，使用默认值
{
  {
    $json.description ?? "暂无描述"
  }
}
```

与逻辑或的区别：

```javascript
{
  {
    $json.value || "default"
  }
} // 如果value为false、0、""，都使用default
{
  {
    $json.value ?? "default"
  }
} // 只有value为null/undefined才使用default
```

## 🗂 属性访问

### 点号访问

```javascript
{
  {
    $json.user.name
  }
} // 访问嵌套属性
{
  {
    $json.settings.theme
  }
}
{
  {
    $node.data.id
  }
}
```

### 方括号访问

```javascript
{
  {
    $json["user"]["name"]
  }
} // 等同于点号访问
{
  {
    $json.users[0]
  }
} // 数组索引
{
  {
    $json.users[$vars.currentIndex]
  }
} // 动态索引
{
  {
    $json[$vars.dynamicKey]
  }
} // 动态属性名
```

### 安全访问

```javascript
{
  {
    $json?.user?.name
  }
} // 可选链操作符
{
  {
    $json.users?.[0]?.name
  }
}
```

## 🔧 函数调用

### 方法调用

```javascript
{
  {
    $json.message.toUpperCase()
  }
} // 字符串方法
{
  {
    $json.items.length
  }
} // 数组属性
{
  {
    $json.items.slice(0, 3)
  }
} // 数组方法
{
  {
    $json.timestamp.toISOString()
  }
} // 日期方法
```

### 内置函数

```javascript
{
  {
    $if($json.age >= 18, "adult", "minor")
  }
} // 条件函数
{
  {
    $length($json.message)
  }
} // 长度函数
{
  {
    $split($json.tags, ",")
  }
} // 分割函数
```

### 链式调用

```javascript
{
  {
    $json.message.trim().toUpperCase().slice(0, 10)
  }
}
{
  {
    $json.items.filter((item) => item.active).length
  }
}
```

## 📋 数组操作

### 数组访问

```javascript
{{ $json.items[0] }}                // 第一个元素
{{ $json.items[-1] }}               // 最后一个元素
{{ $json.items[1:3] }}              // 切片操作
```

### 数组方法

```javascript
{
  {
    $json.items.length
  }
} // 数组长度
{
  {
    $json.items.includes("apple")
  }
} // 是否包含
{
  {
    $json.items.indexOf("banana")
  }
} // 查找索引
{
  {
    $json.items.join(", ")
  }
} // 连接为字符串
```

### 高级数组操作

```javascript
// 过滤
{
  {
    $json.users.filter((user) => user.age >= 18)
  }
}

// 映射
{
  {
    $json.items.map((item) => item.name)
  }
}

// 查找
{
  {
    $json.users.find((user) => user.id === $vars.targetId)
  }
}

// 归约
{
  {
    $json.prices.reduce((sum, price) => sum + price, 0)
  }
}
```

## 🎯 条件表达式

### 简单条件

```javascript
{
  {
    $json.status === "active" ? "激活" : "未激活"
  }
}
```

### 复杂条件

```javascript
{
  {
    $json.age >= 18 && $json.verified ? "已验证成年用户" : "需要验证"
  }
}
```

### 多重条件

```javascript
{
  {
    $json.type === "vip"
      ? "VIP"
      : $json.type === "premium"
        ? "高级"
        : $json.type === "basic"
          ? "基础"
          : "未知"
  }
}
```

### 条件链

```javascript
{
  {
    ;($json.score >= 90 && "优秀") ||
      ($json.score >= 80 && "良好") ||
      ($json.score >= 60 && "及格") ||
      "不及格"
  }
}
```

## 🔄 循环和迭代

### 数组遍历

```javascript
{
  {
    $json.items.map((item) => `${item.name}: ${item.price}`)
  }
}
```

### 对象属性遍历

```javascript
{
  {
    Object.keys($json.user).map((key) => `${key}: ${$json.user[key]}`)
  }
}
```

### 条件筛选

```javascript
{
  {
    $json.products.filter((product) => product.price > 100)
  }
}
```

## 📊 数学函数

### 内置Math对象

```javascript
{
  {
    Math.abs(-5)
  }
} // 5 - 绝对值
{
  {
    Math.ceil(4.3)
  }
} // 5 - 向上取整
{
  {
    Math.floor(4.7)
  }
} // 4 - 向下取整
{
  {
    Math.round(4.5)
  }
} // 5 - 四舍五入
{
  {
    Math.max(1, 5, 3)
  }
} // 5 - 最大值
{
  {
    Math.min(1, 5, 3)
  }
} // 1 - 最小值
{
  {
    Math.pow(2, 3)
  }
} // 8 - 幂运算
{
  {
    Math.sqrt(16)
  }
} // 4 - 平方根
{
  {
    Math.random()
  }
} // 0-1随机数
```

### 自定义数学计算

```javascript
{
  {
    ;($json.price * $json.quantity * 1.1).toFixed(2)
  }
} // 计算总价含税，保留2位小数
```

## 🕰 日期时间处理

### Luxon DateTime对象

```javascript
{
  {
    $now.toFormat("yyyy-MM-dd")
  }
} // 2024-01-15
{
  {
    $now.toFormat("HH:mm:ss")
  }
} // 14:30:25
{
  {
    $now.plus({ days: 7 }).toISO()
  }
} // 7天后的ISO时间
{
  {
    $now.diff($json.startTime, "hours")
  }
} // 时间差（小时）
```

### 日期比较

```javascript
{
  {
    $now > $json.deadline ? "已过期" : "未过期"
  }
}
{
  {
    $json.createTime.hasSame($now, "day") ? "今天创建" : "其他日期"
  }
}
```

## 🔍 正则表达式

### 基本匹配

```javascript
{
  {
    ;/^\d+$/.test($json.phoneNumber)
  }
} // 是否为纯数字
{
  {
    ;/^[\w.-]+@[\w.-]+\.\w+$/.test($json.email)
  }
} // 邮箱格式验证
```

### 字符串方法配合正则

```javascript
{
  {
    $json.message.match(/\d+/g)
  }
} // 提取所有数字
{
  {
    $json.text.replace(/\s+/g, " ")
  }
} // 替换多个空格为单个空格
```

## ⚠️ 语法注意事项

### 1. 严格模式

表达式在严格模式下执行，以下操作会报错：

```javascript
❌ {{ delete $json.property }}     // 不能删除属性
❌ {{ eval("some code") }}          // 不能使用eval
❌ {{ with($json) { name } }}       // 不能使用with语句
```

### 2. 变量作用域

表达式只能访问预定义的变量：

```javascript
✅ {{ $json, $vars, $node, $now, $today }}  // 可访问的变量
❌ {{ window, document, global }}            // 不能访问全局对象
```

### 3. 函数定义

不能在表达式中定义函数：

```javascript
❌ {{ function add(a, b) { return a + b } }}  // 不支持
✅ {{ ((a, b) => a + b)(1, 2) }}             // 立即执行的箭头函数可以
```

### 4. 循环语句

不支持for、while等循环语句：

```javascript
❌ {{ for(let i = 0; i < 10; i++) {...} }}   // 不支持
✅ {{ Array.from({length: 10}, (_, i) => i) }}  // 使用数组方法替代
```

## 🎯 最佳实践

### 1. 保持简洁

```javascript
✅ {{ $json.user?.name ?? "匿名" }}
❌ {{ $json && $json.user && $json.user.name ? $json.user.name : "匿名" }}
```

### 2. 使用类型检查

```javascript
✅ {{ typeof $json.count === 'number' ? $json.count : 0 }}
✅ {{ Array.isArray($json.items) ? $json.items.length : 0 }}
```

### 3. 合理使用括号

```javascript
✅ {{ ($json.price * $json.quantity) * (1 + $json.taxRate) }}
❌ {{ $json.price * $json.quantity * 1 + $json.taxRate }}  // 运算顺序不明确
```

### 4. 错误处理

```javascript
✅ {{ $json.items?.length ?? 0 }}
✅ {{ $json.user?.email || "未设置邮箱" }}
```

---

掌握了这些语法基础后，你就可以编写强大的表达式了！继续学习 [常用示例](./common-examples.md) 来看更多实用案例。
