// Import types.
import type { Shape } from "../../../../types/core/Shape";
import type { TextableData } from "../../../../types/data/core/TextableData";
import type { DiagramTextChangeEvent } from "../../../../types/events/DiagramTextChangeEvent";

/**
 * Type for the state of the TextEditor.
 */
export type TextEditorState = Shape &
	TextableData & {
		id: string;
		isActive: boolean;
	};

/**
 * Props for the TextEditor component.
 */
export type TextEditorProps = TextEditorState & {
	onTextChange?: (e: DiagramTextChangeEvent) => void;
};
