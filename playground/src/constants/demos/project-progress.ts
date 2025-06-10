export const projectProgressDemo = {
  title: "📋 项目进度统计",
  category: "项目管理",
  expression:
    '项目总数：{{ $json.projects.length }}，完成{{ $json.projects.filter(p => p.status === "completed").length }}个，进行中{{ $json.projects.filter(p => p.status === "in-progress").length }}个',
  description: "状态统计和计数",
  jsonData: `{
  "projects": [
    { "name": "项目A", "status": "completed" },
    { "name": "项目B", "status": "in-progress" },
    { "name": "项目C", "status": "completed" },
    { "name": "项目D", "status": "in-progress" },
    { "name": "项目E", "status": "planning" }
  ]
}`,
  varsData: `{}`,
}
