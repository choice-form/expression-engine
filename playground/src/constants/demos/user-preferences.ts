export const userPreferencesDemo = {
  title: "🌍 用户偏好设置",
  category: "国际化",
  expression:
    '用户偏好：{{ $json.preferences.language === "zh-CN" ? "中文界面" : "英文界面" }}，{{ $json.preferences.theme }}主题',
  description: "用户偏好和本地化",
  jsonData: `{
  "preferences": {
    "language": "zh-CN",
    "theme": "dark",
    "notifications": true
  }
}`,
  varsData: `{}`,
}

export default userPreferencesDemo
