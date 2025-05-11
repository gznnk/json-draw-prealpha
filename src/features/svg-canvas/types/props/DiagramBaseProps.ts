import type {
	DiagramDragEvent,
	DiagramDragDropEvent,
	DiagramClickEvent,
	DiagramHoverEvent,
} from "../events";

/**
 * 図形の基本プロパティ
 */
export type DiagramBaseProps = {
	isTransparent?: boolean;
	onDrag?: (e: DiagramDragEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onHover?: (e: DiagramHoverEvent) => void;
};
