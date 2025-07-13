// Import React.
import type { ReactElement } from "react";
import { useEffect, useState, useCallback } from "react";

// Import components.
import { Page } from "./components/Page";
import { CanvasView } from "./components/CanvasView";

// Import repository and factory.
import {
	createSvgCanvasRepository,
	type SvgCanvasRepository,
} from "./repository/svg-canvas";
import type { SvgCanvas } from "./models/SvgCanvas";
import type { SvgCanvasData } from "../features/svg-canvas/canvas/types/SvgCanvasData";

const svgCanvasRepository: SvgCanvasRepository = createSvgCanvasRepository();

/**
 * App component
 * Defines the main application layout
 */
const App = (): ReactElement => {
	const [initialCanvasState, setInitialCanvasState] =
		useState<SvgCanvas | null>(null);

	useEffect(() => {
		// Fetch initial canvas data
		const fetchInitialCanvasData = async () => {
			try {
				const canvasData =
					await svgCanvasRepository.getCanvasById("default-canvas");
				if (canvasData) {
					setInitialCanvasState(canvasData);
				} else {
					// If no default canvas exists, set empty data
					setInitialCanvasState({
						id: "default-canvas",
						name: "Default Canvas",
						content: {
							id: "default-canvas",
							items: [],
							minX: 0,
							minY: 0,
						},
					});
				}
			} catch (error) {
				console.error("Failed to fetch initial canvas data:", error);
			}
		};
		fetchInitialCanvasData();
	}, []);

	const handleCanvasUpdate = useCallback(
		(data: SvgCanvasData) => {
			try {
				// Reconstruct the full canvas object with the updated data
				const updatedCanvas: SvgCanvas = {
					id: initialCanvasState?.id || "default-canvas",
					name: initialCanvasState?.name || "Default Canvas",
					content: data,
				};
				// Update the canvas in the repository
				svgCanvasRepository.updateCanvas(updatedCanvas);
			} catch (error) {
				console.error("Failed to update canvas:", error);
			}
		},
		[initialCanvasState],
	);

	return (
		<div className="App">
			<Page>
				{initialCanvasState?.content && (
					<CanvasView
						content={initialCanvasState?.content}
						onDataChange={handleCanvasUpdate}
					/>
				)}
			</Page>
		</div>
	);
};

export default App;
