// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { PathPointData } from "../../../types/data/shapes/PathPointData";
import type { DiagramConnectEvent } from "../../../types/events/DiagramConnectEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utils.
import { newEventId } from "../../../utils/core/newEventId";
import { calcOrientedShapeFromPoints } from "../../../utils/math/geometry/calcOrientedShapeFromPoints";
import { newId } from "../../../utils/shapes/common/newId";
import { isConnectableData } from "../../../utils/validation/isConnectableData";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { useDataChange } from "../history/useDataChange";

// Import constants.
import { DEFAULT_CONNECT_LINE_DATA } from "../../../constants/DefaultData";

/**
 * Custom hook to handle connect events on the canvas.
 */
export const useOnConnect = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const onDataChange = useDataChange(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onDataChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramConnectEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;
		const { onDataChange } = refBus.current;

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
			const newState = {
				...prevState,
				items: updatedItems,
			};

			// Generate event ID and notify the data change.
			const eventId = newEventId();
			onDataChange(eventId, newState);

			return newState;
		});
	}, []);
};
