export const performanceTestingDemo = {
  title: "🚀 性能测试用例",
  category: "性能测试",
  expression:
    '{{ $json.metrics.loadTime < 2000 ? "⚡性能优秀" : $json.metrics.loadTime < 5000 ? "⚠️性能一般" : "❌性能较差" }}（{{ $json.metrics.loadTime }}ms）',
  description: "性能等级评估",
  jsonData: `{
  "metrics": {
    "loadTime": 1500,
    "memoryUsage": 45.2
  }
}`,
  varsData: `{}`,
}
