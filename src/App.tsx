import SvgCanvas from "./components/molecules/SvgCanvas";
import { useSvgCanvas } from "./components/molecules/SvgCanvas/hooks";
import Button from "./components/atoms/Button";
import Input from "./components/atoms/Input";
import type { Diagram } from "./components/molecules/SvgCanvas/types/DiagramTypes";

import { getLogger } from "./utils/Logger";
const logger = getLogger("App");

const testItems1 = [
	{
		id: "1",
		type: "rectangle",
		point: { x: 0, y: 0 },
		width: 100,
		height: 100,
		fill: "transparent",
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
	},
	{
		id: "2",
		type: "ellipse",
		point: { x: 100, y: 100 },
		width: 100,
		height: 100,
		fill: "transparent",
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
	},
	{
		id: "g-1",
		type: "group",
		point: { x: 200, y: 200 },
		width: 400,
		height: 400,
		keepProportion: true,
		isSelected: false,
		items: [
			{
				id: "3",
				type: "rectangle",
				point: { x: 200, y: 200 },
				width: 100,
				height: 100,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "4",
				type: "ellipse",
				point: { x: 300, y: 200 },
				width: 100,
				height: 100,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "5",
				type: "rectangle",
				point: { x: 300, y: 300 },
				width: 100,
				height: 100,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "6",
				type: "ellipse",
				point: { x: 200, y: 300 },
				width: 100,
				height: 100,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "g-2",
				type: "group",
				point: { x: 400, y: 400 },
				width: 200,
				height: 200,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: true,
				isSelected: false,
				items: [
					{
						id: "7",
						type: "rectangle",
						point: { x: 400, y: 400 },
						width: 100,
						height: 100,
						fill: "transparent",
						stroke: "black",
						strokeWidth: "1px",
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "8",
						type: "ellipse",
						point: { x: 500, y: 400 },
						width: 100,
						height: 100,
						fill: "transparent",
						stroke: "black",
						strokeWidth: "1px",
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "9",
						type: "rectangle",
						point: { x: 500, y: 500 },
						width: 100,
						height: 100,
						fill: "transparent",
						stroke: "black",
						strokeWidth: "1px",
						keepProportion: false,
						isSelected: false,
					},
				],
			},
			{
				id: "g-3",
				type: "group",
				point: { x: 400, y: 200 },
				width: 200,
				height: 200,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: true,
				isSelected: false,
				items: [
					{
						id: "10",
						type: "rectangle",
						point: { x: 400, y: 200 },
						width: 100,
						height: 100,
						fill: "transparent",
						stroke: "black",
						strokeWidth: "1px",
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "11",
						type: "rectangle",
						point: { x: 500, y: 300 },
						width: 100,
						height: 100,
						fill: "transparent",
						stroke: "black",
						strokeWidth: "1px",
						keepProportion: false,
						isSelected: false,
					},
				],
			},
		],
	},
	{
		id: "12",
		type: "line",
		point: { x: 0, y: 100 },
		width: 100,
		height: 100,
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
		items: [
			{
				id: "12-1",
				type: "linePoint",
				point: { x: 0, y: 100 },
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-2",
				type: "linePoint",
				point: { x: 100, y: 100 },
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-3",
				type: "linePoint",
				point: { x: 200, y: 200 },
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
		],
	},
] as Diagram[];

const testItems2 = [
	{
		id: "12",
		type: "line",
		point: { x: 0, y: 100 },
		width: 100,
		height: 100,
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
		items: [
			{
				id: "12-1",
				type: "linePoint",
				point: { x: 0, y: 100 },
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-2",
				type: "linePoint",
				point: { x: 100, y: 100 },
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-3",
				type: "linePoint",
				point: { x: 200, y: 200 },
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
		],
	},
] as Diagram[];

const testItems3 = [
	{
		id: "g-1",
		type: "group",
		point: { x: 200, y: 200 },
		width: 300,
		height: 300,
		keepProportion: true,
		isSelected: false,
		items: [
			{
				id: "3",
				type: "rectangle",
				point: { x: 200, y: 200 },
				width: 100,
				height: 100,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "4",
				type: "ellipse",
				point: { x: 300, y: 200 },
				width: 100,
				height: 100,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "5",
				type: "rectangle",
				point: { x: 300, y: 300 },
				width: 100,
				height: 100,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12",
				type: "line",
				point: { x: 400, y: 400 },
				width: 100,
				height: 100,
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
				items: [
					{
						id: "12-1",
						type: "linePoint",
						point: { x: 400, y: 400 },
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "12-2",
						type: "linePoint",
						point: { x: 400, y: 500 },
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "12-3",
						type: "linePoint",
						point: { x: 500, y: 500 },
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
				],
			},
		],
	},
] as Diagram[];

const testItems4 = [
	{
		id: "1",
		type: "rectangle",
		point: { x: 200, y: 200 },
		width: 100,
		height: 100,
		fill: "transparent",
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
	},
	{
		id: "2",
		type: "rectangle",
		point: { x: 500, y: 500 },
		width: 100,
		height: 100,
		fill: "transparent",
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
	},
] as Diagram[];

function App() {
	const {
		state: [canvasState, _setCanvasState],
		canvasProps,
		canvasFunctions,
	} = useSvgCanvas(testItems4);

	const handleAddRectangle = () => {
		canvasFunctions.addItem({
			type: "rectangle",
			width: 200,
			height: 100,
		});
	};

	const handleAddEllipse = () => {
		canvasFunctions.addItem({
			type: "ellipse",
			width: 200,
			height: 100,
		});
	};

	const handleAddSquare = () => {
		canvasFunctions.addItem({
			type: "rectangle",
			width: 100,
			height: 100,
			keepProportion: true,
		});
	};

	const handleAddCircle = () => {
		canvasFunctions.addItem({
			type: "ellipse",
			width: 100,
			height: 100,
			keepProportion: true,
		});
	};

	logger.debug("selectedItemId:", canvasState.selectedItemId);
	logger.debug("canvasState:", canvasState);

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
					overflow: "hidden",
				}}
			>
				<Button onClick={handleAddRectangle}>Add Rectangle</Button>
				<Button onClick={handleAddEllipse}>Add Ellipse</Button>
				<Button onClick={handleAddSquare}>Add Square</Button>
				<Button onClick={handleAddCircle}>Add Circle</Button>
				<div>{`id:${canvasState.selectedItemId}`}</div>
				<div>{`x:${canvasFunctions.getSelectedItem()?.point.x}`}</div>
				<div>{`y:${canvasFunctions.getSelectedItem()?.point.y}`}</div>
				<div>{`width:${canvasFunctions.getSelectedItem()?.width}`}</div>
				<div>{`height:${canvasFunctions.getSelectedItem()?.height}`}</div>
				{/* <Input
					value={canvasFunctions.getSelectedItem()?.fill || ""}
					onChange={(e) => {
						if (!canvasState.selectedItemId) return;
						canvasFunctions.updateItem({
							id: canvasState.selectedItemId,
							fill: e.target.value,
						});
					}}
				/> */}
				<Input
					value={canvasFunctions.getSelectedItem()?.width.toString() || ""}
					onChange={(e) => {
						if (!canvasState.selectedItemId) return;
						canvasFunctions.updateItem({
							id: canvasState.selectedItemId,
							width: Number(e.target.value),
						});
					}}
				/>
				<div>
					keepProportion:
					<input
						type="checkbox"
						checked={canvasFunctions.getSelectedItem()?.keepProportion || false}
						onChange={(e) => {
							if (!canvasState.selectedItemId) return;
							canvasFunctions.updateItem({
								id: canvasState.selectedItemId,
								keepProportion: e.target.checked,
							});
						}}
					/>
				</div>
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
