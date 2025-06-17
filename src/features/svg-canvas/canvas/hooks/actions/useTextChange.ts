// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramTextChangeEvent } from "../../../types/events/DiagramTextChangeEvent";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { addHistory } from "../../utils/addHistory";
import { applyRecursive } from "../../utils/applyRecursive";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";

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
		const { setCanvasState, onDataChange } = refBus.current.props;

		setCanvasState((prevState) => {
			const isTextEditing = e.eventType !== "End";

			// Create a new state with the updated text.
			let newState = {
				...prevState,
				items: applyRecursive(prevState.items, (item) =>
					item.id === e.id ? { ...item, text: e.text, isTextEditing } : item,
				),
				textEditorState: {
					...prevState.textEditorState,
					text: e.text,
					isActive: isTextEditing,
				},
			};

			// Add a new history entry.
			if (e.eventType === "End") {
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);

				// Notify about data change.
				onDataChange?.(svgCanvasStateToData(newState));
			}

			return newState;
		});
	}, []);
};
