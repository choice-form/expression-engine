import { EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";
import { useEffect, useMemo, useRef } from "react";
import { highlighter, forceParse, outputTheme } from "@/editor/extensions";
import { Plaintext, Resolved, Segment } from "@/editor/workflow/expression/types";

type Props = {
    segments: Segment[]
}

export const ExpressionOutput = ({ segments }: Props) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    const theme = outputTheme();

    const resolvedExpression = useMemo(() => {
        if (segments.length === 0) {
            return 'parameterInput.emptyString';
        }

        return segments.reduce(
            (acc, segment) => {
                // skip duplicate segments
                if (acc.cursor >= segment.to) return acc;

                acc.resolved += segment.kind === 'resolvable' ? String(segment.resolved) : segment.plaintext;
                acc.cursor = segment.to;

                return acc;
            },
            { resolved: '', cursor: 0 },
        ).resolved;
    }, [segments])

    const resolvedSegments = useMemo(() => {
        if (segments.length === 0) {
            const emptyExpression = resolvedExpression;
            const emptySegment: Resolved = {
                from: 0,
                to: emptyExpression.length,
                kind: 'resolvable',
                error: null,
                resolvable: '',
                resolved: emptyExpression,
                state: 'pending',
            };
            return [emptySegment];
        }

        let cursor = 0;

        return segments
            .map((segment) => {
                const length =
                    segment.kind === 'plaintext'
                        ? segment.plaintext.length
                        : segment.resolved
                            ? segment.resolved.toString().length
                            : 0;

                const newSegment = {
                    ...segment,
                    from: cursor,
                    to: cursor + length,
                };

                cursor += length;
                return newSegment;
            })
            .filter((segment): segment is Resolved => segment.kind === 'resolvable');
    }, [segments])

    const plaintextSegments = useMemo(() => {
        return segments.filter((s): s is Plaintext => s.kind === 'plaintext');
    }, [segments])


    useEffect(() => {
        if (!editorRef.current) return;

        const state = EditorState.create({
            doc: resolvedExpression,
            extensions: [
                EditorState.readOnly.of(true),
                EditorView.lineWrapping,
                EditorView.domEventHandlers({
                    scroll: (_, view) => {
                        forceParse(view);
                    },
                }),
                theme,
            ],
        });

        const view = new EditorView({
            state,
            parent: editorRef.current,
        });

        viewRef.current = view;

        highlighter.addColor(view, resolvedSegments);
        highlighter.removeColor(view, plaintextSegments);

        return () => {
            view.destroy()
        };
    }, [segments]);

    useEffect(() => {
        const editorView = viewRef.current
        if (!editorView) return

        editorView.dispatch({
            changes: { from: 0, to: editorView.state.doc.length, insert: resolvedExpression },
        });

        highlighter.addColor(editorView as EditorView, resolvedSegments);
        highlighter.removeColor(editorView as EditorView, plaintextSegments);
    }, [segments])

    return <div
        className="border-default-foreground flex-1 overflow-hidden rounded-md border-2"
        ref={editorRef}
    />;
}