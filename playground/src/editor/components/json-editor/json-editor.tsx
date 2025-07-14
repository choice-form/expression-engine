import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { history } from '@codemirror/commands';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { linter as createLinter, lintGutter } from '@codemirror/lint';
import type { Extension } from '@codemirror/state';
import { EditorState, Prec } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';
import {
	EditorView,
	dropCursor,
	highlightActiveLine,
	highlightActiveLineGutter,
	keymap,
	lineNumbers,
} from '@codemirror/view';
import { autocompletion, editorKeymap, mappingDropCursor } from '@/editor/extensions';
import { codeEditorTheme } from '../code-editor/theme';

interface JsonEditorProps {
	value: string;
	onChange?: (value: string) => void;
	isReadOnly?: boolean;
	fillParent?: boolean;
	rows?: number;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
	value,
	onChange,
	isReadOnly = false,
	fillParent = false,
	rows = 4,
}) => {
	const jsonEditorRef = useRef<HTMLDivElement>(null);
	const editor = useRef<EditorView | null>(null);
	const [editorState, setEditorState] = useState<EditorState | null>(null);

	const extensions = useMemo(() => {
		const extensionsToApply: Extension[] = [
			json(),
			lineNumbers(),
			EditorView.lineWrapping,
			EditorState.readOnly.of(isReadOnly),
			codeEditorTheme({
				isReadOnly,
				maxHeight: fillParent ? '100%' : '40vh',
				minHeight: '20vh',
				rows,
			}),
		];

		if (!isReadOnly) {
			extensionsToApply.push(
				history(),
				Prec.highest(keymap.of(editorKeymap)),
				createLinter(jsonParseLinter()),
				lintGutter(),
				autocompletion(),
				indentOnInput(),
				highlightActiveLine(),
				highlightActiveLineGutter(),
				foldGutter(),
				dropCursor(),
				bracketMatching(),
				mappingDropCursor(),
				EditorView.updateListener.of((viewUpdate: ViewUpdate) => {
					if (!viewUpdate.docChanged || !editor.current) return;
					onChange?.(editor.current.state.doc.toString());
				}),
			);
		}

		return extensionsToApply;
	}, [isReadOnly, fillParent, rows, onChange]);

	const createEditor = useCallback(() => {
		if (!jsonEditorRef.current) return;

		const state = EditorState.create({ doc: value, extensions });
		const parent = jsonEditorRef.current;

		editor.current = new EditorView({ parent, state });
		setEditorState(editor.current.state);
	}, [value, extensions]);

	const destroyEditor = useCallback(() => {
		if (editor.current) {
			editor.current.destroy();
			editor.current = null;
		}
	}, []);

	// init editor
	useEffect(() => {
		createEditor();

		return () => {
			destroyEditor();
		};
	}, [createEditor, destroyEditor]);

	useEffect(() => {
		if (!editor.current) return;

		const editorValue = editor.current.state.doc.toString();

		// If value changes from outside the component
		if (editorValue && editorValue.length !== value.length && editorValue !== value) {
			destroyEditor();
			createEditor();
		}
	}, [value, destroyEditor, createEditor]);

	return (
		<div className="relative h-full">
			<div
				ref={jsonEditorRef}
				className="h-full"
			/>
		</div>
	);
};

export default JsonEditor;