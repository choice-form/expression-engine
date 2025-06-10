# 变量使用指南

本指南详细介绍workflow中所有可用的内置变量，帮助你充分利用系统提供的数据和功能。

## 🗂 变量概览

在表达式中，你可以访问以下预定义变量：

| 变量         | 说明               | 使用场景                 |
| ------------ | ------------------ | ------------------------ |
| `$json`      | 当前节点的输入数据 | 最常用，获取任何业务数据 |
| `$item`      | 当前处理的数据项   | 循环处理时的当前项       |
| `$vars`      | 工作流全局变量     | 配置信息、状态共享       |
| `$node`      | 当前节点信息       | 节点元数据、调试信息     |
| `$workflow`  | 工作流信息         | 工作流级别的元数据       |
| `$execution` | 执行上下文信息     | 执行状态、性能数据       |
| `$now`       | 当前时间对象       | 日期时间处理             |
| `$today`     | 今天日期对象       | 日期相关计算             |

## 📋 $json - 核心数据变量

`$json` 是最重要的变量，包含当前节点的输入数据。

### 基础访问

```javascript
// 获取用户信息
{
  {
    $json.user.name
  }
} // 用户名
{
  {
    $json.user.email
  }
} // 邮箱
{
  {
    $json.user.age
  }
} // 年龄

// 获取订单信息
{
  {
    $json.order.id
  }
} // 订单ID
{
  {
    $json.order.totalAmount
  }
} // 总金额
{
  {
    $json.order.status
  }
} // 订单状态
```

### 深层嵌套访问

```javascript
// 复杂嵌套结构
{
  {
    $json.response.data.result.items[0].name
  }
}

// API响应数据
{
  {
    $json.api.response.body.users[0].profile.avatar
  }
}

// 配置信息
{
  {
    $json.config.database.mysql.host
  }
}
```

### 数组数据处理

```javascript
// 数组长度
{
  {
    $json.items.length
  }
}

// 访问数组元素
{
  {
    $json.items[0]
  }
} // 第一个
{
  {
    $json.items[-1]
  }
} // 最后一个

// 数组操作
{
  {
    $json.products.map((p) => p.name)
  }
} // 提取名称
{
  {
    $json.users.filter((u) => u.active)
  }
} // 筛选活跃用户
{
  {
    $json.orders.reduce((sum, o) => sum + o.amount, 0)
  }
} // 计算总额
```

### 安全访问模式

```javascript
// 避免undefined错误
{
  {
    $json.user?.profile?.avatar ?? "default.jpg"
  }
}

// 多级安全访问
{
  {
    $json.api?.response?.data?.result ?? {}
  }
}

// 数组安全访问
{
  {
    $json.items?.[0]?.name ?? "无商品"
  }
}
```

## 🔄 $item - 循环处理变量

在批量处理或循环节点中，`$item` 表示当前正在处理的数据项。

### 基本用法

```javascript
// 在循环中访问当前项
{
  {
    $item.name
  }
} // 当前项的名称
{
  {
    $item.id
  }
} // 当前项的ID
{
  {
    $item.status
  }
} // 当前项的状态
```

### 与$json的区别

```javascript
// $json: 包含所有输入数据
// $item: 仅包含当前处理的单个项目

// 假设$json = { users: [{name: "A"}, {name: "B"}] }
// 在循环处理时:
// 第一次循环: $item = {name: "A"}
// 第二次循环: $item = {name: "B"}

{
  {
    $item.name
  }
} // 当前用户名
{
  {
    $json.users.length
  }
} // 总用户数
```

### 索引和位置

```javascript
// 获取当前项在数组中的位置（需要配合特殊函数）
{
  {
    $item.$index
  }
} // 当前索引（如果支持）
{
  {
    $item.$position
  }
} // 当前位置（如果支持）
```

## 🔧 $vars - 全局变量

`$vars` 存储工作流级别的变量，用于在不同节点间共享数据。

### 配置信息

```javascript
// API配置
{
  {
    $vars.apiBaseUrl
  }
} // API基础URL
{
  {
    $vars.apiKey
  }
} // API密钥
{
  {
    $vars.timeout
  }
} // 超时时间

// 数据库配置
{
  {
    $vars.dbHost
  }
} // 数据库主机
{
  {
    $vars.dbName
  }
} // 数据库名
{
  {
    $vars.dbPort
  }
} // 数据库端口
```

### 业务参数

```javascript
// 业务规则
{
  {
    $vars.maxRetryCount
  }
} // 最大重试次数
{
  {
    $vars.batchSize
  }
} // 批处理大小
{
  {
    $vars.defaultLanguage
  }
} // 默认语言

// 阈值设置
{
  {
    $vars.scoreThreshold
  }
} // 分数阈值
{
  {
    $vars.priceLimit
  }
} // 价格限制
{
  {
    $vars.timeoutMinutes
  }
} // 超时分钟数
```

### 状态共享

```javascript
// 流程状态
{
  {
    $vars.currentStep
  }
} // 当前步骤
{
  {
    $vars.processedCount
  }
} // 已处理数量
{
  {
    $vars.errorCount
  }
} // 错误计数

// 缓存数据
{
  {
    $vars.cachedResult
  }
} // 缓存结果
{
  {
    $vars.lastUpdate
  }
} // 最后更新时间
{
  {
    $vars.sessionId
  }
} // 会话ID
```

### 动态变量名

```javascript
// 根据条件构建变量名
{
  {
    $vars[$json.environment + "_config"]
  }
}
{
  {
    $vars["db_" + $json.region + "_host"]
  }
}
{
  {
    $vars[$json.userType + "_permissions"]
  }
}
```

## 📄 $node - 节点信息

`$node` 包含当前节点的元数据和配置信息。

### 基本节点信息

```javascript
// 节点标识
{
  {
    $node.name
  }
} // 节点名称
{
  {
    $node.type
  }
} // 节点类型
{
  {
    $node.id
  }
} // 节点ID

// 节点配置
{
  {
    $node.parameters
  }
} // 节点参数
{
  {
    $node.position
  }
} // 节点位置
{
  {
    $node.disabled
  }
} // 是否禁用
```

### 节点状态

```javascript
// 执行状态
{
  {
    $node.executeOnce
  }
} // 是否只执行一次
{
  {
    $node.alwaysOutputData
  }
} // 是否总是输出数据
{
  {
    $node.continueOnFail
  }
} // 失败时是否继续

// 重试配置
{
  {
    $node.retryOnFail
  }
} // 是否重试
{
  {
    $node.maxTries
  }
} // 最大尝试次数
{
  {
    $node.waitBetweenTries
  }
} // 重试间隔
```

### 调试用途

```javascript
// 调试信息
{
  {
    ;`当前节点: ${$node.name} (${$node.type})`
  }
}
{
  {
    ;`节点ID: ${$node.id}`
  }
}
{
  {
    ;`节点参数: ${JSON.stringify($node.parameters)}`
  }
}
```

## 🔄 $workflow - 工作流信息

`$workflow` 包含整个工作流的元数据。

### 工作流基本信息

```javascript
// 工作流标识
{
  {
    $workflow.id
  }
} // 工作流ID
{
  {
    $workflow.name
  }
} // 工作流名称
{
  {
    $workflow.description
  }
} // 工作流描述

// 版本信息
{
  {
    $workflow.version
  }
} // 版本号
{
  {
    $workflow.createdAt
  }
} // 创建时间
{
  {
    $workflow.updatedAt
  }
} // 更新时间
```

### 工作流配置

```javascript
// 设置信息
{
  {
    $workflow.settings
  }
} // 工作流设置
{
  {
    $workflow.variables
  }
} // 工作流变量定义
{
  {
    $workflow.connections
  }
} // 节点连接关系

// 状态信息
{
  {
    $workflow.active
  }
} // 是否激活
{
  {
    $workflow.pinData
  }
} // 固定数据
```

### 元数据应用

```javascript
// 日志记录
{
  {
    ;`工作流 ${$workflow.name} 在节点 ${$node.name} 执行`
  }
}

// 条件执行
{
  {
    $workflow.settings.environment === "production" ? "生产环境" : "测试环境"
  }
}

// 动态配置
{
  {
    $workflow.variables[$json.configKey]
  }
}
```

## ⚙️ $execution - 执行上下文

`$execution` 包含当前执行的上下文信息。

### 执行标识

```javascript
// 执行信息
{
  {
    $execution.id
  }
} // 执行ID
{
  {
    $execution.mode
  }
} // 执行模式 (normal, test, webhook等)
{
  {
    $execution.startedAt
  }
} // 开始时间

// 触发信息
{
  {
    $execution.trigger
  }
} // 触发器信息
{
  {
    $execution.webhook
  }
} // Webhook数据（如果是webhook触发）
```

### 性能数据

```javascript
// 执行统计
{
  {
    $execution.executionTime
  }
} // 执行时间
{
  {
    $execution.nodeExecutionOrder
  }
} // 节点执行顺序
{
  {
    $execution.waitingExecution
  }
} // 等待执行的节点

// 资源使用
{
  {
    $execution.memoryUsage
  }
} // 内存使用
{
  {
    $execution.cpuUsage
  }
} // CPU使用
```

### 调试和监控

```javascript
// 执行跟踪
{
  {
    ;`执行ID: ${$execution.id}, 模式: ${$execution.mode}`
  }
}
{
  {
    ;`开始时间: ${$execution.startedAt}`
  }
}
{
  {
    ;`执行时长: ${$execution.executionTime}ms`
  }
}

// 条件判断
{
  {
    $execution.mode === "test" ? "测试模式" : "正式运行"
  }
}
```

## ⏰ $now - 当前时间

`$now` 是一个Luxon DateTime对象，表示当前时间。

### 基本时间获取

```javascript
// 标准格式
{
  {
    $now.toISO()
  }
} // ISO格式: 2024-01-15T10:30:00.000Z
{
  {
    $now.toISODate()
  }
} // 日期: 2024-01-15
{
  {
    $now.toISOTime()
  }
} // 时间: 10:30:00.000

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
{
  {
    $now.toFormat("yyyy年MM月dd日")
  }
} // 2024年01月15日
```

### 时间组件

```javascript
// 年月日
{
  {
    $now.year
  }
} // 2024
{
  {
    $now.month
  }
} // 1 (1-12)
{
  {
    $now.day
  }
} // 15

// 时分秒
{
  {
    $now.hour
  }
} // 10
{
  {
    $now.minute
  }
} // 30
{
  {
    $now.second
  }
} // 0

// 星期和季度
{
  {
    $now.weekday
  }
} // 1-7 (周一到周日)
{
  {
    $now.quarter
  }
} // 1-4
```

### 时间计算

```javascript
// 加减时间
{
  {
    $now.plus({ days: 7 })
  }
} // 7天后
{
  {
    $now.minus({ hours: 2 })
  }
} // 2小时前
{
  {
    $now.plus({ months: 1, days: 5 })
  }
} // 1个月5天后

// 时间范围
{
  {
    $now.startOf("day")
  }
} // 今天开始
{
  {
    $now.endOf("month")
  }
} // 本月结束
{
  {
    $now.startOf("week")
  }
} // 本周开始
```

### 时间比较

```javascript
// 比较操作
{
  {
    $now > $json.deadline ? "已过期" : "未过期"
  }
}
{
  {
    $now.diff($json.startTime, "hours")
  }
} // 时间差（小时）

// 时间判断
{
  {
    $now.hasSame($json.eventDate, "day") ? "今天" : "其他日期"
  }
}
{
  {
    $now.weekday <= 5 ? "工作日" : "周末"
  }
}
```

## 📅 $today - 今天日期

`$today` 是今天日期的Luxon DateTime对象（时间为00:00:00）。

### 日期操作

```javascript
// 日期比较
{
  {
    $today.toFormat("yyyy-MM-dd")
  }
} // 今天日期
{
  {
    $today.plus({ days: 1 }).toFormat("yyyy-MM-dd")
  }
} // 明天
{
  {
    $today.minus({ days: 1 }).toFormat("yyyy-MM-dd")
  }
} // 昨天

// 本周、本月
{
  {
    $today.startOf("week").toFormat("yyyy-MM-dd")
  }
} // 本周开始
{
  {
    $today.endOf("month").toFormat("yyyy-MM-dd")
  }
} // 本月结束
```

### 业务场景

```javascript
// 是否今天创建
{
  {
    $json.createDate === $today.toFormat("yyyy-MM-dd") ? "今日新增" : "历史数据"
  }
}

// 工作日判断
{
  {
    $today.weekday <= 5 ? "工作日" : "休息日"
  }
}

// 月份判断
{
  {
    $today.month === 12 ? "年末处理" : "常规处理"
  }
}
```

## 🔍 变量调试技巧

### 查看完整结构

```javascript
// 查看所有可用数据
{
  {
    JSON.stringify($json, null, 2)
  }
}

// 查看特定对象结构
{
  {
    JSON.stringify($vars, null, 2)
  }
}
{
  {
    JSON.stringify($node, null, 2)
  }
}
{
  {
    JSON.stringify($execution, null, 2)
  }
}
```

### 类型检查

```javascript
// 检查变量类型
{
  {
    typeof $json.value
  }
}
{
  {
    Array.isArray($json.items)
  }
}
{
  {
    $json.timestamp instanceof Date
  }
}

// 检查是否存在
{
  {
    "$json" in this ? "数据存在" : "数据不存在"
  }
}
{
  {
    typeof $vars.apiKey !== "undefined" ? "配置存在" : "配置缺失"
  }
}
```

### 条件访问

```javascript
// 安全访问模式
{
  {
    $json?.user?.profile || {}
  }
}
{
  {
    $vars?.config?.timeout ?? 30000
  }
}
{
  {
    $node?.parameters?.retryCount ?? 3
  }
}
```

## 🎯 最佳实践

### 1. 优先使用安全访问

```javascript
✅ {{ $json.user?.name ?? "匿名用户" }}
❌ {{ $json.user.name || "匿名用户" }}  // 可能在name为""时出错
```

### 2. 合理使用变量作用域

```javascript
// 本地数据使用$json
{
  {
    $json.currentUserData
  }
}

// 全局配置使用$vars
{
  {
    $vars.systemSettings
  }
}

// 元数据使用$node/$workflow
{
  {
    $node.name + " - " + $workflow.name
  }
}
```

### 3. 性能考虑

```javascript
// 避免重复计算
✅ {{ (() => {
  const userData = $json.user;
  return userData ? `${userData.name} - ${userData.email}` : "未知用户";
})() }}

❌ {{ $json.user ? $json.user.name + " - " + $json.user.email : "未知用户" }}
```

### 4. 清晰的变量命名

```javascript
// 在$vars中使用清晰的命名
{
  {
    $vars.api_timeout_seconds
  }
} // 清晰
{
  {
    $vars.timeout
  }
} // 模糊

{
  {
    $vars.user_max_login_attempts
  }
} // 清晰
{
  {
    $vars.maxAttempts
  }
} // 模糊
```

---

掌握这些内置变量后，你就可以充分利用workflow提供的所有数据和功能了！

下一步推荐学习：[函数库参考](./functions-reference.md) 了解所有可用的内置函数。
