export const addressDisplayDemo = {
  title: "📍 地址信息显示",
  category: "地理信息",
  expression: "地址：{{ $json.address.city }}，{{ $json.address.country }}",
  description: "地址信息展示",
  jsonData: `{
  "address": {
    "city": "北京",
    "country": "中国"
  }
}`,
  varsData: `{}`,
}
