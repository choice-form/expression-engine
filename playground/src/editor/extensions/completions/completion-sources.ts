import { ifIn } from "@codemirror/autocomplete";
import { blankCompletions } from "./blank-completions";
import { dollarCompletions } from "./dollar-completions";
import { nonDollarCompletions } from "./non-dollar-completions";
import { datatypeCompletions } from "./datatype-completions";
import { bracketAccessCompletions } from "./bracket-access-completions";

export function completionSources() {
  return [
    blankCompletions,
    bracketAccessCompletions,
    dollarCompletions,
    nonDollarCompletions,
    datatypeCompletions,
  ].map((source) => ({
    autocomplete: ifIn(["Resolvable"], source),
  }));
}
