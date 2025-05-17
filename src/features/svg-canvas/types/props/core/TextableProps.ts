import type { DiagramChangeEvent } from "../../events/DiagramChangeEvent";
import type { DiagramTextEditEvent } from "../../events/DiagramTextEditEvent";

/**
 * Props for components that can display and edit text.
 * Provides properties to control text editing behavior and associated event handlers.
 */
export type TextableProps = {
	isTextEditEnabled?: boolean;
	onTextEdit?: (e: DiagramTextEditEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};
