import type React from "react";
import { memo } from "react";

import type { NewVertexData } from "./NewVertexTypes";
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";
import { DragPoint } from "../../../core/DragPoint";

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
