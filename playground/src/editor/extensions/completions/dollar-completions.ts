import {
  applyCompletion,
  stripExcessParens,
  prefixMatch,
  longestCommonPrefix,
  hasActiveNode,
  receivesNoBinaryData,
  autocompletableNodeNames,
  escapeMappingString,
} from "./utils";
import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import {
  PREVIOUS_NODES_SECTION,
  ROOT_DOLLAR_COMPLETIONS,
  TARGET_NODE_PARAMETER_FACET,
} from "./constants";
import { createInfoBoxRenderer } from "../info-box";

/**
 * Completions offered at the dollar position: `$|`
 *
 */
export function dollarCompletions(
  context: CompletionContext
): CompletionResult | null {
  const word = context.matchBefore(/\$[^$]*/);

  if (!word) return null;

  if (word.from === word.to && !context.explicit) return null;

  let options = dollarOptions(context).map(stripExcessParens(context));

  const userInput = word.text;

  if (userInput !== "$") {
    options = options.filter((o) => prefixMatch(o.label, userInput));
  }

  if (options.length === 0) return null;

  return {
    from: word.to - userInput.length,
    options,
    filter: false,
    getMatch(completion: Completion) {
      const lcp = longestCommonPrefix(userInput, completion.label);

      return [0, lcp.length];
    },
  };
}

export function dollarOptions(context: CompletionContext): Completion[] {
  const SKIP = new Set();
  const recommendedCompletions: Completion[] = [];

  const targetNodeParameterContext = context.state.facet(
    TARGET_NODE_PARAMETER_FACET
  );

    if (!hasActiveNode(targetNodeParameterContext)) {
      return [];
    }

    if (receivesNoBinaryData(targetNodeParameterContext?.nodeName))
      SKIP.add("$binary");

    const previousNodesCompletions = autocompletableNodeNames().map(
      (nodeName) => {
        const label = `$('${escapeMappingString(nodeName)}')`;
        return {
          label,
          info: createInfoBoxRenderer({
            name: label,
            returnType: "Object",
            description: `codeNodeEditor.completer.$() ${nodeName}`,
          }),
          section: PREVIOUS_NODES_SECTION,
        };
      }
    );  

  return (
    recommendedCompletions
      .concat(ROOT_DOLLAR_COMPLETIONS)
      .filter(({ label }) => !SKIP.has(label))
      .concat(previousNodesCompletions)
      .map((completion) => ({ ...completion, apply: applyCompletion() }))
  );
}
