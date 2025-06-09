# 函数库参考手册

本手册详细介绍表达式引擎中所有可用的内置函数，按功能分类，提供完整的参数说明和使用示例。

## 📋 函数概览

| 分类                             | 函数数量 | 主要用途             |
| -------------------------------- | -------- | -------------------- |
| [条件函数](#🎯-条件函数)         | 2个      | 条件判断和多分支逻辑 |
| [字符串函数](#📝-字符串函数)     | 8个      | 文本处理和操作       |
| [数组函数](#📊-数组函数)         | 6个      | 数组数据处理         |
| [数学函数](#🔢-数学函数)         | 5个      | 数值计算和处理       |
| [日期时间函数](#⏰-日期时间函数) | 4个      | 时间相关操作         |
| [工具函数](#🔧-工具函数)         | 3个      | 通用工具和转换       |

## 🎯 条件函数

### $if(condition, trueValue, falseValue)

条件判断函数，根据条件返回不同的值。

**参数：**

- `condition` (boolean): 判断条件
- `trueValue` (any): 条件为真时返回的值
- `falseValue` (any): 条件为假时返回的值

**返回值：** 根据条件返回 trueValue 或 falseValue

**示例：**

```javascript
// 基础用法
{
  {
    $if($json.age >= 18, "成年人", "未成年人")
  }
}

// 嵌套条件
{
  {
    $if($json.score >= 90, "优秀", $if($json.score >= 60, "及格", "不及格"))
  }
}

// 复杂条件
{
  {
    $if($json.user && $json.user.verified, "已验证用户", "未验证用户")
  }
}

// 数值判断
{
  {
    $if($json.price > 0, $json.price, "免费")
  }
}
```

**使用场景：**

- 用户权限判断
- 状态标签生成
- 数据验证
- 动态内容显示

### $switch(value, ...cases)

多分支条件判断，类似switch语句。

**参数：**

- `value` (any): 要判断的值
- `cases` (any[]): 成对的条件和结果值
- 最后一个参数为默认值（可选）

**返回值：** 匹配的结果值或默认值

**示例：**

```javascript
// 基础用法
{
  {
    $switch($json.status, "draft", "草稿", "published", "已发布", "archived", "已归档", "未知状态")
  }
}

// 数值匹配
{
  {
    $switch($json.level, 1, "初级", 2, "中级", 3, "高级", "未定义")
  }
}

// 复杂匹配
{
  {
    $switch(
      $json.userType,
      "admin",
      "管理员权限",
      "editor",
      "编辑权限",
      "viewer",
      "查看权限",
      "无权限",
    )
  }
}
```

**使用场景：**

- 状态映射
- 用户角色处理
- 错误码转换
- 多语言切换

## 📝 字符串函数

### $length(string)

获取字符串或数组的长度。

**参数：**

- `string` (string|array): 字符串或数组

**返回值：** (number) 长度值

**示例：**

```javascript
// 字符串长度
{
  {
    $length($json.message)
  }
} // 获取消息长度
{
  {
    $length("Hello World")
  }
} // 返回 11

// 数组长度
{
  {
    $length($json.items)
  }
} // 获取数组元素数量

// 条件判断
{
  {
    $if($length($json.password) >= 8, "密码强度足够", "密码太短")
  }
}

// 验证非空
{
  {
    $if($length($json.name) > 0, $json.name, "匿名用户")
  }
}
```

### $split(string, delimiter)

按分隔符分割字符串。

**参数：**

- `string` (string): 要分割的字符串
- `delimiter` (string): 分隔符

**返回值：** (string[]) 分割后的字符串数组

**示例：**

```javascript
// 基础分割
{
  {
    $split($json.tags, ",")
  }
} // 分割标签
{
  {
    $split($json.fullName, " ")
  }
} // 分割姓名

// 获取特定部分
{
  {
    $split($json.email, "@")[0]
  }
} // 获取邮箱用户名
{
  {
    $split($json.filename, ".").pop()
  }
} // 获取文件扩展名

// 数据清理
{
  {
    $split($json.keywords, ",").map((k) => k.trim())
  }
} // 分割并去空格
```

### $join(array, delimiter)

将数组元素连接为字符串。

**参数：**

- `array` (any[]): 要连接的数组
- `delimiter` (string): 连接符，默认为逗号

**返回值：** (string) 连接后的字符串

**示例：**

```javascript
// 基础连接
{
  {
    $join($json.tags, ", ")
  }
} // 连接标签
{
  {
    $join($json.names, " | ")
  }
} // 用管道符连接

// 构建路径
{
  {
    $join([$json.category, $json.subcategory, $json.item], "/")
  }
}

// 生成列表
{
  {
    $join($json.features, "、")
  }
} // 中文顿号连接
```

### $trim(string)

去除字符串首尾空白字符。

**参数：**

- `string` (string): 要处理的字符串

**返回值：** (string) 去除空白后的字符串

**示例：**

```javascript
// 基础用法
{
  {
    $trim($json.userInput)
  }
} // 清理用户输入
{
  {
    $trim("  hello world  ")
  }
} // 返回 "hello world"

// 数据清理
{
  {
    $trim($json.name) || "未命名"
  }
} // 清理后检查是否为空

// 批量处理
{
  {
    $json.items.map((item) => $trim(item.name))
  }
} // 清理数组中的字符串
```

### $replace(string, search, replace)

替换字符串中的内容。

**参数：**

- `string` (string): 原字符串
- `search` (string|RegExp): 要搜索的内容
- `replace` (string): 替换的内容

**返回值：** (string) 替换后的字符串

**示例：**

```javascript
// 简单替换
{
  {
    $replace($json.content, "旧内容", "新内容")
  }
}

// 正则替换
{
  {
    $replace($json.phone, /(\d{3})\d{4}(\d{4})/, "$1****$2")
  }
} // 手机号脱敏

// 多次替换
{
  {
    $replace($replace($json.text, "apple", "苹果"), "banana", "香蕉")
  }
}

// 清理格式
{
  {
    $replace($json.input, /\s+/g, " ")
  }
} // 多个空格替换为单个空格
```

### $upper(string)

将字符串转换为大写。

**参数：**

- `string` (string): 要转换的字符串

**返回值：** (string) 大写字符串

**示例：**

```javascript
// 基础用法
{
  {
    $upper($json.status)
  }
} // 状态转大写
{
  {
    $upper("hello")
  }
} // 返回 "HELLO"

// 常量处理
{
  {
    $upper($json.country_code)
  }
} // 国家代码大写
{
  {
    $upper($json.currency)
  }
} // 货币代码大写
```

### $lower(string)

将字符串转换为小写。

**参数：**

- `string` (string): 要转换的字符串

**返回值：** (string) 小写字符串

**示例：**

```javascript
// 基础用法
{
  {
    $lower($json.email)
  }
} // 邮箱转小写
{
  {
    $lower("WORLD")
  }
} // 返回 "world"

// 统一格式
{
  {
    $lower($json.username)
  }
} // 用户名标准化
{
  {
    $lower($json.domain)
  }
} // 域名标准化
```

### $capitalize(string)

将字符串首字母大写。

**参数：**

- `string` (string): 要转换的字符串

**返回值：** (string) 首字母大写的字符串

**示例：**

```javascript
// 基础用法
{
  {
    $capitalize($json.firstName)
  }
} // 姓名首字母大写
{
  {
    $capitalize("hello world")
  }
} // 返回 "Hello world"

// 标题格式化
{
  {
    $split($json.title, " ")
      .map((word) => $capitalize(word))
      .join(" ")
  }
} // 每个单词首字母大写
```

## 📊 数组函数

### $first(array)

获取数组的第一个元素。

**参数：**

- `array` (any[]): 输入数组

**返回值：** (any) 第一个元素，如果数组为空返回 undefined

**示例：**

```javascript
// 基础用法
{
  {
    $first($json.items)
  }
} // 获取第一个商品
{
  {
    $first($json.users).name
  }
} // 获取第一个用户的名字

// 安全访问
{
  {
    $first($json.results)?.title ?? "无结果"
  }
} // 安全获取第一个结果的标题

// 条件处理
{
  {
    $if($first($json.orders), $first($json.orders).id, "无订单")
  }
}
```

### $last(array)

获取数组的最后一个元素。

**参数：**

- `array` (any[]): 输入数组

**返回值：** (any) 最后一个元素，如果数组为空返回 undefined

**示例：**

```javascript
// 基础用法
{
  {
    $last($json.items)
  }
} // 获取最后一个商品
{
  {
    $last($json.messages).content
  }
} // 获取最后一条消息

// 获取最新数据
{
  {
    $last($json.logs).timestamp
  }
} // 最新日志时间
{
  {
    $last($json.versions).number
  }
} // 最新版本号
```

### $slice(array, start, end)

提取数组的一部分。

**参数：**

- `array` (any[]): 输入数组
- `start` (number): 开始索引
- `end` (number): 结束索引（可选）

**返回值：** (any[]) 提取的数组片段

**示例：**

```javascript
// 基础用法
{
  {
    $slice($json.items, 0, 3)
  }
} // 获取前3个元素
{
  {
    $slice($json.items, 2)
  }
} // 从第3个元素开始到结尾

// 分页处理
{
  {
    $slice($json.products, $vars.page * 10, ($vars.page + 1) * 10)
  }
}

// 获取最近几条
{
  {
    $slice($json.logs, -5)
  }
} // 最后5条日志
```

### $filter(array, expression)

根据条件筛选数组元素。

**参数：**

- `array` (any[]): 输入数组
- `expression` (function): 筛选条件函数

**返回值：** (any[]) 筛选后的数组

**示例：**

```javascript
// 基础筛选
{
  {
    $filter($json.users, (user) => user.active)
  }
} // 筛选活跃用户
{
  {
    $filter($json.products, (product) => product.price > 100)
  }
} // 筛选高价商品

// 复杂条件
{
  {
    $filter($json.orders, (order) => order.status === "completed" && order.amount > 1000)
  }
}

// 字符串匹配
{
  {
    $filter($json.items, (item) => item.name.includes("apple"))
  }
}
```

### $map(array, expression)

对数组每个元素执行转换。

**参数：**

- `array` (any[]): 输入数组
- `expression` (function): 转换函数

**返回值：** (any[]) 转换后的数组

**示例：**

```javascript
// 基础转换
{
  {
    $map($json.users, (user) => user.name)
  }
} // 提取用户名
{
  {
    $map($json.products, (product) => product.price * 0.9)
  }
} // 计算折扣价

// 复杂转换
{
  {
    $map($json.orders, (order) => ({
      id: order.id,
      total: order.quantity * order.price,
      status: order.status,
    }))
  }
}

// 格式化
{
  {
    $map($json.dates, (date) => $now.fromISO(date).toFormat("yyyy-MM-dd"))
  }
}
```

### $reduce(array, expression, initialValue)

对数组进行归约操作。

**参数：**

- `array` (any[]): 输入数组
- `expression` (function): 归约函数
- `initialValue` (any): 初始值

**返回值：** (any) 归约结果

**示例：**

```javascript
// 求和
{
  {
    $reduce($json.prices, (sum, price) => sum + price, 0)
  }
}

// 查找最大值
{
  {
    $reduce($json.scores, (max, score) => (score > max ? score : max), 0)
  }
}

// 计数
{
  {
    $reduce($json.items, (count, item) => (item.active ? count + 1 : count), 0)
  }
}

// 构建对象
{
  {
    $reduce($json.users, (obj, user) => ({ ...obj, [user.id]: user.name }), {})
  }
}
```

## 🔢 数学函数

### $abs(number)

返回数字的绝对值。

**参数：**

- `number` (number): 输入数字

**返回值：** (number) 绝对值

**示例：**

```javascript
// 基础用法
{
  {
    $abs(-5)
  }
} // 返回 5
{
  {
    $abs($json.temperature)
  }
} // 温度绝对值

// 计算差值
{
  {
    $abs($json.actual - $json.expected)
  }
} // 实际值与期望值的差
{
  {
    $abs($json.price1 - $json.price2)
  }
} // 价格差异
```

### $ceil(number)

向上取整。

**参数：**

- `number` (number): 输入数字

**返回值：** (number) 向上取整后的整数

**示例：**

```javascript
// 基础用法
{
  {
    $ceil(4.2)
  }
} // 返回 5
{
  {
    $ceil($json.average)
  }
} // 平均值向上取整

// 页数计算
{
  {
    $ceil($json.totalItems / $json.pageSize)
  }
} // 计算总页数

// 时间估算
{
  {
    $ceil($json.duration / 60)
  }
} // 向上取整到分钟
```

### $floor(number)

向下取整。

**参数：**

- `number` (number): 输入数字

**返回值：** (number) 向下取整后的整数

**示例：**

```javascript
// 基础用法
{
  {
    $floor(4.8)
  }
} // 返回 4
{
  {
    $floor($json.progress)
  }
} // 进度向下取整

// 批次计算
{
  {
    $floor($json.totalItems / $json.batchSize)
  }
} // 完整批次数

// 折扣计算
{
  {
    $floor($json.price * $json.discountRate)
  }
} // 折扣金额
```

### $round(number, precision)

四舍五入到指定精度。

**参数：**

- `number` (number): 输入数字
- `precision` (number): 精度位数，默认为0

**返回值：** (number) 四舍五入后的数字

**示例：**

```javascript
// 基础用法
{
  {
    $round(3.14159, 2)
  }
} // 返回 3.14
{
  {
    $round($json.amount, 2)
  }
} // 金额保留2位小数

// 百分比计算
{
  {
    $round(($json.completed / $json.total) * 100, 1)
  }
} // 完成百分比，保留1位小数

// 评分处理
{
  {
    $round($json.rating, 0)
  }
} // 评分取整
```

### $max(...numbers)

返回最大值。

**参数：**

- `numbers` (number[]): 数字列表

**返回值：** (number) 最大值

**示例：**

```javascript
// 基础用法
{
  {
    $max(1, 5, 3, 9, 2)
  }
} // 返回 9
{
  {
    $max($json.score1, $json.score2, $json.score3)
  }
} // 最高分

// 数组最大值
{
  {
    $max(...$json.prices)
  }
} // 价格数组的最大值
{
  {
    $max(...$json.temperatures)
  }
} // 温度数组的最大值
```

## ⏰ 日期时间函数

### $now()

获取当前时间。

**参数：** 无

**返回值：** (DateTime) Luxon DateTime对象

**示例：**

```javascript
// 基础用法
{
  {
    $now().toFormat("yyyy-MM-dd")
  }
} // 当前日期
{
  {
    $now().toFormat("HH:mm:ss")
  }
} // 当前时间

// 时间计算
{
  {
    $now().plus({ days: 7 }).toISO()
  }
} // 7天后
{
  {
    $now().minus({ hours: 2 }).toFormat("yyyy-MM-dd HH:mm")
  }
} // 2小时前
```

### $today()

获取今天的日期（时间为00:00:00）。

**参数：** 无

**返回值：** (DateTime) 今天的Luxon DateTime对象

**示例：**

```javascript
// 基础用法
{
  {
    $today().toFormat("yyyy-MM-dd")
  }
} // 今天日期
{
  {
    $today().weekday
  }
} // 今天是星期几

// 日期比较
{
  {
    $today().hasSame($json.eventDate, "day") ? "今天" : "其他日期"
  }
}
```

### $formatDate(date, format)

格式化日期。

**参数：**

- `date` (string|DateTime): 日期对象或ISO字符串
- `format` (string): 格式字符串

**返回值：** (string) 格式化后的日期字符串

**示例：**

```javascript
// 基础用法
{
  {
    $formatDate($json.createdAt, "yyyy-MM-dd")
  }
} // 格式化为日期
{
  {
    $formatDate($json.timestamp, "yyyy年MM月dd日")
  }
} // 中文格式

// 相对时间
{
  {
    $formatDate($now().plus({ days: 30 }), "MM/dd")
  }
} // 30天后的日期
```

### $addDays(date, days)

给日期添加天数。

**参数：**

- `date` (string|DateTime): 基础日期
- `days` (number): 要添加的天数

**返回值：** (DateTime) 新的日期对象

**示例：**

```javascript
// 基础用法
{
  {
    $addDays($json.startDate, 30)
  }
} // 开始日期后30天
{
  {
    $addDays($today(), 7).toFormat("yyyy-MM-dd")
  }
} // 一周后

// 业务计算
{
  {
    $addDays($json.orderDate, $json.deliveryDays)
  }
} // 预计送达日期
```

## 🔧 工具函数

### $json(string)

解析JSON字符串。

**参数：**

- `string` (string): JSON字符串

**返回值：** (any) 解析后的对象

**示例：**

```javascript
// 基础用法
{
  {
    $json($json.configString)
  }
} // 解析配置字符串
{
  {
    $json('{"name": "test", "value": 123}')
  }
} // 解析JSON字符串

// 安全解析
{
  {
    ;(() => {
      try {
        return $json($json.data)
      } catch (e) {
        return {}
      }
    })()
  }
}
```

### $string(value)

将值转换为字符串。

**参数：**

- `value` (any): 要转换的值

**返回值：** (string) 字符串形式

**示例：**

```javascript
// 基础用法
{
  {
    $string($json.number)
  }
} // 数字转字符串
{
  {
    $string($json.boolean)
  }
} // 布尔值转字符串

// 对象序列化
{
  {
    $string($json.object)
  }
} // 对象转字符串表示
```

### $number(value)

将值转换为数字。

**参数：**

- `value` (any): 要转换的值

**返回值：** (number) 数字形式

**示例：**

```javascript
// 基础用法
{
  {
    $number($json.stringNumber)
  }
} // 字符串转数字
{
  {
    $number("123.45")
  }
} // 返回 123.45

// 安全转换
{
  {
    $number($json.value) || 0
  }
} // 转换失败时使用默认值

// 计算
{
  {
    $number($json.price) * $number($json.quantity)
  }
} // 确保数值计算
```

## 🎯 函数组合使用

### 复杂数据处理

```javascript
// 用户数据统计
{
  {
    $reduce(
      $filter($json.users, (user) => user.active),
      (stats, user) => ({
        total: stats.total + 1,
        avgAge: stats.avgAge + user.age,
      }),
      { total: 0, avgAge: 0 },
    )
  }
}

// 销售报表
{
  {
    $map(
      $filter($json.orders, (order) => order.status === "completed"),
      (order) => ({
        id: order.id,
        customer: $upper($trim(order.customerName)),
        total: $round(order.amount, 2),
        date: $formatDate(order.createdAt, "yyyy-MM-dd"),
      }),
    )
  }
}
```

### 字符串处理链

```javascript
// 清理和格式化用户输入
{
  {
    $capitalize($trim($lower($replace($json.userInput, /[^\w\s]/g, ""))))
  }
}

// 生成友好的URL slug
{
  {
    $lower($replace($trim($json.title), /\s+/g, "-"))
  }
}

// 格式化标签列表
{
  {
    $join(
      $map($split($json.rawTags, ","), (tag) => $capitalize($trim(tag))),
      " | ",
    )
  }
}
```

### 条件与计算结合

```javascript
// 动态定价
{
  {
    $if(
      $json.quantity >= 100,
      $round($json.price * 0.8, 2), // 批量折扣
      $if(
        $json.vip,
        $round($json.price * 0.9, 2), // VIP折扣
        $json.price, // 原价
      ),
    )
  }
}

// 评级系统
{
  {
    $switch(
      $ceil($json.score / 20),
      5,
      "⭐⭐⭐⭐⭐ 优秀",
      4,
      "⭐⭐⭐⭐ 良好",
      3,
      "⭐⭐⭐ 一般",
      2,
      "⭐⭐ 较差",
      1,
      "⭐ 很差",
      "未评分",
    )
  }
}
```

## 💡 使用技巧

### 1. 参数验证

```javascript
// 确保函数参数正确
{
  {
    $if(Array.isArray($json.items), $length($json.items), 0)
  }
}
{
  {
    $if(typeof $json.text === "string", $split($json.text, ","), [])
  }
}
```

### 2. 错误处理

```javascript
// 使用默认值避免错误
{
  {
    $first($json.results) ?? {}
  }
}
{
  {
    $number($json.count) || 0
  }
}
{
  {
    $split($json.tags || "", ",")
  }
}
```

### 3. 性能优化

```javascript
// 避免重复计算
{
  {
    ;(() => {
      const items = $filter($json.products, (p) => p.active)
      return {
        count: $length(items),
        total: $reduce(items, (sum, item) => sum + item.price, 0),
      }
    })()
  }
}
```

---

掌握这些函数后，你就能处理workflow中的各种数据转换和逻辑需求了！

下一步推荐学习：[数据处理技巧](./data-processing.md) 了解更多高级数据处理方法。
