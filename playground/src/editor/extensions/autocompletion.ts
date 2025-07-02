import { autocompletion as codemirrorAutocompletion } from "@codemirror/autocomplete";

export const autocompletion = () =>
  codemirrorAutocompletion({
    icons: false,
    aboveCursor: true,
    closeOnBlur: false,
  });
