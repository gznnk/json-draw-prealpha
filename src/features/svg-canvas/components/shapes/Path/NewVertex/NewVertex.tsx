// Import React.
import type React from "react";
import { memo } from "react";

// Import components related to SvgCanvas.
import { DragPoint } from "../../../core/DragPoint";

// Import types related to SvgCanvas.
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";

// Imports related to this component.
import type { NewVertexData } from "./NewVertexTypes";

/**
 * 新規頂点プロパティ
 */
type NewVertexProps = NewVertexData & {
	onDrag?: (e: DiagramDragEvent) => void;
};

/**
 * 新規頂点コンポーネント
 */
const NewVertexComponent: React.FC<NewVertexProps> = ({ id, x, y, onDrag }) => {
	return <DragPoint id={id} x={x} y={y} fill="white" onDrag={onDrag} />;
};

export const NewVertex = memo(NewVertexComponent);
