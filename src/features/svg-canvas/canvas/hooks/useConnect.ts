// Import React.
import { useCallback } from "react";

// Import types related to SvgCanvas.
import type { ConnectLineData } from "../../components/shapes/ConnectLine";
import type { PathPointData } from "../../components/shapes/Path";
import type { DiagramConnectEvent } from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { newId } from "../../utils/diagram";
import { calcPointsOuterShape } from "../../utils";
import { dispatchNewItemEvent } from "../observers/addNewItem";

/**
 * Custom hook to handle connect events on the canvas.
 */
export const useConnect = (_props: CanvasHooksProps) => {
	return useCallback((e: DiagramConnectEvent) => {
		const shape = calcPointsOuterShape(
			e.points.map((p) => ({ x: p.x, y: p.y })),
		);

		dispatchNewItemEvent({
			eventId: e.eventId,
			item: {
				id: newId(),
				type: "ConnectLine",
				x: shape.x,
				y: shape.y,
				width: shape.width,
				height: shape.height,
				stroke: "#fed579",
				strokeWidth: "3px",
				isSelected: false,
				isMultiSelectSource: false,
				keepProportion: false,
				items: e.points.map((p) => ({
					...p,
					type: "PathPoint",
				})) as PathPointData[],
				startOwnerId: e.startOwnerId,
				endOwnerId: e.endOwnerId,
				autoRouting: true,
				endArrowHead: "Circle",
			} as ConnectLineData,
		});
	}, []);
};
