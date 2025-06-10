export const stringOperationsDemo = {
  title: "🔤 字符串操作与连接",
  category: "字符串处理",
  expression: '{{ $json.fullName.split(" ")[1] + "同学，您好！" }}',
  description: "字符串分割和拼接",
  jsonData: `{
  "fullName": "张 三"
}`,
  varsData: `{}`,
}
