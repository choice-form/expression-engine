/**
 * 抽象语法树 (AST) 类型定义
 */

// ============================================================================
// AST 节点基础类型
// ============================================================================

export interface ASTNodeBase {
  end: number
  raw?: string
  start: number
  type: string // 原始代码文本
}

// ============================================================================
// 表达式节点
// ============================================================================

export interface ExpressionNode extends ASTNodeBase {
  body: StatementNode | ExpressionStatementNode
  complexity?: number
  type: "Expression"
}

export interface ExpressionStatementNode extends ASTNodeBase {
  expression: AnyExpressionNode
  type: "ExpressionStatement"
}

// ============================================================================
// 字面量节点
// ============================================================================

export interface LiteralNode extends ASTNodeBase {
  type: "Literal"
  value: string | number | boolean | null
  valueType: "string" | "number" | "boolean" | "null"
}

export interface StringLiteralNode extends ASTNodeBase {
  quote: '"' | "'" | "`"
  type: "StringLiteral"
  value: string
}

export interface NumericLiteralNode extends ASTNodeBase {
  raw: string
  type: "NumericLiteral"
  value: number
}

export interface BooleanLiteralNode extends ASTNodeBase {
  type: "BooleanLiteral"
  value: boolean
}

export interface NullLiteralNode extends ASTNodeBase {
  type: "NullLiteral"
  value: null
}

// ============================================================================
// 标识符和变量访问
// ============================================================================

export interface IdentifierNode extends ASTNodeBase {
  isVariable?: boolean
  name: string
  type: "Identifier" // 是否是内置变量 ($json, $vars 等)
}

export interface MemberExpressionNode extends ASTNodeBase {
  computed: boolean
  object: AnyExpressionNode
  // true for obj[prop], false for obj.prop
  optional?: boolean
  property: AnyExpressionNode
  type: "MemberExpression" // for optional chaining obj?.prop
}

// ============================================================================
// 二元和一元运算
// ============================================================================

export interface BinaryExpressionNode extends ASTNodeBase {
  left: AnyExpressionNode
  operator: BinaryOperator
  right: AnyExpressionNode
  type: "BinaryExpression"
}

export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "**" // 算术运算符
  | "=="
  | "!="
  | "==="
  | "!==" // 比较运算符
  | "<"
  | "<="
  | ">"
  | ">=" // 关系运算符
  | "&&"
  | "||" // 逻辑运算符
  | "??"
  | "&"
  | "|"
  | "^" // 位运算和空值合并

export interface UnaryExpressionNode extends ASTNodeBase {
  argument: AnyExpressionNode
  operator: UnaryOperator
  prefix: boolean
  type: "UnaryExpression"
}

export type UnaryOperator = "+" | "-" | "!" | "~" | "typeof" | "void" | "delete"

// ============================================================================
// 函数调用
// ============================================================================

export interface CallExpressionNode extends ASTNodeBase {
  arguments: AnyExpressionNode[]
  callee: AnyExpressionNode
  optional?: boolean
  type: "CallExpression" // for optional chaining func?.()
}

// ============================================================================
// 条件表达式
// ============================================================================

export interface ConditionalExpressionNode extends ASTNodeBase {
  alternate: AnyExpressionNode
  consequent: AnyExpressionNode
  test: AnyExpressionNode
  type: "ConditionalExpression"
}

// ============================================================================
// 数组和对象
// ============================================================================

export interface ArrayExpressionNode extends ASTNodeBase {
  elements: (AnyExpressionNode | null)[]
  type: "ArrayExpression" // null for holes like [1,,3]
}

export interface ObjectExpressionNode extends ASTNodeBase {
  properties: ObjectPropertyNode[]
  type: "ObjectExpression"
}

export interface ObjectPropertyNode extends ASTNodeBase {
  computed: boolean
  key: AnyExpressionNode
  shorthand?: boolean
  type: "ObjectProperty"
  value: AnyExpressionNode // for {a} instead of {a: a}
}

// ============================================================================
// 赋值表达式
// ============================================================================

export interface AssignmentExpressionNode extends ASTNodeBase {
  left: AnyExpressionNode
  operator: AssignmentOperator
  right: AnyExpressionNode
  type: "AssignmentExpression"
}

export type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "**="

// ============================================================================
// 逻辑表达式
// ============================================================================

export interface LogicalExpressionNode extends ASTNodeBase {
  left: AnyExpressionNode
  operator: LogicalOperator
  right: AnyExpressionNode
  type: "LogicalExpression"
}

export type LogicalOperator = "&&" | "||" | "??"

// ============================================================================
// 更新表达式 (++, --)
// ============================================================================

export interface UpdateExpressionNode extends ASTNodeBase {
  argument: AnyExpressionNode
  operator: "++" | "--"
  prefix: boolean
  type: "UpdateExpression"
}

// ============================================================================
// 箭头函数 (for immediate execution)
// ============================================================================

export interface ArrowFunctionExpressionNode extends ASTNodeBase {
  async?: boolean
  body: AnyExpressionNode | BlockStatementNode
  params: IdentifierNode[]
  type: "ArrowFunctionExpression"
}

// ============================================================================
// 语句节点
// ============================================================================

export interface BlockStatementNode extends ASTNodeBase {
  body: StatementNode[]
  type: "BlockStatement"
}

export interface ReturnStatementNode extends ASTNodeBase {
  argument: AnyExpressionNode | null
  type: "ReturnStatement"
}

// ============================================================================
// 模板相关节点
// ============================================================================

export interface TemplateNode extends ASTNodeBase {
  complexity?: number
  dependencies: string[]
  parts: TemplatePart[]
  type: "Template" // 依赖的变量列表
}

export interface TemplateTextPart {
  end: number
  start: number
  type: "TemplateText"
  value: string
}

export interface TemplateExpressionPart {
  end: number
  start: number
  type: "TemplateExpression"
  value: ExpressionNode
}

export type TemplatePart = TemplateTextPart | TemplateExpressionPart

// ============================================================================
// JMESPath 节点
// ============================================================================

export interface JMESPathNode extends ASTNodeBase {
  compiledQuery?: unknown
  query: string
  type: "JMESPath" // JMESPath compiled query
}

// ============================================================================
// 程序根节点
// ============================================================================

export interface ProgramNode extends ASTNodeBase {
  body: (StatementNode | TemplateNode)[]
  complexity?: number
  dependencies?: string[]
  sourceType: "expression" | "template"
  type: "Program"
}

// ============================================================================
// 联合类型
// ============================================================================

export type AnyExpressionNode =
  | LiteralNode
  | StringLiteralNode
  | NumericLiteralNode
  | BooleanLiteralNode
  | NullLiteralNode
  | IdentifierNode
  | MemberExpressionNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | CallExpressionNode
  | ConditionalExpressionNode
  | ArrayExpressionNode
  | ObjectExpressionNode
  | AssignmentExpressionNode
  | LogicalExpressionNode
  | UpdateExpressionNode
  | ArrowFunctionExpressionNode
  | JMESPathNode

export type StatementNode = ExpressionStatementNode | BlockStatementNode | ReturnStatementNode

export type ASTNode =
  | ProgramNode
  | TemplateNode
  | ExpressionNode
  | AnyExpressionNode
  | StatementNode
  | ObjectPropertyNode

// ============================================================================
// AST 工具类型
// ============================================================================

export interface ASTVisitor<T = unknown> {
  [key: string]: (node: ASTNode, parent?: ASTNode) => T
}

export interface ASTTraversalOptions {
  enter?: (node: ASTNode, parent?: ASTNode) => void
  exit?: (node: ASTNode, parent?: ASTNode) => void
  skipNode?: (node: ASTNode) => boolean
}

// ============================================================================
// AST 元数据
// ============================================================================

export interface ASTMetadata {
  generated: Date
  originalSource: string
  sourceMap?: {
    mappings: string
    sources: string[]
  }
  sourceType: "expression" | "template"
  version: string
}
