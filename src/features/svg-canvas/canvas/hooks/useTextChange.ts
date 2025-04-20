// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramTextChangeEvent } from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { addHistory, applyRecursive } from "../SvgCanvasFunctions";

/**
 * Custom hook to handle text change events on the canvas.
 */
export const useTextChange = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramTextChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			// 新しい状態を作成
			let newState = {
				...prevState,
				items: applyRecursive(prevState.items, (item) =>
					item.id === e.id
						? { ...item, text: e.text, isTextEditing: false }
						: item,
				),
			};

			// Add a new history entry.
			newState.lastHistoryEventId = e.eventId;
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);
};
