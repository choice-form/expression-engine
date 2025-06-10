export const formValidationDemo = {
  title: "📋 表单验证逻辑",
  category: "表单处理",
  expression:
    '验证结果：{{ $json.form.email.includes("@") && $json.form.password.length >= 8 ? "✅表单有效" : "❌表单无效" }}',
  description: "表单字段验证",
  jsonData: `{
  "form": {
    "email": "user@example.com",
    "password": "password123"
  }
}`,
  varsData: `{}`,
}
