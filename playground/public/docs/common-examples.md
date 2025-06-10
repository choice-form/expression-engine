# 常用表达式示例

这里收集了最实用的表达式示例，按使用场景分类，可以直接复制使用或作为参考进行修改。

## 📋 数据提取与访问

### 基础数据访问

```javascript
// 获取用户姓名
{
  {
    $json.user.name
  }
}

// 获取订单ID
{
  {
    $json.order.id
  }
}

// 获取第一个商品的价格
{
  {
    $json.products[0].price
  }
}

// 获取嵌套对象中的值
{
  {
    $json.response.data.result.message
  }
}
```

### 安全数据访问（避免报错）

```javascript
// 安全访问可能不存在的属性
{
  {
    $json.user?.profile?.avatar ?? "默认头像.jpg"
  }
}

// 访问数组中可能不存在的元素
{
  {
    $json.items?.[0]?.name ?? "无商品"
  }
}

// 多级安全访问
{
  {
    $json.api?.response?.data?.users?.[0]?.email ?? "未知邮箱"
  }
}
```

### 动态属性访问

```javascript
// 根据变量名访问属性
{
  {
    $json[$vars.fieldName]
  }
}

// 根据索引访问数组
{
  {
    $json.items[$vars.currentIndex]
  }
}

// 构建动态属性路径
{
  {
    $json.config[$vars.environment + "_settings"]
  }
}
```

## 🔢 数值计算

### 基础计算

```javascript
// 计算总价
{
  {
    $json.price * $json.quantity
  }
}

// 计算含税价格
{
  {
    $json.price * (1 + $json.taxRate)
  }
}

// 计算折扣后价格
{
  {
    $json.originalPrice * (1 - $json.discountRate)
  }
}

// 计算平均值
{
  {
    ;($json.score1 + $json.score2 + $json.score3) / 3
  }
}
```

### 高级计算

```javascript
// 计算数组总和
{
  {
    $json.items.reduce((sum, item) => sum + item.price, 0)
  }
}

// 计算数组平均值
{
  {
    $json.scores.reduce((sum, score) => sum + score, 0) / $json.scores.length
  }
}

// 计算百分比
{
  {
    ;(($json.completed / $json.total) * 100).toFixed(2) + "%"
  }
}

// 计算增长率
{
  {
    ;((($json.currentValue - $json.previousValue) / $json.previousValue) * 100).toFixed(1) + "%"
  }
}
```

### 数值格式化

```javascript
// 保留2位小数
{
  {
    $json.amount.toFixed(2)
  }
}

// 千分位分隔符
{
  {
    $json.amount.toLocaleString()
  }
}

// 货币格式
{
  {
    "¥" + $json.price.toFixed(2)
  }
}

// 四舍五入
{
  {
    Math.round($json.value * 100) / 100
  }
}
```

## 📝 字符串处理

### 字符串基础操作

```javascript
// 字符串拼接
{
  {
    $json.firstName + " " + $json.lastName
  }
}

// 字符串模板
{
  {
    ;`用户${$json.name}的订单#${$json.orderId}已发货`
  }
}

// 转换大小写
{
  {
    $json.email.toLowerCase()
  }
}
{
  {
    $json.name.toUpperCase()
  }
}

// 首字母大写
{
  {
    $json.name.charAt(0).toUpperCase() + $json.name.slice(1).toLowerCase()
  }
}
```

### 字符串查找与替换

```javascript
// 检查是否包含
{
  {
    $json.message.includes("紧急") ? "高优先级" : "普通"
  }
}

// 查找位置
{
  {
    $json.email.indexOf("@")
  }
}

// 替换文本
{
  {
    $json.content.replace("旧文本", "新文本")
  }
}

// 移除空格
{
  {
    $json.input.trim()
  }
}
```

### 字符串分割与连接

```javascript
// 按分隔符分割
{
  {
    $json.tags.split(",")
  }
}

// 获取文件扩展名
{
  {
    $json.filename.split(".").pop()
  }
}

// 数组连接为字符串
{
  {
    $json.keywords.join(", ")
  }
}

// 提取子字符串
{
  {
    $json.description.substring(0, 50) + "..."
  }
}
```

## 📅 日期时间处理

### 当前时间

```javascript
// 当前日期（YYYY-MM-DD）
{
  {
    $now.toFormat("yyyy-MM-dd")
  }
}

// 当前时间（HH:mm:ss）
{
  {
    $now.toFormat("HH:mm:ss")
  }
}

// 完整日期时间
{
  {
    $now.toFormat("yyyy-MM-dd HH:mm:ss")
  }
}

// 中文日期格式
{
  {
    $now.toFormat("yyyy年MM月dd日")
  }
}
```

### 日期计算

```javascript
// 7天后
{
  {
    $now.plus({ days: 7 }).toFormat("yyyy-MM-dd")
  }
}

// 1个月前
{
  {
    $now.minus({ months: 1 }).toFormat("yyyy-MM-dd")
  }
}

// 明年同一天
{
  {
    $now.plus({ years: 1 }).toFormat("yyyy-MM-dd")
  }
}

// 本周末
{
  {
    $now.endOf("week").toFormat("yyyy-MM-dd")
  }
}
```

### 时间差计算

```javascript
// 距离现在多少天
{
  {
    Math.floor($now.diff($json.startDate, "days"))
  }
}

// 距离现在多少小时
{
  {
    Math.floor($now.diff($json.createTime, "hours"))
  }
}

// 年龄计算
{
  {
    Math.floor($now.diff($json.birthDate, "years"))
  }
}

// 是否是今天
{
  {
    $now.hasSame($json.eventDate, "day") ? "今天" : "其他日期"
  }
}
```

### 日期格式化

```javascript
// 相对时间描述
{
  {
    $now.diff($json.lastLoginTime, "days") < 1
      ? "今天登录"
      : $now.diff($json.lastLoginTime, "days") + "天前登录"
  }
}

// 星期几
{
  {
    ;["周日", "周一", "周二", "周三", "周四", "周五", "周六"][$now.weekday % 7]
  }
}

// 季度
{
  {
    "第" + $now.quarter + "季度"
  }
}

// 是否工作日
{
  {
    $now.weekday <= 5 ? "工作日" : "周末"
  }
}
```

## 🔍 条件判断

### 简单条件

```javascript
// 年龄判断
{
  {
    $json.age >= 18 ? "成年" : "未成年"
  }
}

// 状态判断
{
  {
    $json.status === "active" ? "已激活" : "未激活"
  }
}

// VIP判断
{
  {
    $json.membership === "vip" ? "VIP用户" : "普通用户"
  }
}

// 库存判断
{
  {
    $json.stock > 0 ? "有库存" : "缺货"
  }
}
```

### 复杂条件

```javascript
// 多重条件
{
  {
    $json.age >= 65 ? "老年人" : $json.age >= 18 ? "成年人" : $json.age >= 13 ? "青少年" : "儿童"
  }
}

// 成绩等级
{
  {
    $json.score >= 90
      ? "A"
      : $json.score >= 80
        ? "B"
        : $json.score >= 70
          ? "C"
          : $json.score >= 60
            ? "D"
            : "F"
  }
}

// 组合条件
{
  {
    $json.age >= 18 && $json.verified ? "可操作" : "需要验证"
  }
}

// 范围判断
{
  {
    $json.temperature >= 20 && $json.temperature <= 26 ? "舒适" : "不适"
  }
}
```

### 数据验证

```javascript
// 邮箱格式验证
{
  {
    ;/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($json.email) ? "邮箱格式正确" : "邮箱格式错误"
  }
}

// 手机号验证
{
  {
    ;/^1[3-9]\d{9}$/.test($json.phone) ? "手机号正确" : "手机号错误"
  }
}

// 必填字段验证
{
  {
    $json.name && $json.email && $json.phone ? "信息完整" : "信息不完整"
  }
}

// 数值范围验证
{
  {
    $json.age >= 0 && $json.age <= 120 ? "年龄有效" : "年龄无效"
  }
}
```

## 📊 数组处理

### 数组基础操作

```javascript
// 数组长度
{
  {
    $json.items.length
  }
}

// 第一个元素
{
  {
    $json.items[0]
  }
}

// 最后一个元素
{
  {
    $json.items[$json.items.length - 1]
  }
}

// 检查是否包含
{
  {
    $json.tags.includes("重要") ? "重要任务" : "普通任务"
  }
}
```

### 数组筛选

```javascript
// 筛选成年用户
{
  {
    $json.users.filter((user) => user.age >= 18)
  }
}

// 筛选活跃状态
{
  {
    $json.products.filter((product) => product.status === "active")
  }
}

// 筛选价格范围
{
  {
    $json.items.filter((item) => item.price >= 100 && item.price <= 500)
  }
}

// 筛选今天的数据
{
  {
    $json.orders.filter((order) => $now.hasSame(order.createTime, "day"))
  }
}
```

### 数组转换

```javascript
// 提取特定字段
{
  {
    $json.users.map((user) => user.name)
  }
}

// 格式化数据
{
  {
    $json.products.map((product) => `${product.name}: ¥${product.price}`)
  }
}

// 计算数据
{
  {
    $json.orders.map((order) => order.quantity * order.price)
  }
}

// 转换为键值对
{
  {
    $json.items.map((item) => ({ id: item.id, label: item.name }))
  }
}
```

### 数组聚合

```javascript
// 查找特定项
{
  {
    $json.users.find((user) => user.id === $vars.targetUserId)
  }
}

// 计算总和
{
  {
    $json.items.reduce((sum, item) => sum + item.amount, 0)
  }
}

// 查找最大值
{
  {
    Math.max(...$json.scores)
  }
}

// 查找最小值
{
  {
    Math.min(...$json.prices)
  }
}
```

## 🏷 标签和分类

### 状态标签

```javascript
// 订单状态
{
  {
    $json.orderStatus === "pending"
      ? "🕐 处理中"
      : $json.orderStatus === "shipped"
        ? "🚚 已发货"
        : $json.orderStatus === "delivered"
          ? "✅ 已送达"
          : $json.orderStatus === "cancelled"
            ? "❌ 已取消"
            : "❓ 未知状态"
  }
}

// 优先级标签
{
  {
    $json.priority === "high"
      ? "🔴 高优先级"
      : $json.priority === "medium"
        ? "🟡 中优先级"
        : "🟢 低优先级"
  }
}

// 用户等级
{
  {
    $json.points >= 10000
      ? "💎 钻石会员"
      : $json.points >= 5000
        ? "🥇 金牌会员"
        : $json.points >= 1000
          ? "🥈 银牌会员"
          : "🥉 普通会员"
  }
}
```

### 动态分类

```javascript
// 根据销量分类
{
  {
    $json.sales >= 1000 ? "热销" : $json.sales >= 100 ? "畅销" : "一般"
  }
}

// 根据评分分类
{
  {
    $json.rating >= 4.5
      ? "优秀"
      : $json.rating >= 3.5
        ? "良好"
        : $json.rating >= 2.5
          ? "一般"
          : "差评"
  }
}

// 根据时间分类
{
  {
    $now.diff($json.createTime, "hours") < 24
      ? "今日新增"
      : $now.diff($json.createTime, "days") < 7
        ? "本周新增"
        : "历史数据"
  }
}
```

## 🔗 URL和链接构建

### API端点构建

```javascript
// RESTful API
{
  {
    $vars.apiBase + "/users/" + $json.userId
  }
}

// 带查询参数
{
  {
    $vars.apiBase + "/search?q=" + encodeURIComponent($json.keyword) + "&page=" + $vars.page
  }
}

// 复杂查询参数
{
  {
    $vars.apiBase +
      "/products?" +
      "category=" +
      $json.category +
      "&minPrice=" +
      $json.minPrice +
      "&maxPrice=" +
      $json.maxPrice
  }
}
```

### 前端路由

```javascript
// 用户详情页
{
  {
    "/users/" + $json.userId + "/profile"
  }
}

// 带查询参数的页面
{
  {
    "/search?type=" + $json.type + "&keyword=" + encodeURIComponent($json.keyword)
  }
}

// 条件路由
{
  {
    $json.userType === "admin" ? "/admin/dashboard" : "/user/dashboard"
  }
}
```

## 📧 消息和通知

### 邮件内容

```javascript
// 欢迎邮件
{
  {
    ;`亲爱的${$json.user.name}，欢迎加入我们！您的账户已于${$now.toFormat("yyyy-MM-dd")}成功创建。`
  }
}

// 订单确认
{
  {
    ;`您的订单#${$json.orderId}已确认，总金额¥${$json.totalAmount}，预计${$json.estimatedDelivery}送达。`
  }
}

// 密码重置
{
  {
    ;`您好${$json.username}，请点击以下链接重置密码：${$vars.resetUrl}?token=${$json.resetToken}`
  }
}
```

### 推送消息

```javascript
// 系统通知
{
  {
    $json.type === "warning"
      ? "⚠️ "
      : $json.type === "error"
        ? "❌ "
        : $json.type === "success"
          ? "✅ "
          : "ℹ️ "
  }
}
;+$json.message

// 活动提醒
{
  {
    ;`${$json.eventName}将于${$json.startTime.toFormat("MM月dd日 HH:mm")}开始，请准时参加！`
  }
}

// 审批通知
{
  {
    ;`您的${$json.requestType}申请已${$json.status === "approved" ? "通过" : "驳回"}，处理人：${$json.reviewer}`
  }
}
```

## 🎨 UI显示优化

### 文本截断

```javascript
// 标题截断
{
  {
    $json.title.length > 20 ? $json.title.substring(0, 20) + "..." : $json.title
  }
}

// 描述预览
{
  {
    $json.description?.substring(0, 100) + ($json.description?.length > 100 ? "..." : "")
  }
}

// 智能截断（按词截断）
{
  {
    $json.content.split(" ").slice(0, 10).join(" ") +
      ($json.content.split(" ").length > 10 ? "..." : "")
  }
}
```

### 数据展示

```javascript
// 文件大小格式化
{
  {
    $json.fileSize > 1048576
      ? ($json.fileSize / 1048576).toFixed(1) + "MB"
      : $json.fileSize > 1024
        ? ($json.fileSize / 1024).toFixed(1) + "KB"
        : $json.fileSize + "B"
  }
}

// 数量显示优化
{
  {
    $json.count > 999 ? "999+" : $json.count.toString()
  }
}

// 百分比显示
{
  {
    Math.round($json.progress * 100) + "%"
  }
}
```

### 状态图标

```javascript
// 连接状态
{
  {
    $json.isOnline ? "🟢 在线" : "🔴 离线"
  }
}

// 任务状态
{
  {
    $json.completed ? "✅ 已完成" : "⏳ 进行中"
  }
}

// 验证状态
{
  {
    $json.verified ? "✅ 已验证" : "❌ 未验证"
  }
}
```

## 🔐 数据脱敏

### 敏感信息处理

```javascript
// 手机号脱敏
{
  {
    $json.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
  }
}

// 邮箱脱敏
{
  {
    $json.email.replace(/(.{2}).+(@.+)/, "$1****$2")
  }
}

// 身份证脱敏
{
  {
    $json.idCard.replace(/(\d{6})\d{8}(\d{4})/, "$1********$2")
  }
}

// 银行卡脱敏
{
  {
    "**** **** **** " + $json.bankCard.slice(-4)
  }
}
```

## 🎯 实用技巧

### 默认值处理

```javascript
// 多级默认值
{
  {
    $json.config?.theme ?? $vars.defaultTheme ?? "light"
  }
}

// 数组默认值
{
  {
    $json.items?.length > 0 ? $json.items : []
  }
}

// 对象默认值
{
  {
    $json.settings ?? {}
  }
}
```

### 类型转换

```javascript
// 字符串转数字
{
  {
    Number($json.stringNumber) || 0
  }
}

// 数字转字符串
{
  {
    $json.number.toString()
  }
}

// 布尔转换
{
  {
    Boolean($json.value)
  }
}

// 安全的JSON解析
{
  {
    ;(() => {
      try {
        return JSON.parse($json.jsonString)
      } catch {
        return {}
      }
    })()
  }
}
```

### 性能优化

```javascript
// 避免重复计算
{
  {
    ;(() => {
      const total = $json.items.reduce((sum, item) => sum + item.price, 0)
      return total > 1000 ? "高价值订单" : "普通订单"
    })()
  }
}

// 短路求值
{
  {
    $json.items?.length && $json.items[0].name
  }
}
```

---

这些示例涵盖了日常workflow开发中的大部分使用场景。建议收藏本页面，在需要时快速查找和使用！

下一步推荐学习：[变量使用指南](./variables-guide.md) 了解更多内置变量的详细用法。
