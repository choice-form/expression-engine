export const statusMappingDemo = {
  title: "🔄 状态流转映射",
  category: "状态管理",
  expression:
    '项目状态：{{ $json.projects.map(p => p.name + "(" + (p.status === "completed" ? "已完成" : p.status === "in-progress" ? "进行中" : "计划中") + ")").join("，") }}',
  description: "状态码转中文显示",
  jsonData: `{
  "projects": [
    { "name": "电商平台", "status": "completed" },
    { "name": "AI客服", "status": "in-progress" },
    { "name": "移动端", "status": "planning" }
  ]
}`,
  varsData: `{}`,
}
