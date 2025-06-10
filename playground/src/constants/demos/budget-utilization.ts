export const budgetUtilizationDemo = {
  title: "💵 预算使用率分析",
  category: "预算管理",
  expression:
    "预算使用率：{{ Math.round($json.projects.filter(p => p.spent > 0).map(p => p.spent / p.budget * 100).reduce((a,b) => a+b) / $json.projects.filter(p => p.spent > 0).length) }}%",
  description: "百分比计算和平均值",
  jsonData: `{
  "projects": [
    { "name": "项目A", "budget": 1500000, "spent": 1350000 },
    { "name": "项目B", "budget": 2500000, "spent": 800000 },
    { "name": "项目C", "budget": 1000000, "spent": 0 }
  ]
}`,
  varsData: `{}`,
}
