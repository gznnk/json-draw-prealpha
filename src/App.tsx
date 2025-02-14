import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Input from "./components/atoms/Input";
import Draggable from "./components/atoms/Draggable";
import DraggablePoint from "./components/atoms/DraggablePoint";
import Line from "./components/atoms/Line";
import DraggableLine from "./components/atoms/DraggableLine";

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
					position: "fixed",
					left: 10,
					top: 10,
					width: "100vw",
					height: "100vh",
				}}
			>
				<Line start={{ x: 50, y: 50 }} end={{ x: 100, y: 100 }} />
				<Draggable initialPoint={{ x: 0, y: 0 }}>あああ</Draggable>
				<Draggable initialPoint={{ x: 0, y: 0 }}>いいい</Draggable>
				<DraggablePoint initialPoint={{ x: 0, y: 0 }} diameter={40} />
				<DraggableLine
					initialStartPoint={{ x: 100, y: 100 }}
					initialEndPoint={{ x: 150, y: 150 }}
				/>
			</div>
		</>
	);
}

export default App;
