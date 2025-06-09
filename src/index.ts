/**
 * Expression Engine - 高性能、安全的前端表达式引擎
 * 完全兼容n8n表达式语法
 */

// 导出核心类型
export type {
  ExpressionValue,
  ExpressionObject,
  ExpressionArray,
  ExpressionContext,
  EvaluationResult,
  EvaluationError,
  ParsedTemplate,
  ParsedExpression,
  ExpressionType,
  SecurityConfig,
  EngineConfig,
  CompletionItem,
  CompletionRequest,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  PerformanceMetrics,
} from "./types/index.js"

// 导出 enum（需要使用 export 而不是 export type）
export { CompletionKind } from "./types/index.js"

// 导出核心组件
export { TemplateParser, isJMESPath } from "./parser/template-parser.js"
export { ExpressionEvaluator } from "./evaluator/expression-evaluator.js"
export { ContextManager } from "./context/context-manager.js"

// 导出主引擎类
export { ExpressionEngine } from "./engine.js"

// 导出验证引擎
export {
  ValidationEngine,
  createDefaultValidationEngine,
  type ValidationConfig,
  type ValidationContext,
  type ValidatorLayer,
  type IValidator,
} from "./validation/validation-engine.js"

// 导出验证器基类
export { BaseValidator } from "./validation/base-validator.js"

// 导出默认配置
export { DEFAULT_CONFIG } from "./config/default-config.js"

// 导出完整建议系统 (替代旧的expression-suggestions)
export { CompleteSuggestionProvider } from "./completion/complete-suggestions.js"
export type {
  ExpressionSuggestion,
  SuggestionType,
  SuggestionInfo,
  ExpressionExample,
  ParameterInfo,
  CodeMirrorCompletion,
  MonacoCompletion,
} from "./completion/complete-suggestions.js"

// 版本信息
export const VERSION = "0.1.0"
