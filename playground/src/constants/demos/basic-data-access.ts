export const basicDataAccessDemo = {
  title: "🧑 基础数据访问",
  category: "基础操作",
  expression: "{{ $json.user.name }}（{{ $json.user.age }}岁）来自{{ $json.user.city }}",
  description: "访问嵌套对象属性",
  jsonData: `{
  "user": {
    "name": "张三",
    "age": 28,
    "city": "北京"
  }
}`,
  varsData: `{}`,
}
