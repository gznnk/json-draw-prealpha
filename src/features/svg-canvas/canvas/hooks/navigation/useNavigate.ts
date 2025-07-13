// Import React.
import { useCallback } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import hooks.
import { useScroll } from "./useScroll";

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
			onScroll({ minX, minY, clientX: 0, clientY: 0 });
		},
		[onScroll],
	);
};
