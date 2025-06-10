export const statisticsAnalysisDemo = {
  title: "📈 统计计算与分析",
  category: "统计分析",
  expression:
    "平均分：{{ Math.round($json.scores.reduce((a,b) => a+b) / $json.scores.length) }}，最高分：{{ Math.max(...$json.scores) }}",
  description: "数组统计函数和数学运算",
  jsonData: `{
  "scores": [85, 92, 78, 96, 88]
}`,
  varsData: `{}`,
}
