// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { ConnectLineData } from "../../components/shapes/ConnectLine";
import type { PathPointData } from "../../components/shapes/Path";
import type { DiagramConnectEvent } from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { newId } from "../../utils/Diagram";
import { calcPointsOuterShape } from "../../utils/Math";

// Import hooks related to SvgCanvas.
import { useNewItem } from "./useNewItem";

/**
 * Custom hook to handle connect events on the canvas.
 */
export const useConnect = (props: CanvasHooksProps) => {
	// Get the function to add items to the canvas.
	const onNewItem = useNewItem(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		onNewItem,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramConnectEvent) => {
		// Bypass references to avoid function creation in every render.
		const { onNewItem } = refBus.current;

		const shape = calcPointsOuterShape(
			e.points.map((p) => ({ x: p.x, y: p.y })),
		);

		onNewItem({
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
