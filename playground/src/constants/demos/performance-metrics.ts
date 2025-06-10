export const performanceMetricsDemo = {
  title: "⚡ 性能指标计算",
  category: "性能分析",
  expression:
    "转化率：{{ Math.round($json.metrics.conversion * 10000) / 100 }}%，跳出率：{{ Math.round($json.metrics.bounceRate * 1000) / 10 }}%",
  description: "小数精度控制和百分比",
  jsonData: `{
  "metrics": {
    "conversion": 0.12,
    "bounceRate": 0.32
  }
}`,
  varsData: `{}`,
}
