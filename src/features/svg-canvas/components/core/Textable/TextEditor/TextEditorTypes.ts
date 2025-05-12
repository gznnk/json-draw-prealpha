// Import types.
import type {
	DiagramTextChangeEvent,
	TextableType,
	TextAlign,
	VerticalAlign,
} from "../../../../types";

/**
 * Type for the state of the TextEditor.
 */
export type TextEditorState = {
	id: string;
	text: string;
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	rotation: number;
	textType: TextableType;
	textAlign: TextAlign;
	verticalAlign: VerticalAlign;
	fontColor: string;
	fontSize: number;
	fontFamily: string;
	fontWeight: string;
	isActive: boolean;
};

/**
 * Props for the TextEditor component.
 */
export type TextEditorProps = TextEditorState & {
	onTextChange?: (e: DiagramTextChangeEvent) => void;
};
