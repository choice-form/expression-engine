export const userStatusDemo = {
  title: "🔐 用户状态检查",
  category: "权限管理",
  expression:
    '账户状态：{{ $json.user.isActive ? "✅活跃" : "❌停用" }}，等级：{{ $json.user.level }}，{{ $json.user.isVip ? "VIP用户" : "普通用户" }}',
  description: "布尔逻辑和用户状态",
  jsonData: `{
  "user": {
    "name": "张三",
    "isActive": true,
    "level": "senior",
    "isVip": false
  }
}`,
  varsData: `{}`,
}
