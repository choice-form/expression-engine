import { EditorSelection, StateEffect, StateField, type Extension } from '@codemirror/state';
import { ViewPlugin, type EditorView, type ViewUpdate } from '@codemirror/view';

const setDropCursorPos = StateEffect.define<number | null>({
	map(pos, mapping) {
		return pos === null ? null : mapping.mapPos(pos);
	},
});

const dropCursorPos = StateField.define<number | null>({
	create() {
		return null;
	},
	update(pos, tr) {
		if (pos !== null) pos = tr.changes.mapPos(pos);
		return tr.effects.reduce((p, e) => (e.is(setDropCursorPos) ? e.value : p), pos);
	},
});

interface MeasureRequest<T> {
	read(view: EditorView): T;
	write?(measure: T, view: EditorView): void;
	key?: unknown;
}

export function mappingDropCursor(): Extension {
	return [
		dropCursorPos,
		// drawDropCursor(),
	];
}
