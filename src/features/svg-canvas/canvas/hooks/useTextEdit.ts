// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../catalog";
import type { DiagramTextEditEvent } from "../../types/events";
import type { CanvasHooksProps } from "../SvgCanvasTypes";
import type { TextEditorState } from "../../components/core/Textable";

// Import functions related to SvgCanvas.
import { applyRecursive } from "../SvgCanvasFunctions";

/**
 * Custom hook to handle text edit events on the canvas.
 */
export const useTextEdit = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramTextEditEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			let targetItem: Diagram | undefined = undefined;

			const newState = {
				...prevState,
				items: applyRecursive(prevState.items, (item) => {
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
		});
	}, []);
};
