// Import React.
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

// Import components.
import { Page } from "./components/Page";
import { CanvasView } from "./components/CanvasView";

// Import repository and factory.
import {
	createSvgCanvasRepository,
	type SvgCanvasRepository,
} from "./repository/svg-canvas";
import type { SvgCanvas } from "./models/SvgCanvas";

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

	return (
		<div className="App">
			<Page>
				{initialCanvasState?.content && (
					<CanvasView
						content={initialCanvasState?.content}
						onDataChange={async (data) => {
							// Save canvas data to the repository when it changes
							await svgCanvasRepository.updateCanvas({
								...initialCanvasState,
								content: data,
							});
						}}
					/>
				)}
			</Page>
		</div>
	);
};

export default App;
