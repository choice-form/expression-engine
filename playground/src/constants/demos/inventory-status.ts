export const inventoryStatusDemo = {
  title: "📦 库存状态检查",
  category: "库存管理",
  expression:
    '库存状态：{{ $json.stock > $json.minStock ? "充足✅" : "不足⚠️" }}（剩余{{ $json.stock }}件）',
  description: "库存预警逻辑",
  jsonData: `{
  "stock": 500,
  "minStock": 50,
  "productName": "企业版许可证"
}`,
  varsData: `{}`,
}
