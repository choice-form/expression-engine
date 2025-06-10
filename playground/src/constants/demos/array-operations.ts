export const arrayOperationsDemo = {
  title: "🔤 数组操作与连接",
  category: "数组处理",
  expression:
    '{{ $json.user.name }}的技能：{{ $json.user.skills.join("、") }}（{{ $json.user.skills.length }}项）',
  description: "数组转字符串和长度计算",
  jsonData: `{
  "user": {
    "name": "张三",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"]
  }
}`,
  varsData: `{}`,
}
