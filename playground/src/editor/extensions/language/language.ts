import { parserWithMetaData as languageParser } from "./parser";
import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { parseMixed, type SyntaxNodeRef } from "@lezer/common";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import { closeBracketsConfig } from "../close-brackets";
import { completionSources } from "../completions";

const isResolvable = (node: SyntaxNodeRef) => node.type.name === "Resolvable";

const parserWithNestedJsParser = languageParser.configure({
  wrap: parseMixed((node) => {
    if (node.type.isTop) return null;

    return node.name === "Resolvable"
      ? { parser: javascriptLanguage.parser, overlay: isResolvable }
      : null;
  }),
});

const expressionLanguage = LRLanguage.define({
  parser: parserWithNestedJsParser,
});

export function language() {
  return new LanguageSupport(expressionLanguage, [
    expressionLanguage.data.of(closeBracketsConfig),
    ...completionSources().map((source) => expressionLanguage.data.of(source)),
  ]);
}
