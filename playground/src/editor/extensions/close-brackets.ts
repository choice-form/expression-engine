import {
  closeBrackets as codemirrorCloseBrackets,
  closeBracketsKeymap,
  startCompletion,
  type CloseBracketConfig,
} from "@codemirror/autocomplete";
import { EditorSelection, Text } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";

const bracketSpacing = EditorView.updateListener.of((update) => {
  if (!update.changes || update.changes.empty) return;

  // {{|}} --> {{ | }}
  update.changes.iterChanges((_fromA, _toA, fromB, toB, inserted) => {
    const doc = update.state.doc;
    if (
      inserted.eq(Text.of(["{}"])) &&
      doc.sliceString(fromB - 1, fromB) === "{" &&
      doc.sliceString(toB, toB + 1) === "}"
    ) {
      update.view.dispatch({
        changes: [{ from: fromB + 1, insert: "  " }],
        selection: EditorSelection.cursor(toB),
      });
      startCompletion(update.view);
    }
  });
});

export const closeBracketsConfig: CloseBracketConfig = {
  brackets: ["{", "(", '"', "'", "["],
  // <> so bracket completion works in HTML tags
  before: ")]}:;<>'\"",
};

export const closeBrackets = () => [
  bracketSpacing,
  codemirrorCloseBrackets(),
  keymap.of(closeBracketsKeymap),
];
