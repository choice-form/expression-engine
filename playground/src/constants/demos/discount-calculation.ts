export const discountCalculationDemo = {
  title: "🎁 折扣计算逻辑",
  category: "电商计算",
  expression:
    '{{ $json.user.isVip ? "VIP专享9.5折" : $json.order.amount > 1000000 ? "大客户9.8折" : "标准价格" }}',
  description: "多级折扣逻辑",
  jsonData: `{
  "user": {
    "isVip": false
  },
  "order": {
    "amount": 1500000
  }
}`,
  varsData: `{}`,
}
