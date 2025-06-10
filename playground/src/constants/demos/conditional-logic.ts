export const conditionalLogicDemo = {
  title: "❓ 条件判断与三元运算",
  category: "逻辑控制",
  expression:
    '{{ $json.user.age >= 18 ? "成年人" : "未成年" }}，{{ $json.user.isVip ? "VIP会员" : "普通用户" }}',
  description: "三元运算符和布尔值判断",
  jsonData: `{
  "user": {
    "name": "张三",
    "age": 28,
    "isVip": false
  }
}`,
  varsData: `{}`,
}
