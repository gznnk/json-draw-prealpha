// Import React.
import type React from "react";
import { memo } from "react";

// Import components.
import { DragPoint } from "../../../core/DragPoint";

// Import types.
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";

// Import local modules.
import type { NewVertexData } from "./NewVertexTypes";

/**
 * New vertex properties
 */
type NewVertexProps = NewVertexData & {
	onDrag?: (e: DiagramDragEvent) => void;
};

/**
 * New vertex component
 */
const NewVertexComponent: React.FC<NewVertexProps> = ({ id, x, y, onDrag }) => {
	return <DragPoint id={id} x={x} y={y} fill="white" onDrag={onDrag} />;
};

export const NewVertex = memo(NewVertexComponent);
