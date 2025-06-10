export const ratingCalculationDemo = {
  title: "⭐ 评分与等级计算",
  category: "评分系统",
  expression:
    '用户等级：{{ $json.user.level }}{{ $json.scores.reduce((a,b) => a+b) / $json.scores.length >= $vars.grades.excellent ? "⭐⭐⭐" : "⭐⭐" }}',
  description: "评分等级和星级显示",
  jsonData: `{
  "user": {
    "level": "senior"
  },
  "scores": [85, 92, 78, 96, 88]
}`,
  varsData: `{
  "grades": {
    "excellent": 90,
    "good": 75
  }
}`,
}
