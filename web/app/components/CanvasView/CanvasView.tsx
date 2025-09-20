import type { ReactElement } from "react";
import { memo, useEffect, useRef } from "react";

import type { CanvasViewProps } from "./CanvasViewTypes";
import { SvgCanvas, useSvgCanvas } from "../../../features/svg-canvas";
import type { SvgCanvasRef } from "../../../features/svg-canvas/canvas/types/SvgCanvasRef";

/**
 * Component that renders an SVG canvas using SvgCanvasData supplied by the parent.
 * Data is received directly from the parent component instead of local storage.
 */
const CanvasViewComponent = ({
	content,
	id,
	onDataChange,
}: CanvasViewProps): ReactElement => {
	// Create a reference to the canvas
	const canvasRef = useRef<SvgCanvasRef | null>(null);

	// Extract canvas data from the content
	const canvasId = id || content.id;
	const { items, minX, minY, zoom } = content;
	// Initialize required state with the useSvgCanvas hook
	const { canvasProps, loadCanvasData } = useSvgCanvas({
		id: canvasId,
		minX: minX || 0,
		minY: minY || 0,
		zoom: zoom || 1,
		items,
		canvasRef,
		onDataChange,
	});

	useEffect(() => {
		// Reload canvas data when content prop changes
		loadCanvasData({
			id: canvasId,
			minX: minX || 0,
			minY: minY || 0,
			zoom: zoom || 1,
			items,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canvasId]);

	// Spread all required props to the SvgCanvas component
	return <SvgCanvas {...canvasProps} ref={canvasRef} />;
};

export const CanvasView = memo(CanvasViewComponent);
