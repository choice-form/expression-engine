export const responsiveDataDemo = {
  title: "📱 响应式数据",
  category: "响应式设计",
  expression:
    '{{ $json.device.width > 1200 ? "桌面端显示" : $json.device.width > 768 ? "平板端显示" : "移动端显示" }}（{{ $json.device.width }}px）',
  description: "响应式断点判断",
  jsonData: `{
  "device": {
    "width": 1024,
    "type": "tablet"
  }
}`,
  varsData: `{}`,
}
