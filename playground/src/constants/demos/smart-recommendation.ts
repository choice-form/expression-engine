export const smartRecommendationDemo = {
  title: "💡 智能推荐逻辑",
  category: "推荐算法",
  expression:
    '推荐：{{ $json.skills.includes("TypeScript") && $json.skills.includes("React") ? "全栈开发课程" : "基础编程课程" }}',
  description: "基于条件的智能推荐",
  jsonData: `{
  "skills": ["JavaScript", "TypeScript", "React", "Node.js"]
}`,
  varsData: `{}`,
}

export default smartRecommendationDemo
