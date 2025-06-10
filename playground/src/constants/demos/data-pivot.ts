export const dataPivotDemo = {
  title: "📊 数据透视分析",
  category: "数据分析",
  expression:
    '月度收入：{{ $json.monthlyRevenue.map((r, i) => `${i+1}月: ¥${Math.round(r/10000)}万`).slice(-3).join("，") }}',
  description: "数组索引和数据透视",
  jsonData: `{
  "monthlyRevenue": [400000, 450000, 520000, 480000, 510000, 490000]
}`,
  varsData: `{}`,
}
