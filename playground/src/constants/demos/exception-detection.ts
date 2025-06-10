export const exceptionDetectionDemo = {
  title: "⚠️ 异常检测示例",
  category: "异常监控",
  expression:
    '{{ $json.value > $vars.threshold.max ? "❌异常过高" : $json.value < $vars.threshold.min ? "❌异常过低" : "✅正常范围" }}（当前值：{{ $json.value }}）',
  description: "阈值范围检测",
  jsonData: `{
  "value": 95
}`,
  varsData: `{
  "threshold": {
    "min": 0,
    "max": 100
  }
}`,
}
