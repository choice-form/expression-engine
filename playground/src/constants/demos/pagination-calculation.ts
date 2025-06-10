export const paginationCalculationDemo = {
  title: "🔢 分页计算逻辑",
  category: "分页处理",
  expression:
    "第{{ $json.page }}页，共{{ Math.ceil($json.total / $json.pageSize) }}页，显示{{ ($json.page - 1) * $json.pageSize + 1 }}-{{ Math.min($json.page * $json.pageSize, $json.total) }}项",
  description: "分页数据计算",
  jsonData: `{
  "page": 3,
  "pageSize": 10,
  "total": 85
}`,
  varsData: `{}`,
}
