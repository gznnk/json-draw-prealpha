import { useCallback } from "react";

import { useScroll } from "./useScroll";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

/**
 * Custom hook to handle navigation events using scroll functionality.
 * This provides a way to programmatically navigate to specific coordinates on the canvas.
 */
export const useNavigate = (props: SvgCanvasSubHooksProps) => {
	// Get scroll handler
	const onScroll = useScroll(props);

	return useCallback(
		(minX: number, minY: number) => {
			// Use scroll handler with the specified coordinates
			onScroll({
				newMinX: minX,
				newMinY: minY,
				clientX: 0,
				clientY: 0,
				deltaX: 0,
				deltaY: 0,
			});
		},
		[onScroll],
	);
};
