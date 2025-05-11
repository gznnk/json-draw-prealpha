import type { DiagramTextEditEvent, DiagramChangeEvent } from "../events";

/**
 * Props for textable component.
 */
export type TextableProps = {
	isTextEditEnabled?: boolean;
	onTextEdit?: (e: DiagramTextEditEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};
