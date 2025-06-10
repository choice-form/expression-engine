export const dataFilteringDemo = {
  title: "🔍 数据过滤与筛选",
  category: "数据过滤",
  expression:
    '高优先级项目：{{ $json.projects.filter(p => p.priority === "high").map(p => p.name).join("、") || "无" }}',
  description: "数组过滤和映射操作",
  jsonData: `{
  "projects": [
    { "name": "电商平台升级", "priority": "high" },
    { "name": "AI智能客服", "priority": "medium" },
    { "name": "数据安全加固", "priority": "high" },
    { "name": "移动端优化", "priority": "low" }
  ]
}`,
  varsData: `{}`,
}
