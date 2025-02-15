import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Input from "./components/atoms/Input";
import Draggable from "./components/atoms/Draggable";
import DraggablePoint from "./components/atoms/DraggablePoint";
import Line from "./components/atoms/Line";
import DraggableLine from "./components/atoms/DraggableLine";
// import Rectangle from "./components/atoms/Rectangle";
import DraggableRectangle from "./components/atoms/DraggableRectangle";
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
				/>
			</SvgCanvas>
		</>
	);
}

export default App;
