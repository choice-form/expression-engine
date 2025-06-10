export const dateTimeDemo = {
  title: "📅 日期时间处理",
  category: "日期时间",
  expression:
    '今天是{{ $now.toFormat("yyyy年MM月dd日") }}，用户于{{ DateTime.fromISO($json.user.joinDate).toFormat("yyyy年MM月dd日") }}加入',
  description: "日期格式化和时间计算",
  jsonData: `{
  "user": {
    "name": "张三",
    "joinDate": "2023-06-15"
  }
}`,
  varsData: `{}`,
}
