export const goalAchievementDemo = {
  title: "🎯 目标达成率",
  category: "绩效考核",
  expression:
    '目标达成率：{{ Math.round($json.actual / $json.target * 100) }}%{{ $json.actual >= $json.target ? "🎉已达标" : "" }}',
  description: "达成率计算和状态显示",
  jsonData: `{
  "target": 1000000,
  "actual": 1150000
}`,
  varsData: `{}`,
}
