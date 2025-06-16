import type { DiagramTransformEvent } from "../../events/DiagramTransformEvent";
import type { EventBus } from "../../../../../shared/event-bus/EventBus";

/**
 * Properties for transformable diagram elements.
 * Provides event handlers for transformation operations like resizing and rotation.
 */
export type TransformativeProps = {
	eventBus: EventBus;
	onTransform?: (e: DiagramTransformEvent) => void;
};
