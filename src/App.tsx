import "./App.css";
import SvgCanvas from "./components/molecules/SvgCanvas/SvgCanvas";
import DragPoint from "./components/molecules/SvgCanvas/DragPoint";
import Rectangle from "./components/molecules/SvgCanvas/Rectangle";

function App() {
	return (
		<>
			<SvgCanvas width="100%" height="100%">
				<DragPoint initialPoint={{ x: 0, y: 0 }} />
				<Rectangle
					initialPoint={{ x: 10, y: 10 }}
					initialWidth={100}
					initialHeight={100}
				>
					<circle cx={0} cy={0} r="10" />
				</Rectangle>
				<Rectangle
					initialPoint={{ x: 110, y: 110 }}
					initialWidth={100}
					initialHeight={100}
				/>
			</SvgCanvas>
		</>
	);
}

export default App;
