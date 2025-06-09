/**
 * 完整表达式自动补全建议系统
 * 涵盖引擎所有功能的综合建议数据
 */

// ============================================================================
// 类型定义 (从 expression-suggestions.ts 迁移)
// ============================================================================

export interface ExpressionSuggestion {
  info: SuggestionInfo
  label: string
  rank: number
  section: string
  type: SuggestionType
}

export type SuggestionType =
  | "variable" // 变量: $json, $now
  | "function" // 函数: $if(), DateTime.now()
  | "method" // 方法: .toFormat(), .length
  | "property" // 属性: .year, .month
  | "constant" // 常量: Math.PI

export interface SuggestionInfo {
  deprecated?: boolean
  description: string
  examples: ExpressionExample[]
  parameters?: ParameterInfo[]
  returns?: string
  since?: string
}

export interface ExpressionExample {
  context?: string
  expression: string
  result: string
}

export interface ParameterInfo {
  default?: string
  description: string
  name: string
  required: boolean
  type: string
}

// 编辑器补全格式接口
export interface CodeMirrorCompletion {
  boost: number
  detail: string
  info: string
  label: string
  type: string
}

export interface MonacoCompletion {
  detail: string
  documentation: {
    value: string
  }
  insertText: string
  kind: number
  label: string
  sortText: string
}

// ============================================================================
// 所有28个内置函数 (来自 builtin.ts)
// ============================================================================

export const BUILTIN_FUNCTION_SUGGESTIONS: ExpressionSuggestion[] = [
  // 条件函数
  {
    section: "functions",
    rank: 10,
    label: "$if",
    type: "function",
    info: {
      description: "Conditional function that returns different values based on condition",
      examples: [
        {
          expression: '{{ $if($json.age >= 18, "adult", "minor") }}',
          result: '"adult"',
          context: "Age validation",
        },
      ],
      parameters: [
        {
          name: "condition",
          type: "any",
          description: "Condition to evaluate",
          required: true,
        },
        {
          name: "trueValue",
          type: "any",
          description: "Value when true",
          required: true,
        },
        {
          name: "falseValue",
          type: "any",
          description: "Value when false",
          required: true,
        },
      ],
      returns: "any",
    },
  },
  {
    section: "functions",
    rank: 11,
    label: "$isEmpty",
    type: "function",
    info: {
      description: "Check if value is empty (null, undefined, empty string, or empty array)",
      examples: [
        {
          expression: "{{ $isEmpty($json.name) }}",
          result: "false",
          context: 'When name is "Alice"',
        },
        { expression: "{{ $isEmpty([]) }}", result: "true" },
      ],
      parameters: [
        {
          name: "value",
          type: "any",
          description: "Value to check",
          required: true,
        },
      ],
      returns: "boolean",
    },
  },
  {
    section: "functions",
    rank: 12,
    label: "$isNotEmpty",
    type: "function",
    info: {
      description: "Check if value is not empty",
      examples: [
        {
          expression: "{{ $isNotEmpty($json.tags) }}",
          result: "true",
          context: "When tags has items",
        },
      ],
      parameters: [
        {
          name: "value",
          type: "any",
          description: "Value to check",
          required: true,
        },
      ],
      returns: "boolean",
    },
  },

  // 数组函数
  {
    section: "functions",
    rank: 13,
    label: "$length",
    type: "function",
    info: {
      description: "Get length of array, string, or object",
      examples: [
        {
          expression: "{{ $length($json.items) }}",
          result: "3",
          context: "Array length",
        },
        {
          expression: '{{ $length("hello") }}',
          result: "5",
          context: "String length",
        },
      ],
      parameters: [
        {
          name: "value",
          type: "any",
          description: "Array, string, or object",
          required: true,
        },
      ],
      returns: "number",
    },
  },
  {
    section: "functions",
    rank: 14,
    label: "$keys",
    type: "function",
    info: {
      description: "Get array of object keys",
      examples: [
        {
          expression: "{{ $keys($json.user) }}",
          result: '["name", "age", "email"]',
        },
      ],
      parameters: [
        {
          name: "object",
          type: "object",
          description: "Object to extract keys from",
          required: true,
        },
      ],
      returns: "string[]",
    },
  },
  {
    section: "functions",
    rank: 15,
    label: "$values",
    type: "function",
    info: {
      description: "Get array of object values",
      examples: [
        {
          expression: "{{ $values($json.user) }}",
          result: '["Alice", 30, "alice@example.com"]',
        },
      ],
      parameters: [
        {
          name: "object",
          type: "object",
          description: "Object to extract values from",
          required: true,
        },
      ],
      returns: "any[]",
    },
  },
  {
    section: "functions",
    rank: 16,
    label: "$unique",
    type: "function",
    info: {
      description: "Remove duplicate values from array",
      examples: [{ expression: "{{ $unique([1, 2, 2, 3, 1]) }}", result: "[1, 2, 3]" }],
      parameters: [
        {
          name: "array",
          type: "array",
          description: "Array to remove duplicates from",
          required: true,
        },
      ],
      returns: "any[]",
    },
  },
  {
    section: "functions",
    rank: 17,
    label: "$sort",
    type: "function",
    info: {
      description: "Sort array elements, optionally by object property",
      examples: [
        { expression: "{{ $sort([3, 1, 2]) }}", result: "[1, 2, 3]" },
        {
          expression: '{{ $sort($json.users, "name") }}',
          result: "Sorted by name",
        },
      ],
      parameters: [
        {
          name: "array",
          type: "array",
          description: "Array to sort",
          required: true,
        },
        {
          name: "key",
          type: "string",
          description: "Property key for sorting",
          required: false,
        },
      ],
      returns: "any[]",
    },
  },
  {
    section: "functions",
    rank: 18,
    label: "$filter",
    type: "function",
    info: {
      description: "Filter array elements using predicate function",
      examples: [
        {
          expression: "{{ $filter($json.items, item => item.price > 100) }}",
          result: "Filtered array",
        },
      ],
      parameters: [
        {
          name: "array",
          type: "array",
          description: "Array to filter",
          required: true,
        },
        {
          name: "predicate",
          type: "function",
          description: "Filter function",
          required: true,
        },
      ],
      returns: "any[]",
    },
  },
  {
    section: "functions",
    rank: 19,
    label: "$map",
    type: "function",
    info: {
      description: "Transform array elements using mapper function",
      examples: [
        {
          expression: "{{ $map($json.items, item => item.name) }}",
          result: "Array of names",
        },
      ],
      parameters: [
        {
          name: "array",
          type: "array",
          description: "Array to transform",
          required: true,
        },
        {
          name: "mapper",
          type: "function",
          description: "Transform function",
          required: true,
        },
      ],
      returns: "any[]",
    },
  },
  {
    section: "functions",
    rank: 20,
    label: "$find",
    type: "function",
    info: {
      description: "Find first array element matching predicate",
      examples: [
        {
          expression: "{{ $find($json.users, user => user.id === 123) }}",
          result: "Found user",
        },
      ],
      parameters: [
        {
          name: "array",
          type: "array",
          description: "Array to search",
          required: true,
        },
        {
          name: "predicate",
          type: "function",
          description: "Search function",
          required: true,
        },
      ],
      returns: "any",
    },
  },
  {
    section: "functions",
    rank: 21,
    label: "$groupBy",
    type: "function",
    info: {
      description: "Group array elements by property value",
      examples: [
        {
          expression: '{{ $groupBy($json.products, "category") }}',
          result: "Grouped object",
        },
      ],
      parameters: [
        {
          name: "array",
          type: "array",
          description: "Array to group",
          required: true,
        },
        {
          name: "key",
          type: "string",
          description: "Property key for grouping",
          required: true,
        },
      ],
      returns: "object",
    },
  },

  // 字符串函数
  {
    section: "functions",
    rank: 22,
    label: "$upper",
    type: "function",
    info: {
      description: "Convert string to uppercase",
      examples: [{ expression: "{{ $upper($json.name) }}", result: '"ALICE"' }],
      parameters: [
        {
          name: "string",
          type: "string",
          description: "String to convert",
          required: true,
        },
      ],
      returns: "string",
    },
  },
  {
    section: "functions",
    rank: 23,
    label: "$lower",
    type: "function",
    info: {
      description: "Convert string to lowercase",
      examples: [
        {
          expression: "{{ $lower($json.email) }}",
          result: '"alice@example.com"',
        },
      ],
      parameters: [
        {
          name: "string",
          type: "string",
          description: "String to convert",
          required: true,
        },
      ],
      returns: "string",
    },
  },
  {
    section: "functions",
    rank: 24,
    label: "$capitalize",
    type: "function",
    info: {
      description: "Capitalize first letter of string",
      examples: [
        {
          expression: "{{ $capitalize($json.title) }}",
          result: '"Hello world"',
        },
      ],
      parameters: [
        {
          name: "string",
          type: "string",
          description: "String to capitalize",
          required: true,
        },
      ],
      returns: "string",
    },
  },
  {
    section: "functions",
    rank: 25,
    label: "$trim",
    type: "function",
    info: {
      description: "Remove whitespace from string start and end",
      examples: [{ expression: '{{ $trim("  hello  ") }}', result: '"hello"' }],
      parameters: [
        {
          name: "string",
          type: "string",
          description: "String to trim",
          required: true,
        },
      ],
      returns: "string",
    },
  },
  {
    section: "functions",
    rank: 26,
    label: "$replace",
    type: "function",
    info: {
      description: "Replace all occurrences of search string with replacement",
      examples: [
        {
          expression: '{{ $replace($json.text, "old", "new") }}',
          result: "String with replacements",
        },
      ],
      parameters: [
        {
          name: "string",
          type: "string",
          description: "Source string",
          required: true,
        },
        {
          name: "search",
          type: "string",
          description: "String to find",
          required: true,
        },
        {
          name: "replacement",
          type: "string",
          description: "Replacement string",
          required: true,
        },
      ],
      returns: "string",
    },
  },
  {
    section: "functions",
    rank: 27,
    label: "$split",
    type: "function",
    info: {
      description: "Split string into array using separator",
      examples: [
        {
          expression: '{{ $split($json.tags, ",") }}',
          result: '["tag1", "tag2", "tag3"]',
        },
      ],
      parameters: [
        {
          name: "string",
          type: "string",
          description: "String to split",
          required: true,
        },
        {
          name: "separator",
          type: "string",
          description: "Split separator",
          required: true,
        },
      ],
      returns: "string[]",
    },
  },
  {
    section: "functions",
    rank: 28,
    label: "$join",
    type: "function",
    info: {
      description: "Join array elements into string with separator",
      examples: [
        {
          expression: '{{ $join($json.keywords, " | ") }}',
          result: '"word1 | word2 | word3"',
        },
      ],
      parameters: [
        {
          name: "array",
          type: "array",
          description: "Array to join",
          required: true,
        },
        {
          name: "separator",
          type: "string",
          description: "Join separator",
          required: false,
          default: ",",
        },
      ],
      returns: "string",
    },
  },

  // 数字函数
  {
    section: "functions",
    rank: 29,
    label: "$number",
    type: "function",
    info: {
      description: "Convert value to number with optional decimal places",
      examples: [{ expression: "{{ $number($json.price, 2) }}", result: "29.99" }],
      parameters: [
        {
          name: "value",
          type: "any",
          description: "Value to convert",
          required: true,
        },
        {
          name: "decimals",
          type: "number",
          description: "Decimal places",
          required: false,
        },
      ],
      returns: "number",
    },
  },
  {
    section: "functions",
    rank: 30,
    label: "$random",
    type: "function",
    info: {
      description: "Generate random number between min and max",
      examples: [{ expression: "{{ $random(1, 100) }}", result: "42.7" }],
      parameters: [
        {
          name: "min",
          type: "number",
          description: "Minimum value",
          required: false,
          default: "0",
        },
        {
          name: "max",
          type: "number",
          description: "Maximum value",
          required: false,
          default: "1",
        },
      ],
      returns: "number",
    },
  },
  {
    section: "functions",
    rank: 31,
    label: "$randomInt",
    type: "function",
    info: {
      description: "Generate random integer between min and max",
      examples: [{ expression: "{{ $randomInt(1, 10) }}", result: "7" }],
      parameters: [
        {
          name: "min",
          type: "number",
          description: "Minimum value",
          required: false,
          default: "0",
        },
        {
          name: "max",
          type: "number",
          description: "Maximum value",
          required: false,
          default: "100",
        },
      ],
      returns: "number",
    },
  },

  // 工具函数
  {
    section: "functions",
    rank: 32,
    label: "$uuid",
    type: "function",
    info: {
      description: "Generate UUID v4 string",
      examples: [
        {
          expression: "{{ $uuid() }}",
          result: '"550e8400-e29b-41d4-a716-446655440000"',
        },
      ],
      parameters: [],
      returns: "string",
    },
  },
  {
    section: "functions",
    rank: 33,
    label: "$timestamp",
    type: "function",
    info: {
      description: "Get current timestamp in milliseconds",
      examples: [{ expression: "{{ $timestamp() }}", result: "1717977600000" }],
      parameters: [],
      returns: "number",
    },
  },
  {
    section: "functions",
    rank: 34,
    label: "$formatDate",
    type: "function",
    info: {
      description: "Format timestamp to date string",
      examples: [
        {
          expression: '{{ $formatDate($json.createdAt, "YYYY-MM-DD HH:mm:ss") }}',
          result: '"2025-06-09 10:30:45"',
        },
      ],
      parameters: [
        {
          name: "timestamp",
          type: "number",
          description: "Timestamp to format",
          required: true,
        },
        {
          name: "format",
          type: "string",
          description: "Date format pattern",
          required: false,
          default: "YYYY-MM-DD",
        },
      ],
      returns: "string",
    },
  },
]

// ============================================================================
// 所有8个内置变量
// ============================================================================

export const VARIABLE_SUGGESTIONS: ExpressionSuggestion[] = [
  {
    section: "variables",
    rank: 1,
    label: "$json",
    type: "variable",
    info: {
      description: "Current workflow JSON data",
      examples: [
        {
          expression: "{{ $json.name }}",
          result: '"Alice"',
          context: "Access user name",
        },
        {
          expression: "{{ $json.items[0].price }}",
          result: "29.99",
          context: "Access nested array item",
        },
      ],
      parameters: [],
      returns: "object",
    },
  },
  {
    section: "variables",
    rank: 2,
    label: "$now",
    type: "variable",
    info: {
      description: "Current DateTime object with Luxon methods",
      examples: [
        {
          expression: '{{ $now.toFormat("yyyy-MM-dd") }}',
          result: '"2025-06-09"',
        },
        {
          expression: "{{ $now.plus({days: 7}).toISO() }}",
          result: '"2025-06-16T10:30:45.123Z"',
        },
      ],
      parameters: [],
      returns: "DateTime",
    },
  },
  {
    section: "variables",
    rank: 3,
    label: "$today",
    type: "variable",
    info: {
      description: "Today's date at midnight (start of day)",
      examples: [
        {
          expression: '{{ $today.toFormat("MMMM d, yyyy") }}',
          result: '"June 9, 2025"',
        },
        {
          expression: "{{ $today.weekday }}",
          result: "1",
          context: "Monday is 1",
        },
      ],
      parameters: [],
      returns: "DateTime",
    },
  },
  {
    section: "variables",
    rank: 4,
    label: "$workflow",
    type: "variable",
    info: {
      description: "Current workflow metadata and state",
      examples: [
        { expression: "{{ $workflow.id }}", result: '"wf_123456"' },
        {
          expression: "{{ $workflow.name }}",
          result: '"Data Processing Pipeline"',
        },
      ],
      parameters: [],
      returns: "object",
    },
  },
  {
    section: "variables",
    rank: 5,
    label: "$node",
    type: "variable",
    info: {
      description: "Current node information and context",
      examples: [
        { expression: "{{ $node.name }}", result: '"HTTP Request"' },
        { expression: "{{ $node.index }}", result: "2" },
      ],
      parameters: [],
      returns: "object",
    },
  },
  {
    section: "variables",
    rank: 6,
    label: "$runIndex",
    type: "variable",
    info: {
      description: "Current execution run index (zero-based)",
      examples: [
        { expression: "{{ $runIndex }}", result: "0", context: "First run" },
        {
          expression: "{{ $runIndex + 1 }}",
          result: "1",
          context: "Human-readable run number",
        },
      ],
      parameters: [],
      returns: "number",
    },
  },
  {
    section: "variables",
    rank: 7,
    label: "$itemIndex",
    type: "variable",
    info: {
      description: "Current item index in batch processing (zero-based)",
      examples: [
        {
          expression: "{{ $itemIndex }}",
          result: "2",
          context: "Third item in batch",
        },
        { expression: '{{ "Item " + ($itemIndex + 1) }}', result: '"Item 3"' },
      ],
      parameters: [],
      returns: "number",
    },
  },
  {
    section: "variables",
    rank: 8,
    label: "$input",
    type: "variable",
    info: {
      description: "Input data from previous workflow steps",
      examples: [
        { expression: "{{ $input.all() }}", result: "All input data" },
        {
          expression: "{{ $input.first().name }}",
          result: '"Alice"',
          context: "First input item name",
        },
      ],
      parameters: [],
      returns: "object",
    },
  },
]

// ============================================================================
// DateTime函数（关键Luxon方法）
// ============================================================================

export const DATETIME_SUGGESTIONS: ExpressionSuggestion[] = [
  // 核心DateTime函数
  {
    section: "datetime",
    rank: 1,
    label: "DateTime.now()",
    type: "function",
    info: {
      description: "Create current DateTime object",
      examples: [
        {
          expression: "{{ DateTime.now().toISO() }}",
          result: '"2025-06-09T10:30:45.123Z"',
        },
      ],
      parameters: [],
      returns: "DateTime",
    },
  },
  {
    section: "datetime",
    rank: 2,
    label: "DateTime.fromISO()",
    type: "function",
    info: {
      description: "Parse ISO string to DateTime",
      examples: [
        {
          expression: "{{ DateTime.fromISO($json.createdAt).year }}",
          result: "2025",
        },
      ],
      parameters: [
        {
          name: "isoString",
          type: "string",
          description: "ISO date string",
          required: true,
        },
      ],
      returns: "DateTime",
    },
  },
  {
    section: "datetime",
    rank: 3,
    label: "DateTime.fromSeconds()",
    type: "function",
    info: {
      description: "Create DateTime from Unix timestamp",
      examples: [
        {
          expression: '{{ DateTime.fromSeconds($json.timestamp).toFormat("yyyy-MM-dd") }}',
          result: '"2025-06-09"',
        },
      ],
      parameters: [
        {
          name: "seconds",
          type: "number",
          description: "Unix timestamp in seconds",
          required: true,
        },
      ],
      returns: "DateTime",
    },
  },
  {
    section: "datetime",
    rank: 4,
    label: "DateTime.fromMillis()",
    type: "function",
    info: {
      description: "Create DateTime from milliseconds timestamp",
      examples: [
        {
          expression: '{{ DateTime.fromMillis($json.timestamp).toFormat("HH:mm:ss") }}',
          result: '"10:30:45"',
        },
      ],
      parameters: [
        {
          name: "millis",
          type: "number",
          description: "Timestamp in milliseconds",
          required: true,
        },
      ],
      returns: "DateTime",
    },
  },
  {
    section: "datetime",
    rank: 5,
    label: "DateTime.fromFormat()",
    type: "function",
    info: {
      description: "Parse string with custom format",
      examples: [
        {
          expression: '{{ DateTime.fromFormat($json.date, "MM/dd/yyyy").toISO() }}',
          result: '"2025-06-09T00:00:00.000Z"',
        },
      ],
      parameters: [
        {
          name: "dateString",
          type: "string",
          description: "Date string",
          required: true,
        },
        {
          name: "format",
          type: "string",
          description: "Format pattern",
          required: true,
        },
      ],
      returns: "DateTime",
    },
  },

  // DateTime输出方法
  {
    section: "datetime",
    rank: 10,
    label: ".toFormat()",
    type: "method",
    info: {
      description: "Format DateTime to custom string pattern",
      examples: [
        {
          expression: '{{ $now.toFormat("yyyy-MM-dd HH:mm:ss") }}',
          result: '"2025-06-09 10:30:45"',
        },
        {
          expression: '{{ $now.toFormat("MMMM d, yyyy") }}',
          result: '"June 9, 2025"',
        },
      ],
      parameters: [
        {
          name: "format",
          type: "string",
          description: "Format pattern (yyyy, MM, dd, HH, mm, ss, etc)",
          required: true,
        },
      ],
      returns: "string",
    },
  },
  {
    section: "datetime",
    rank: 11,
    label: ".toISO()",
    type: "method",
    info: {
      description: "Convert to ISO 8601 string",
      examples: [
        {
          expression: "{{ $now.toISO() }}",
          result: '"2025-06-09T10:30:45.123Z"',
        },
      ],
      parameters: [],
      returns: "string",
    },
  },
  {
    section: "datetime",
    rank: 12,
    label: ".toISODate()",
    type: "method",
    info: {
      description: "Convert to ISO date string (YYYY-MM-DD)",
      examples: [{ expression: "{{ $now.toISODate() }}", result: '"2025-06-09"' }],
      parameters: [],
      returns: "string",
    },
  },
  {
    section: "datetime",
    rank: 20,
    label: ".plus()",
    type: "method",
    info: {
      description: "Add duration to DateTime",
      examples: [
        {
          expression: "{{ $now.plus({days: 7, hours: 2}) }}",
          result: "DateTime +7 days +2 hours",
        },
        {
          expression: "{{ $now.plus({months: 1}) }}",
          result: "DateTime +1 month",
        },
      ],
      parameters: [
        {
          name: "duration",
          type: "object",
          description: "Duration object {years, months, days, hours, minutes, seconds}",
          required: true,
        },
      ],
      returns: "DateTime",
    },
  },
  {
    section: "datetime",
    rank: 21,
    label: ".minus()",
    type: "method",
    info: {
      description: "Subtract duration from DateTime",
      examples: [
        {
          expression: "{{ $now.minus({days: 30}) }}",
          result: "DateTime -30 days",
        },
        {
          expression: "{{ $now.minus({hours: 3, minutes: 30}) }}",
          result: "DateTime -3.5 hours",
        },
      ],
      parameters: [
        {
          name: "duration",
          type: "object",
          description: "Duration object",
          required: true,
        },
      ],
      returns: "DateTime",
    },
  },
  {
    section: "datetime",
    rank: 22,
    label: ".startOf()",
    type: "method",
    info: {
      description: "Get start of time unit",
      examples: [
        {
          expression: '{{ $now.startOf("day") }}',
          result: "Today at 00:00:00",
        },
        {
          expression: '{{ $now.startOf("month") }}',
          result: "First day of month",
        },
      ],
      parameters: [
        {
          name: "unit",
          type: "string",
          description: "Time unit: year, month, day, hour, minute, second",
          required: true,
        },
      ],
      returns: "DateTime",
    },
  },
  {
    section: "datetime",
    rank: 30,
    label: ".year",
    type: "property",
    info: {
      description: "Get year number",
      examples: [{ expression: "{{ $now.year }}", result: "2025" }],
      parameters: [],
      returns: "number",
    },
  },
  {
    section: "datetime",
    rank: 31,
    label: ".month",
    type: "property",
    info: {
      description: "Get month number (1-12)",
      examples: [{ expression: "{{ $now.month }}", result: "6", context: "June" }],
      parameters: [],
      returns: "number",
    },
  },
  {
    section: "datetime",
    rank: 32,
    label: ".day",
    type: "property",
    info: {
      description: "Get day of month (1-31)",
      examples: [{ expression: "{{ $now.day }}", result: "9" }],
      parameters: [],
      returns: "number",
    },
  },
  {
    section: "datetime",
    rank: 33,
    label: ".weekday",
    type: "property",
    info: {
      description: "Get weekday number (1=Monday, 7=Sunday)",
      examples: [{ expression: "{{ $now.weekday }}", result: "1", context: "Monday" }],
      parameters: [],
      returns: "number",
    },
  },
]

// ============================================================================
// Math函数
// ============================================================================

export const MATH_SUGGESTIONS: ExpressionSuggestion[] = [
  {
    section: "math",
    rank: 1,
    label: "Math.abs()",
    type: "function",
    info: {
      description: "Get absolute value of number",
      examples: [{ expression: "{{ Math.abs(-5) }}", result: "5" }],
      parameters: [
        {
          name: "value",
          type: "number",
          description: "Number to get absolute value",
          required: true,
        },
      ],
      returns: "number",
    },
  },
  {
    section: "math",
    rank: 2,
    label: "Math.round()",
    type: "function",
    info: {
      description: "Round number to nearest integer",
      examples: [{ expression: "{{ Math.round(4.7) }}", result: "5" }],
      parameters: [
        {
          name: "value",
          type: "number",
          description: "Number to round",
          required: true,
        },
      ],
      returns: "number",
    },
  },
  {
    section: "math",
    rank: 3,
    label: "Math.max()",
    type: "function",
    info: {
      description: "Get maximum value from numbers",
      examples: [{ expression: "{{ Math.max(1, 5, 3) }}", result: "5" }],
      parameters: [
        {
          name: "values",
          type: "number[]",
          description: "Numbers to compare",
          required: true,
        },
      ],
      returns: "number",
    },
  },
  {
    section: "math",
    rank: 4,
    label: "Math.min()",
    type: "function",
    info: {
      description: "Get minimum value from numbers",
      examples: [{ expression: "{{ Math.min(1, 5, 3) }}", result: "1" }],
      parameters: [
        {
          name: "values",
          type: "number[]",
          description: "Numbers to compare",
          required: true,
        },
      ],
      returns: "number",
    },
  },
]

// ============================================================================
// JMESPath函数
// ============================================================================

export const JMESPATH_SUGGESTIONS: ExpressionSuggestion[] = [
  {
    section: "jmespath",
    rank: 1,
    label: "length(@)",
    type: "function",
    info: {
      description: "Get length of array or object",
      examples: [
        {
          expression: '{{ $jmespath($json.items, "length(@)") }}',
          result: "3",
        },
      ],
      parameters: [
        {
          name: "@",
          type: "any",
          description: "Current element reference",
          required: false,
        },
      ],
      returns: "number",
    },
  },
  {
    section: "jmespath",
    rank: 2,
    label: "keys(@)",
    type: "function",
    info: {
      description: "Get object keys as array",
      examples: [
        {
          expression: '{{ $jmespath($json.user, "keys(@)") }}',
          result: '["name", "age"]',
        },
      ],
      parameters: [
        {
          name: "@",
          type: "object",
          description: "Object to get keys from",
          required: false,
        },
      ],
      returns: "string[]",
    },
  },
  {
    section: "jmespath",
    rank: 3,
    label: "sort_by(@, &field)",
    type: "function",
    info: {
      description: "Sort array by object field",
      examples: [
        {
          expression: '{{ $jmespath($json.users, "sort_by(@, &name)") }}',
          result: "Sorted users by name",
        },
      ],
      parameters: [
        {
          name: "@",
          type: "array",
          description: "Array to sort",
          required: true,
        },
        {
          name: "field",
          type: "string",
          description: "Field to sort by (with & prefix)",
          required: true,
        },
      ],
      returns: "array",
    },
  },
]

// ============================================================================
// JavaScript字符串/数组方法
// ============================================================================

export const JAVASCRIPT_SUGGESTIONS: ExpressionSuggestion[] = [
  {
    section: "javascript",
    rank: 1,
    label: ".includes()",
    type: "method",
    info: {
      description: "Check if string/array contains value",
      examples: [
        { expression: '{{ $json.text.includes("hello") }}', result: "true" },
        { expression: '{{ $json.tags.includes("urgent") }}', result: "false" },
      ],
      parameters: [
        {
          name: "searchValue",
          type: "any",
          description: "Value to search for",
          required: true,
        },
      ],
      returns: "boolean",
    },
  },
  {
    section: "javascript",
    rank: 2,
    label: ".indexOf()",
    type: "method",
    info: {
      description: "Find index of value in string/array",
      examples: [{ expression: '{{ $json.text.indexOf("world") }}', result: "6" }],
      parameters: [
        {
          name: "searchValue",
          type: "any",
          description: "Value to find",
          required: true,
        },
      ],
      returns: "number",
    },
  },
  {
    section: "javascript",
    rank: 3,
    label: ".slice()",
    type: "method",
    info: {
      description: "Extract portion of array or string",
      examples: [
        {
          expression: "{{ $json.items.slice(0, 3) }}",
          result: "First 3 items",
        },
        {
          expression: "{{ $json.text.slice(0, 10) }}",
          result: "First 10 chars",
        },
      ],
      parameters: [
        {
          name: "start",
          type: "number",
          description: "Start index",
          required: true,
        },
        {
          name: "end",
          type: "number",
          description: "End index",
          required: false,
        },
      ],
      returns: "any[]",
    },
  },
]

// ============================================================================
// 综合提供者类
// ============================================================================

export class CompleteSuggestionProvider {
  private allSuggestions: ExpressionSuggestion[]

  constructor() {
    this.allSuggestions = [
      ...BUILTIN_FUNCTION_SUGGESTIONS,
      ...VARIABLE_SUGGESTIONS,
      ...DATETIME_SUGGESTIONS,
      ...MATH_SUGGESTIONS,
      ...JMESPATH_SUGGESTIONS,
      ...JAVASCRIPT_SUGGESTIONS,
    ]
  }

  getAllSuggestions(): ExpressionSuggestion[] {
    return this.allSuggestions
  }

  getSuggestionsBySection(section: string): ExpressionSuggestion[] {
    return this.allSuggestions.filter((s) => s.section === section)
  }

  searchSuggestions(query: string): ExpressionSuggestion[] {
    const lowerQuery = query.toLowerCase()

    // 对于$开头的查询，只匹配以$开头的标签
    if (query.startsWith("$")) {
      return this.allSuggestions
        .filter((suggestion) => suggestion.label.toLowerCase().startsWith(lowerQuery))
        .sort((a, b) => a.rank - b.rank)
    }

    // 对于其他查询，在标签和描述中搜索
    return this.allSuggestions
      .filter(
        (suggestion) =>
          suggestion.label.toLowerCase().includes(lowerQuery) ||
          suggestion.info.description.toLowerCase().includes(lowerQuery),
      )
      .sort((a, b) => a.rank - b.rank)
  }

  getSuggestionStats() {
    const bySection = this.allSuggestions.reduce(
      (acc, s) => {
        acc[s.section] = (acc[s.section] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: this.allSuggestions.length,
      bySection,
      sections: Object.keys(bySection),
    }
  }

  // 导出给外部工具（CodeMirror、Monaco等）
  getCodeMirrorCompletions() {
    return this.allSuggestions.map((s) => ({
      label: s.label,
      type: s.type,
      info: s.info.description,
      detail: s.info.examples[0]?.expression || "",
      boost: 100 - s.rank, // 更高的rank = 更低的boost用于排序
    }))
  }

  getMonacoCompletions() {
    return this.allSuggestions.map((s, index) => ({
      label: s.label,
      kind: this.getMonacoKind(s.type),
      insertText: s.label,
      detail: s.info.description,
      documentation: {
        value: this.formatDocumentation(s),
        isTrusted: true,
      },
      sortText: s.rank.toString().padStart(3, "0"),
    }))
  }

  private getMonacoKind(type: SuggestionType): number {
    // Monaco编辑器CompletionItemKind枚举值
    switch (type) {
      case "function":
        return 1 // Function
      case "method":
        return 0 // Method
      case "variable":
        return 5 // Variable
      case "property":
        return 9 // Property
      default:
        return 17 // Text
    }
  }

  private formatDocumentation(suggestion: ExpressionSuggestion): string {
    let doc = `**${suggestion.label}**\n\n${suggestion.info.description}\n\n`

    if (suggestion.info.parameters && suggestion.info.parameters.length > 0) {
      doc += "**Parameters:**\n"
      suggestion.info.parameters.forEach((param) => {
        const required = param.required ? " (required)" : " (optional)"
        doc += `- \`${param.name}\`: ${param.type}${required} - ${param.description}\n`
      })
      doc += "\n"
    }

    if (suggestion.info.examples.length > 0) {
      doc += "**Examples:**\n"
      suggestion.info.examples.forEach((example, index) => {
        doc += `\`\`\`javascript\n${example.expression}\n// Result: ${example.result}\n\`\`\`\n`
        if (example.context) {
          doc += `*${example.context}*\n`
        }
        if (index < suggestion.info.examples.length - 1) doc += "\n"
      })
    }

    return doc
  }
}
