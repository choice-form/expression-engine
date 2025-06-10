export const contactFormattingDemo = {
  title: "📞 联系方式格式化",
  category: "数据格式化",
  expression:
    '联系方式：{{ $json.user.email }}，{{ $json.user.phone }}{{ $json.user.wechat ? "，微信：" + $json.user.wechat : "" }}',
  description: "条件性数据拼接",
  jsonData: `{
  "user": {
    "email": "zhangsan@example.com",
    "phone": "+86-138-0013-8000",
    "wechat": "zhangsan_wx"
  }
}`,
  varsData: `{}`,
}
