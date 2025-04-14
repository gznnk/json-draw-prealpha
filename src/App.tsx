import { SvgCanvas, useSvgCanvas } from "./features/svg-canvas";
// import Input from "./components/atoms/Input";

// import { getLogger } from "./utils/Logger";
import { Profiler } from "./utils/Profiler";

import {
	loadCanvasDataFromString,
	// loadCanvasDataFromLocalStorage,
} from "./features/svg-canvas/components/diagrams/SvgCanvas/SvgCanvasFunctions";
// const logger = getLogger("App");
declare global {
	interface Window {
		profiler: Profiler;
	}
}

if (!window.profiler) {
	window.profiler = new Profiler();

	// setInterval(() => {
	// 	window.profiler.summary();
	// }, 5000);
}

import data from "./data2.json";

function App() {
	const loadedCanvasState = loadCanvasDataFromString(data);
	//const loadedCanvasState = loadCanvasDataFromLocalStorage();

	const { canvasProps } = useSvgCanvas(
		window.screen.width,
		window.screen.height,
		loadedCanvasState?.items ?? [],
	);

	// const {
	// 	state: [canvasState, setCanvasState],
	// 	canvasProps,
	// 	canvasFunctions,
	// } = useSvgCanvas([]);

	return (
		<div className="App">
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "#eeeeee",
				}}
			>
				<SvgCanvas {...canvasProps} />
			</div>
		</div>
	);
}

export default App;
