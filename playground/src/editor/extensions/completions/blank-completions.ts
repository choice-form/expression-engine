import { dollarOptions } from "./dollar-completions";
import type {
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { stripExcessParens } from "./utils";

/**
 * 提供空白补全选项，通常用于表达式编辑器的起始位置
 * 例如：`{{ | }}`
 */
export function blankCompletions(
  context: CompletionContext
): CompletionResult | null {
  const word = context.matchBefore(/\{\{\s/);

  if (!word) return null;

  if (word.from === word.to && !context.explicit) return null;

  const afterCursor = context.state.sliceDoc(
    context.pos,
    context.pos + " }}".length
  );

  if (afterCursor !== " }}") return null;

  return {
    from: word.to,
    options: dollarOptions(context).map(stripExcessParens(context)),
    filter: false,
  };
}
