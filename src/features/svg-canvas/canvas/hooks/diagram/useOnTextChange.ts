// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { TextEditorState } from "../../../components/core/Textable/TextEditor/TextEditorTypes";
import type { DiagramTextChangeEvent } from "../../../types/events/DiagramTextChangeEvent";
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utils.
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";

// Import hooks.
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle text change events on the canvas.
 * Handles both text editing initiation (Start) and text content changes (InProgress/End).
 */
export const useOnTextChange = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const onDataChange = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onDataChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramTextChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;
		const { onDataChange } = refBus.current;

		setCanvasState((prevState) => {
			// Handle text editing initiation
			if (e.eventPhase === "Started") {
				let targetItem: Diagram | undefined = undefined;

				const newState = {
					...prevState,
					items: applyFunctionRecursively(prevState.items, (item) => {
						if (item.id === e.id) {
							targetItem = item;
							return {
								...item,
								isTextEditing: true,
							};
						}
						return item;
					}),
				};

				if (!targetItem) return prevState;

				newState.textEditorState = {
					...(targetItem as Diagram),
					isActive: true,
				} as TextEditorState;

				return newState;
			}

			// Handle text content changes
			const isTextEditing = e.eventPhase !== "Ended";

			// Create a new state with the updated text.
			const newState = {
				...prevState,
				items: applyFunctionRecursively(prevState.items, (item) =>
					item.id === e.id ? { ...item, text: e.text, isTextEditing } : item,
				),
				textEditorState: {
					...prevState.textEditorState,
					text: e.text,
					isActive: isTextEditing,
				},
			};

			// Notify about data change.
			if (e.eventPhase === "Ended") {
				onDataChange(e.eventId, newState);
			}

			return newState;
		});
	}, []);
};
