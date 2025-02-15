import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Input from "./components/atoms/Input";
import Draggable from "./components/atoms/Draggable";
import DraggablePoint from "./components/atoms/DraggablePoint";
import Line from "./components/atoms/Line";
import DraggableLine from "./components/atoms/DraggableLine";
import Rectangle from "./components/atoms/Rectangle";
import DraggableRectangle from "./components/atoms/DraggableRectangle";

function App() {
	const [inputValue, setInputValue] = useState("");

	return (
		<>
			<Input
				value={inputValue}
				regex={/\d/g}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					setInputValue(e.target.value)
				}
			/>
			<div
				style={{
					position: "absolute",
					left: 10,
					top: 10,
					width: "90%",
					height: "200vh",
					backgroundColor: "lightgray",
				}}
			>
				<DraggableRectangle
					initialStartPoint={{ x: 0, y: 0 }}
					initialEndPoint={{ x: 250, y: 250 }}
				>
					AAAAAA
				</DraggableRectangle>
				<DraggablePoint initialPoint={{ x: 0, y: 0 }} />
			</div>
		</>
	);
}

export default App;
