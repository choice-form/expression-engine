export const stringTemplateDemo = {
  title: "🎨 字符串模板构建",
  category: "模板应用",
  expression: '{{ "【" + "通知" + "】" + "系统升级" + " - " + $json.company.name }}',
  description: "字符串拼接和模板构建",
  jsonData: `{
  "company": {
    "name": "创新科技有限公司"
  }
}`,
  varsData: `{}`,
}
