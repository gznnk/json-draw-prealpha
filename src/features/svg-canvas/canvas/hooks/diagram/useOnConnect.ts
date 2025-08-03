// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";
import type { PathPointState } from "../../../types/state/shapes/PathPointState";
import type { DiagramConnectEvent } from "../../../types/events/DiagramConnectEvent";
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import constants.
import { DEFAULT_CONNECT_LINE_STATE } from "../../../constants/DefaultState";

// Import utils.
import { newEventId } from "../../../utils/core/newEventId";
import { calcOrientedShapeFromPoints } from "../../../utils/math/geometry/calcOrientedShapeFromPoints";
import { newId } from "../../../utils/shapes/common/newId";
import { isConnectableState } from "../../../utils/validation/isConnectableState";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";

// Import hooks.
import { useDataChange } from "../history/useDataChange";

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
			e.points.map((p: PathPointState) => ({ x: p.x, y: p.y })),
		);

		const newConnectLine: ConnectLineState = {
			...DEFAULT_CONNECT_LINE_STATE,
			id: newId(),
			x: shape.x,
			y: shape.y,
			width: shape.width,
			height: shape.height,
			items: e.points.map((p: PathPointState) => ({
				...p,
				type: "PathPoint",
			})) as PathPointState[],
			startOwnerId: e.startOwnerId,
			endOwnerId: e.endOwnerId,
		};

		setCanvasState((prevState) => {
			// Update endOwnerId item to hide connect points
			const items = applyFunctionRecursively(
				prevState.items,
				(item: Diagram) => {
					if (item.id === e.endOwnerId && isConnectableState(item)) {
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
