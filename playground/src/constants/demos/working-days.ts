export const workingDaysDemo = {
  title: "🗓️ 工作日计算",
  category: "日期计算",
  expression:
    "本月工作日：{{ $vars.workingDaysPerMonth }}天，总工时：{{ $vars.workingDaysPerMonth * $vars.workingHoursPerDay }}小时",
  description: "工作时间计算",
  jsonData: `{}`,
  varsData: `{
  "workingDaysPerMonth": 22,
  "workingHoursPerDay": 8
}`,
}
