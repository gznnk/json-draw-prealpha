import type { FileDropEvent } from "../events";

/**
 * Props for file droppable component.
 */
export type FileDroppableProps = {
	onFileDrop?: (e: FileDropEvent) => void;
};
