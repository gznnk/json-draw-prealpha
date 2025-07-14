// Import React.
import { useCallback } from "react";

// Import types.
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { PathPointData } from "../../../types/data/shapes/PathPointData";
import type { DiagramConnectEvent } from "../../../types/events/DiagramConnectEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import type { Diagram } from "../../../types/data/catalog/Diagram";

// Import utils.
import { calcOrientedShapeFromPoints } from "../../../utils/math/geometry/calcOrientedShapeFromPoints";
import { newId } from "../../../utils/shapes/common/newId";
import { newEventId } from "../../../utils/common/newEventId";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { isConnectableData } from "../../../utils/validation/isConnectableData";
import { addHistory } from "../../utils/addHistory";

/**
 * Custom hook to handle connect events on the canvas.
 */
export const useOnConnect = (props: SvgCanvasSubHooksProps) => {
	return useCallback(
		(e: DiagramConnectEvent) => {
			const { setCanvasState } = props;

			const shape = calcOrientedShapeFromPoints(
				e.points.map((p: PathPointData) => ({ x: p.x, y: p.y })),
			);

			const newConnectLine: ConnectLineData = {
				id: newId(),
				type: "ConnectLine",
				x: shape.x,
				y: shape.y,
				width: shape.width,
				height: shape.height,
				rotation: 0,
				scaleX: 1,
				scaleY: 1,
				stroke: "#49546e",
				strokeWidth: "2px",
				isSelected: false,
				showOutline: false,
				showTransformControls: false,
				keepProportion: false,
				isTransforming: false,
				items: e.points.map((p: PathPointData) => ({
					...p,
					type: "PathPoint",
				})) as PathPointData[],
				startOwnerId: e.startOwnerId,
				endOwnerId: e.endOwnerId,
				autoRouting: true,
				endArrowHead: "Circle",
			};

			setCanvasState((prevState) => {
				// Update endOwnerId item to hide connect points
				const items = applyFunctionRecursively(
					prevState.items,
					(item: Diagram) => {
						if (item.id === e.endOwnerId && isConnectableData(item)) {
							return {
								...item,
								showConnectPoints: false,
							};
						}
						return item;
					},
				);

				// Add the new ConnectLine to the items
				const updatedItems = [...items, newConnectLine];

				// Create new state with updated items
				let newState = {
					...prevState,
					items: updatedItems,
				};

				// Add history entry
				newState.lastHistoryEventId = newEventId();
				newState = addHistory(prevState, newState);

				return newState;
			});
		},
		[props],
	);
};
