export const notificationPriorityDemo = {
  title: "🔔 通知优先级",
  category: "通知系统",
  expression:
    '{{ $json.notification.isUrgent ? "🔴紧急通知" : $json.notification.isImportant ? "🟠重要通知" : "🟢普通通知" }}：{{ $json.notification.message }}',
  description: "多级优先级处理",
  jsonData: `{
  "notification": {
    "message": "系统升级通知",
    "isUrgent": false,
    "isImportant": true
  }
}`,
  varsData: `{}`,
}

export default notificationPriorityDemo
