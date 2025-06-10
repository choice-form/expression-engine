export const timeDifferenceDemo = {
  title: "⏱️ 时间差计算",
  category: "时间计算",
  expression:
    '项目耗时：{{ DateTime.fromISO($json.project.endDate).diff(DateTime.fromISO($json.project.startDate)).as("days") }}天',
  description: "日期差值计算",
  jsonData: `{
  "project": {
    "name": "电商平台升级",
    "startDate": "2024-01-01",
    "endDate": "2024-08-31"
  }
}`,
  varsData: `{}`,
}
