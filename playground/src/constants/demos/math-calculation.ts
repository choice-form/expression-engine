export const mathCalculationDemo = {
  title: "🔢 数学计算与格式化",
  category: "数学运算",
  expression:
    "总预算：¥{{ Math.round($json.projects.map(p => p.budget).reduce((a, b) => a + b) / 10000) }}万元",
  description: "数组聚合计算和数值格式化",
  jsonData: `{
  "projects": [
    { "name": "项目A", "budget": 1500000 },
    { "name": "项目B", "budget": 2500000 },
    { "name": "项目C", "budget": 1000000 }
  ]
}`,
  varsData: `{}`,
}
