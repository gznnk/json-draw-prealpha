import type { DiagramChangeEvent } from "../../events/DiagramChangeEvent";
import type { DiagramTextChangeEvent } from "../../events/DiagramTextChangeEvent";

/**
 * Props for components that can display and edit text.
 * Provides properties to control text editing behavior and associated event handlers.
 */
export type TextableProps = {
	isTextEditEnabled?: boolean; // TODO: 廃止予定
	onTextChange?: (e: DiagramTextChangeEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};
