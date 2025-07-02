import { useEffect, useMemo, useRef, useState } from "react";
import { EditorView } from "codemirror";
import { EditorState, Prec, SelectionRange, EditorSelection } from "@codemirror/state";
import { dropCursor, keymap, ViewUpdate } from "@codemirror/view";
import { history } from "@codemirror/commands";
import {
  autocompletion,
  closeBrackets,
  editorKeymap,
  forceParse,
  infoBoxTooltips,
  language,
  mappingDropCursor,
  inputTheme,
  ignoreUpdateAnnotation
} from "@/editor/extensions";
import { tcx } from "@choiceform/design-system";
import debounce from 'lodash/debounce';
import { useEventCallback } from "usehooks-ts";
import { Plaintext, RawSegment, Resolvable, Segment } from "@/editor/workflow/expression/types";
import { completionStatus } from "@codemirror/autocomplete";
import { ensureSyntaxTree } from "@codemirror/language";
import { EXPRESSION_EDITOR_PARSER_TIMEOUT } from "@/editor/extensions/constants";
import isEqual from "lodash/isEqual";
import { IRunExecutionData, TargetItem } from "@/editor/types";
import { getExpressionErrorMessage, getResolvableState } from "@/editor/workflow/expression/utils";
import { getNodeDataStore, getWorkflowHelpers, getWorkflowsStore } from "@/editor/store";
import { Expression } from "@/editor/workflow/expression";
import { TargetNodeParameterContext } from "@/editor/extensions/completions/types";
import { EXPRESSION_EXTENSIONS } from "@/editor/workflow";
import { highlighter } from "@/editor/extensions/resolvable-highlighter";

type ExpressionEditorProps = {
  className?: string;
  value: string
  onChange?: (value: string) => void
  targetNodeParameterContext?: TargetNodeParameterContext;
  segments: Segment[]
  onSegmentsChange: (newSegments: Segment[]) => void
};

export const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
  className,
  value,
  onChange,
  targetNodeParameterContext,
  segments,
  onSegmentsChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const [selection, setSelection] = useState<SelectionRange>(EditorSelection.cursor(0));
  const [autocompleteStatus, setAutocompleteStatus] = useState<'pending' | 'active' | null>(null);
  // const [dragging, setDragging] = useState(false);

  const { activeNode, expressionTargetItem, inputNodeName, isInputParentOfActiveNode } = getNodeDataStore()
  const workflowHelpers = getWorkflowHelpers()
  const workflowsStore = getWorkflowsStore()

  const debounceChange = useEventCallback(debounce((value: string) => {
    onChange?.(value);
  }, 300));

  const updateSegments = useEventCallback(() => {
    const state = viewRef.current?.state
    if (!state) return;

    const fullTree = ensureSyntaxTree(state, state.doc.length, EXPRESSION_EDITOR_PARSER_TIMEOUT);
    if (fullTree === null) return;

    const rawSegments: RawSegment[] = [];

    const skip = ['Program', 'Script', 'Document'];
    fullTree.cursor().iterate((node) => {
      const text = state.sliceDoc(node.from, node.to);

      if (skip.includes(node.type.name)) return;

      const newSegment: RawSegment = {
        from: node.from,
        to: node.to,
        text,
        token: node.type.name === 'Resolvable' ? 'Resolvable' : 'Plaintext',
      };
      // Avoid duplicates
    if (isEqual(newSegment, rawSegments.at(-1))) return;
      rawSegments.push(newSegment);
    });

    const newSegments = rawSegments.reduce<Segment[]>((acc, segment) => {
      const { from, to, text, token } = segment;

      if (token === 'Resolvable') {
        const { resolved, error, fullError } = resolve(text, expressionTargetItem);
        acc.push({
          kind: 'resolvable',
          from,
          to,
          resolvable: text,
          // TODO:
          // For some reason, expressions that resolve to a number 0 are breaking preview in the SQL editor
          // This fixes that but as as TODO we should figure out why this is happening
          resolved: String(resolved),
          state: getResolvableState(fullError ?? error, autocompleteStatus !== null),
          error: fullError,
        });

        return acc;
      }

      acc.push({ kind: 'plaintext', from, to, plaintext: text });

      return acc;
    }, []);

    if (
      newSegments.length === 1 &&
      newSegments[0]?.kind === 'resolvable' &&
      newSegments[0]?.resolved === ''
    ) {
      newSegments[0].resolved = 'expressionModalInput.empty';
    }

    onSegmentsChange(newSegments)
  })

  const debouncedUpdateSegments = useEventCallback(debounce(() => {
    updateSegments();
  }, 200));

  const updateSelection = useEventCallback((viewUpdate: ViewUpdate) => {
    const newSelection = viewUpdate.state.selection.ranges[0];

    if (!selection?.eq(newSelection)) {
      setSelection(newSelection)
    }
  })

  const handleEditorUpdate = useEventCallback((viewUpdate: ViewUpdate) => {
    const cStatus = completionStatus(viewUpdate.view.state);
    setAutocompleteStatus(cStatus)
    updateSelection(viewUpdate)

    const shouldIgnoreUpdate = viewUpdate.transactions.some((tr) =>
      tr.annotation(ignoreUpdateAnnotation),
    );

    if (viewUpdate.docChanged && !shouldIgnoreUpdate) {
      const value = viewUpdate.state.doc.toString();
      debounceChange(value)
      debouncedUpdateSegments();
    }
  })

  const expressionExtensionNames = useMemo(() => {
    return new Set(
      EXPRESSION_EXTENSIONS.reduce<string[]>((acc, cur) => {
        return [...acc, ...Object.keys(cur.functions)];
      }, []),
    );
  }, [])

  const isUncalledExpressionExtension = useEventCallback((resolvable: string) => {
    const end = resolvable
      .replace(/^{{|}}$/g, '')
      .trim()
      .split('.')
      .pop();

    return end !== undefined && expressionExtensionNames.has(end);
  })

  const resolve = useEventCallback((resolvable: string, target: TargetItem | null) => {
    const result: { resolved: unknown; error: boolean; fullError: Error | null } = {
      resolved: undefined,
      error: false,
      fullError: null,
    };

    try {
      if (!activeNode && targetNodeParameterContext === undefined) {
        // e.g. credential modal
        result.resolved = Expression.resolveWithoutWorkflow(resolvable);
      } else {
        let opts: Record<string, unknown> = {
          // additionalKeys: toValue(additionalData),
          targetNodeParameterContext,
        };
        if (
          targetNodeParameterContext === undefined &&
          isInputParentOfActiveNode
        ) {
          opts = {
            targetItem: target ?? undefined,
            inputNodeName: inputNodeName,
            inputRunIndex: 0,
            inputBranchIndex: 0,
          };
        }
        result.resolved = workflowHelpers.resolveExpression('=' + resolvable, undefined, opts);
      }
    } catch (error) {
      const hasRunData =
        !!(workflowsStore.workflowExecution?.data as IRunExecutionData)?.resultData?.runData[
        activeNode?.name ?? ''
        ];

      result.resolved = `[${getExpressionErrorMessage(error as Error, hasRunData)}]`;
      result.error = true;
      result.fullError = error as Error;
    }

    if (result.resolved === undefined) {
      result.resolved = isUncalledExpressionExtension(resolvable)
        ? 'expressionEditor.uncalledFunction'
        : 'expressionModalInput.undefined';

      result.error = true;
    }

    return result;
  })

  const extensions = useMemo(
    () => [
      Prec.highest(keymap.of(editorKeymap)),
      closeBrackets(),
      history(),
      autocompletion(),
      language(),
      infoBoxTooltips(),
      inputTheme(),
      mappingDropCursor(),
      dropCursor(),
      EditorView.lineWrapping,
      EditorView.updateListener.of(handleEditorUpdate),
      EditorView.domEventHandlers({ scroll: (_, view) => forceParse(view) }),
      // EditorView.focusChangeEffect.of((_, newHasFocus) => {
      //   return null
      // }),
    ],
    []
  );

  const resolvableSegments = useMemo(() => {
    return segments.filter((s): s is Resolvable => s.kind === 'resolvable');
  }, [segments])

  const plaintextSegments = useMemo(() => {
    return segments.filter((s): s is Plaintext => s.kind === 'plaintext');
  }, [segments])

  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    view.focus();

    debouncedUpdateSegments();

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [value, extensions]);

  const updateHighlighting = useEventCallback(() => {
    const editorView = viewRef.current
    if (!editorView) return;

    highlighter.removeColor(editorView, plaintextSegments);
    highlighter.addColor(editorView, resolvableSegments);
  })

  useEffect(() => {
    updateHighlighting()
  }, [segments])

  return (
    <div className={tcx("flex flex-col gap-2", className)}>
      <div
        ref={editorRef}
        className="focus-within:border-selected-boundary border-default-foreground flex-1 overflow-hidden rounded-md border-2"
      />
    </div>
  );
};