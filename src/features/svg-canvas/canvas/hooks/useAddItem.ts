// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../types/DiagramCatalog";
import type { CanvasHooksProps, SvgCanvasState } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { isSelectableData } from "../../utils/TypeUtils";
import { newEventId } from "../../utils/Util";
import { addHistory } from "../SvgCanvasFunctions";

// TODO: onNewItemと統合
/**
 * Custom hook to add a item to the canvas.
 */
export const useAddItem = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((item: Diagram, eventId?: string) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			let newState = {
				...prevState,
				items: [
					...prevState.items.map((i) => {
						if (isSelectableData(i) && isSelectableData(item)) {
							return {
								...i,
								// If the new item is selected, unselect other items.
								isSelected: item.isSelected ? false : i.isSelected,
							};
						}
						return i;
					}),
					{
						...item,
					},
				],
			} as SvgCanvasState;

			// Add a new history entry.
			newState.lastHistoryEventId = eventId ?? newEventId();
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);
};
