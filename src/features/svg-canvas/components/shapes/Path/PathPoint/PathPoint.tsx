// Import React.
import type React from "react";
import { memo } from "react";

// Import components related to SvgCanvas.
import { DragPoint } from "../../../core/DragPoint";

// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../../types/props/CreateDiagramProps";

// Import related to this component.
import type { PathPointData } from "../../../../types/data";

/**
 * 折れ線の頂点プロパティ
 */
type PathPointProps = CreateDiagramProps<PathPointData, object>;

/**
 * 折れ線の頂点コンポーネント
 */
export const PathPoint: React.FC<PathPointProps> = memo(
	({ id, x, y, hidden, onDrag }) => {
		return <DragPoint id={id} x={x} y={y} hidden={hidden} onDrag={onDrag} />;
	},
);
