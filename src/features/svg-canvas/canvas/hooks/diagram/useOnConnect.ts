// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { PathPointData } from "../../../types/data/shapes/PathPointData";
import type { DiagramConnectEvent } from "../../../types/events/DiagramConnectEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utils.
import { newEventId } from "../../../utils/common/newEventId";
import { calcOrientedShapeFromPoints } from "../../../utils/math/geometry/calcOrientedShapeFromPoints";
import { newId } from "../../../utils/shapes/common/newId";
import { isConnectableData } from "../../../utils/validation/isConnectableData";
import { addHistory } from "../../utils/addHistory";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";

// Import constants.
import { DEFAULT_CONNECT_LINE_DATA } from "../../../constants/DefaultData";

/**
 * Custom hook to handle connect events on the canvas.
 */
export const useOnConnect = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramConnectEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		const shape = calcOrientedShapeFromPoints(
			e.points.map((p: PathPointData) => ({ x: p.x, y: p.y })),
		);

		const newConnectLine: ConnectLineData = {
			...DEFAULT_CONNECT_LINE_DATA,
			id: newId(),
			x: shape.x,
			y: shape.y,
			width: shape.width,
			height: shape.height,
			items: e.points.map((p: PathPointData) => ({
				...p,
				type: "PathPoint",
			})) as PathPointData[],
			startOwnerId: e.startOwnerId,
			endOwnerId: e.endOwnerId,
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
	}, []);
};
