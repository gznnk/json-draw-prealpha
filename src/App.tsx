import SvgCanvas from "./components/molecules/SvgCanvas";
import { useSvgCanvas } from "./components/molecules/SvgCanvas/hooks";

function App() {
	console.log("App render");

	const {
		state: [canvasState, setCanvasState],
		canvasProps,
		canvasFunctions,
	} = useSvgCanvas();

	return (
		<div className="App">
			<header
				className="App-header"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: "50px",
					backgroundColor: "black",
					color: "white",
				}}
			>
				<h1 style={{ margin: 0 }}>SVG Canvas</h1>
			</header>
			<div
				style={{
					position: "absolute",
					top: 0,
					right: 0,
					bottom: 0,
					width: "100px",
					backgroundColor: "lightgray",
				}}
			>
				<button type="button" onClick={canvasFunctions.addRectangle}>
					Add Rectangle
				</button>
				{canvasState.selectedItemId}
			</div>
			<div
				style={{
					position: "absolute",
					top: "50px",
					left: 0,
					right: "100px",
					bottom: 0,
				}}
			>
				<SvgCanvas {...canvasProps} />
			</div>
		</div>
	);
}

export default App;
