import { useCallback, useRef } from "react";

import type { PreviewConnectLineEvent } from "../../../types/events/PreviewConnectLineEvent";
import { isConnectableState } from "../../../utils/validation/isConnectableState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { clearSelectionRecursively } from "../../utils/clearSelectionRecursively";

/**
 * Custom hook to handle preview connect line events on the canvas.
 * Updates the canvas state to show or hide the preview connection line.
 */
export const usePreviewConnectLine = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: PreviewConnectLineEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			let newState = {
				...prevState,
				previewConnectLineState: e.pathData,
			};

			// Clear all selections when connection preview starts
			if (e.eventPhase === "Started") {
				newState.items = clearSelectionRecursively(prevState.items);
				newState.multiSelectGroup = undefined;
			}

			// Update connect point position
			newState = {
				...newState,
				items: applyFunctionRecursively(newState.items, (item) => {
					if (isConnectableState(item)) {
						const point = item.connectPoints.find((cp) => cp.id === e.id);
						if (point) {
							return {
								...item,
								connectPoints: item.connectPoints.map((cp) =>
									cp.id === e.id ? { ...cp, x: e.x, y: e.y } : cp,
								),
							};
						}
					}
					return item;
				}),
			};

			if (e.minX !== undefined && e.minY !== undefined) {
				newState.minX = e.minX;
				newState.minY = e.minY;
			}

			return newState;
		});
	}, []);
};
