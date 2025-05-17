import type { DiagramDragEvent } from "../../events/DiagramDragEvent";
import type { DiagramDragDropEvent } from "../../events/DiagramDragDropEvent";
import type { DiagramClickEvent } from "../../events/DiagramClickEvent";
import type { DiagramHoverEvent } from "../../events/DiagramHoverEvent";

/**
 * Base properties for diagram components.
 * Defines common event handlers and appearance settings shared by all diagram elements.
 */
export type DiagramBaseProps = {
	isTransparent?: boolean;
	onDrag?: (e: DiagramDragEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onHover?: (e: DiagramHoverEvent) => void;
};
