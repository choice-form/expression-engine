export const complexSearchDemo = {
  title: "🔍 复杂搜索逻辑",
  category: "搜索算法",
  expression:
    '搜索结果：{{ $json.items.filter(item => item.category === "tech" && item.price < 10000).length }}个产品符合条件',
  description: "多条件组合搜索",
  jsonData: `{
  "items": [
    { "name": "笔记本电脑", "category": "tech", "price": 8000 },
    { "name": "手机", "category": "tech", "price": 5000 },
    { "name": "办公桌", "category": "furniture", "price": 1500 }
  ]
}`,
  varsData: `{}`,
}
