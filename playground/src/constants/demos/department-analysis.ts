export const departmentAnalysisDemo = {
  title: "🏢 部门统计分析",
  category: "组织架构",
  expression:
    "最大部门：{{ $json.departments.reduce((max, dept) => dept.employeeCount > max.employeeCount ? dept : max).name }}（{{ $json.departments.reduce((max, dept) => dept.employeeCount > max.employeeCount ? dept : max).employeeCount }}人）",
  description: "复杂聚合操作和对象比较",
  jsonData: `{
  "departments": [
    { "name": "研发部", "employeeCount": 80 },
    { "name": "市场部", "employeeCount": 25 },
    { "name": "财务部", "employeeCount": 15 }
  ]
}`,
  varsData: `{}`,
}
