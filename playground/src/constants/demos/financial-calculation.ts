export const financialCalculationDemo = {
  title: "💰 财务计算与汇率",
  category: "财务计算",
  expression:
    '月收入¥{{ $json.salary.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",") }}，年收入约${{ Math.round($json.salary * 12 / $vars.conversionRates.usdToCny).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",") }}',
  description: "货币格式化和汇率转换",
  jsonData: `{
  "salary": 25000
}`,
  varsData: `{
  "conversionRates": {
    "usdToCny": 7.2
  }
}`,
}
