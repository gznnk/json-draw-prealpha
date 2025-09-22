import type { DiagramClickEvent } from "../../events/DiagramClickEvent";
import type { DiagramTransformEvent } from "../../events/DiagramTransformEvent";

/**
 * Properties for transformable diagram elements.
 * Provides event handlers for transformation operations like resizing and rotation.
 */
export type TransformativeProps = {
	onTransform?: (e: DiagramTransformEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
};
