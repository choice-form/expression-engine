export const apiResponseDemo = {
  title: "🌐 API响应格式化",
  category: "API数据",
  expression:
    '系统版本：{{ $json.version }}{{ $json.environment === "production" ? "" : "（" + $json.environment + "）" }}',
  description: "环境标识和版本信息",
  jsonData: `{
  "version": "2.1.0",
  "environment": "production"
}`,
  varsData: `{}`,
}
