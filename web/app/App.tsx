import type { ReactElement } from "react";

import { CanvasView } from "./components/CanvasView";
import { Page } from "./components/Page";
import { CanvasDataProvider, useCanvasData } from "./context/CanvasDataContext";

/**
 * Inner App component that uses canvas data context
 */
const AppContent = (): ReactElement => {
	const { canvas, updateCanvas } = useCanvasData();

	return (
		<Page>
			{canvas?.content && (
				<CanvasView
					content={canvas.content}
					onDataChange={updateCanvas}
				/>
			)}
		</Page>
	);
};

/**
 * App component
 * Defines the main application layout
 */
const App = (): ReactElement => {
	return (
		<div className="App">
			<CanvasDataProvider>
				<AppContent />
			</CanvasDataProvider>
		</div>
	);
};

export default App;