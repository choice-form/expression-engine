export const businessLogicDemo = {
  title: "📊 复杂条件与业务逻辑",
  category: "业务逻辑",
  expression:
    '营收{{ $json.revenue >= $vars.threshold.revenue ? "达标✅" : "未达标❌" }}，增长率{{ Math.round($json.growth * 100) }}%{{ $json.growth > $vars.threshold.growth ? "（超预期）" : "" }}',
  description: "多重条件判断和格式化",
  jsonData: `{
  "revenue": 5000000,
  "growth": 0.15
}`,
  varsData: `{
  "threshold": {
    "revenue": 1000000,
    "growth": 0.1
  }
}`,
}
