import type { ReactElement } from "react";
import { memo, useCallback, useEffect, useRef } from "react";

import type { CanvasViewProps } from "./CanvasViewTypes";
import { SvgCanvas, useSvgCanvas } from "../../../features/svg-canvas";
import type { SvgCanvasPanZoom } from "../../../features/svg-canvas/canvas/types/SvgCanvasPanZoom";
import type { SvgCanvasRef } from "../../../features/svg-canvas/canvas/types/SvgCanvasRef";
import type { SessionPanZoomSaver } from "../../../features/svg-canvas/utils/core/sessionPanZoomStorage";
import {
	loadSessionPanZoom,
	createSessionPanZoomSaver,
} from "../../../features/svg-canvas/utils/core/sessionPanZoomStorage";

/**
 * Component that renders an SVG canvas using SvgCanvasData supplied by the parent.
 * Data is received directly from the parent component instead of local storage.
 */
const CanvasViewComponent = ({
	content,
	id,
	onDataChange,
}: CanvasViewProps): ReactElement => {
	// Extract canvas data from the content
	const canvasId = id || content.id;
	const { items, minX, minY, zoom } = content;
	const panZoom = {
		minX,
		minY,
		zoom,
		...loadSessionPanZoom(canvasId),
	};

	// Create a reference to the canvas
	const canvasRef = useRef<SvgCanvasRef | null>(null);
	const panZoomSaver = useRef<SessionPanZoomSaver>(
		createSessionPanZoomSaver(canvasId),
	);

	const onPanZoomChange = useCallback((pz: SvgCanvasPanZoom) => {
		panZoomSaver.current(pz);
	}, []);

	// Initialize required state with the useSvgCanvas hook
	const { canvasProps, loadCanvasData } = useSvgCanvas({
		id: canvasId,
		...panZoom,
		items,
		canvasRef,
		onDataChange,
		onPanZoomChange,
	});

	useEffect(() => {
		// Reload canvas data when content prop changes
		const panZoom = {
			minX,
			minY,
			zoom,
			...loadSessionPanZoom(canvasId),
		};
		loadCanvasData({
			id: canvasId,
			...panZoom,
			items,
		});
		panZoomSaver.current = createSessionPanZoomSaver(canvasId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canvasId]);

	// Spread all required props to the SvgCanvas component
	return <SvgCanvas {...canvasProps} ref={canvasRef} />;
};

export const CanvasView = memo(CanvasViewComponent);
