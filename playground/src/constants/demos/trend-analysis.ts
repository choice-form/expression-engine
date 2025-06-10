export const trendAnalysisDemo = {
  title: "📈 趋势分析显示",
  category: "趋势分析",
  expression:
    '{{ $json.data[1] > $json.data[0] ? "📈上升" : "📉下降" }}趋势，变化率{{ Math.round(($json.data[1] - $json.data[0]) / $json.data[0] * 100) }}%',
  description: "趋势比较和百分比计算",
  jsonData: `{
  "data": [85000, 92000]
}`,
  varsData: `{}`,
}
