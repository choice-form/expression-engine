export const jmespathQueryDemo = {
  title: "🎯 JMESPath 数据查询",
  category: "数据查询",
  expression:
    '进行中项目：{{ jmespath($json, "projects[?status == \\`in-progress\\`].name").join("、") || "无" }}',
  description: "使用JMESPath查询复杂数据结构",
  jsonData: `{
  "projects": [
    { "name": "电商平台", "status": "completed" },
    { "name": "AI客服", "status": "in-progress" },
    { "name": "移动端APP", "status": "in-progress" },
    { "name": "区块链支付", "status": "planning" }
  ]
}`,
  varsData: `{}`,
}
