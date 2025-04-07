import SvgCanvas from "./components/molecules/SvgCanvas";
import { useSvgCanvas } from "./components/molecules/SvgCanvas/hooks/canvasHooks";
import Button from "./components/atoms/Button";
// import Input from "./components/atoms/Input";
import type { Diagram } from "./components/molecules/SvgCanvas/types/DiagramTypes";
import { createRectangleData } from "./components/molecules/SvgCanvas/components/diagram/Rectangle";
import { createEllipseData } from "./components/molecules/SvgCanvas/components/diagram/Ellipse";
import AIChat from "./components/organisms/AIChat";

import { getLogger } from "./utils/Logger";
import { Profiler } from "./utils/Profiler";

import { radiansToDegrees } from "./components/molecules/SvgCanvas/functions/Math";
import { svgDataToDiagram } from "./components/molecules/SvgCanvas/functions/Diagram";
const logger = getLogger("App");
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

const testItems1 = [
	createRectangleData({
		x: 100,
		y: 100,
	}),
	createEllipseData({
		x: 100,
		y: 100,
	}),
	{
		id: "g-1",
		type: "Group",
		x: 350,
		y: 350,
		width: 400,
		height: 400,
		rotation: radiansToDegrees(0),
		scaleX: 1,
		scaleY: 1,
		keepProportion: true,
		isSelected: false,
		isMultiSelectSource: false,
		items: [
			createRectangleData({
				x: 200,
				y: 200,
			}),
			createEllipseData({
				x: 300,
				y: 200,
			}),
			createRectangleData({
				x: 300,
				y: 300,
			}),
			createEllipseData({
				x: 200,
				y: 300,
			}),
			{
				id: "g-2",
				type: "Group",
				x: 450,
				y: 450,
				width: 200,
				height: 200,
				rotation: radiansToDegrees(0),
				scaleX: 1,
				scaleY: 1,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: true,
				isSelected: false,
				isMultiSelectSource: false,
				items: [
					createRectangleData({
						x: 400,
						y: 400,
					}),
					createEllipseData({
						x: 500,
						y: 400,
					}),
					createRectangleData({
						x: 500,
						y: 500,
					}),
				],
			},
			{
				id: "g-3",
				type: "Group",
				x: 450,
				y: 250,
				width: 200,
				height: 200,
				rotation: radiansToDegrees(0),
				scaleX: 1,
				scaleY: 1,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: true,
				isSelected: false,
				isMultiSelectSource: false,
				items: [
					createRectangleData({
						x: 400,
						y: 200,
					}),
					createRectangleData({
						x: 500,
						y: 300,
					}),
				],
			},
		],
	},
	{
		id: "12",
		type: "Path",
		x: 100,
		y: 150,
		width: 200,
		height: 100,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
		isMultiSelectSource: false,
		items: [
			{
				id: "12-1",
				type: "PathPoint",
				x: 0,
				y: 100,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
			},
			{
				id: "12-2",
				type: "PathPoint",
				x: 100,
				y: 100,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
			},
			{
				id: "12-3",
				type: "PathPoint",
				x: 200,
				y: 200,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
			},
		],
	},
] as Diagram[];

const testItems2 = [
	{
		id: "12",
		type: "Path",
		x: 0,
		y: 100,
		width: 100,
		height: 100,
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
		items: [
			{
				id: "12-1",
				type: "PathPoint",
				x: 0,
				y: 100,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-2",
				type: "PathPoint",
				x: 100,
				y: 100,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-3",
				type: "PathPoint",
				x: 200,
				y: 200,
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
		type: "Group",
		x: 250,
		y: 250,
		width: 300,
		height: 300,
		rotation: radiansToDegrees(0),
		scaleX: 1,
		scaleY: 1,
		keepProportion: true,
		isSelected: false,
		isMultiSelectSource: false,
		items: [
			{
				id: "3",
				type: "Rectangle",
				x: 150,
				y: 150,
				width: 100,
				height: 100,
				rotation: radiansToDegrees(0),
				scaleX: 1,
				scaleY: 1,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
			},
			createEllipseData({
				x: 250,
				y: 150,
			}),
			{
				id: "5",
				type: "Rectangle",
				x: 250,
				y: 250,
				width: 100,
				height: 100,
				rotation: radiansToDegrees(0),
				scaleX: 1,
				scaleY: 1,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
			},
			{
				id: "12",
				type: "Path",
				x: 350,
				y: 350,
				width: 100,
				height: 100,
				rotation: radiansToDegrees(0),
				scaleX: 1,
				scaleY: 1,
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
				items: [
					{
						id: "12-1",
						type: "PathPoint",
						x: 300,
						y: 300,
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "12-2",
						type: "PathPoint",
						x: 320,
						y: 340,
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "12-3",
						type: "PathPoint",
						x: 400,
						y: 400,
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
	createRectangleData({
		x: 300,
		y: 300,
	}),
	createRectangleData({
		x: 500,
		y: 300,
	}),
	createRectangleData({
		x: 700,
		y: 300,
	}),
	createRectangleData({
		x: 300,
		y: 500,
	}),
	createRectangleData({
		x: 500,
		y: 500,
	}),
	createRectangleData({
		x: 700,
		y: 500,
	}),
	createRectangleData({
		x: 300,
		y: 700,
	}),
	createRectangleData({
		x: 500,
		y: 700,
	}),
	createRectangleData({
		x: 700,
		y: 700,
	}),
] as Diagram[];

const testItems5 = [
	{
		id: "g-1",
		type: "Group",
		x: 200,
		y: 200,
		width: 200,
		height: 200,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		keepProportion: true,
		isSelected: false,
		items: [
			createRectangleData({
				x: 150,
				y: 150,
			}),
			createEllipseData({
				x: 150,
				y: 250,
			}),
			createRectangleData({
				x: 250,
				y: 250,
			}),
		],
	},
	createRectangleData({
		x: 300,
		y: 500,
	}),
	createRectangleData({
		x: 500,
		y: 500,
	}),
] as Diagram[];

const testItems6 = [
	{
		id: "12",
		type: "Path",
		x: 350,
		y: 350,
		width: 100,
		height: 100,
		rotation: radiansToDegrees(0),
		scaleX: 1,
		scaleY: 1,
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
		isMultiSelectSource: false,
		items: [
			{
				id: "12-1",
				type: "PathPoint",
				x: 300,
				y: 300,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-2",
				type: "PathPoint",
				x: 320,
				y: 340,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-3",
				type: "PathPoint",
				x: 400,
				y: 400,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
		],
	},
] as Diagram[];

const devData = {
	item1: testItems1,
	item2: testItems2,
	item3: testItems3,
	item4: testItems4,
	item5: testItems5,
	item6: testItems6,
};

function App() {
	const {
		state: [canvasState, setCanvasState],
		canvasProps,
		canvasFunctions,
	} = useSvgCanvas(devData.item1);

	// const {
	// 	state: [canvasState, setCanvasState],
	// 	canvasProps,
	// 	canvasFunctions,
	// } = useSvgCanvas([]);

	const handleAddRectangle = () => {
		canvasFunctions.addItem(createRectangleData({ x: 50, y: 50 }) as Diagram);
	};

	const handleAddEllipse = () => {
		canvasFunctions.addItem(
			createEllipseData({ x: 50, y: 50, width: 100, height: 50 }) as Diagram,
		);
	};

	const handleAddSquare = () => {
		canvasFunctions.addItem(
			createRectangleData({
				x: 50,
				y: 50,
				keepProportion: true,
			}) as Diagram,
		);
	};

	const handleAddCircle = () => {
		canvasFunctions.addItem({
			id: crypto.randomUUID(),
			type: "Ellipse",
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			keepProportion: true,
			isSelected: false,
		} as Diagram);
	};

	logger.debug("selectedItemId:", canvasState.selectedItemId);
	logger.debug("canvasState:", canvasState);

	return (
		<div className="App">
			<div
				style={{
					position: "absolute",
					top: 0,
					right: 0,
					bottom: 0,
					width: "300px",
					backgroundColor: "lightgray",
					overflow: "auto",
				}}
			>
				<Button onClick={handleAddRectangle}>Add Rectangle</Button>
				<Button onClick={handleAddEllipse}>Add Ellipse</Button>
				<Button onClick={handleAddSquare}>Add Square</Button>
				<Button onClick={handleAddCircle}>Add Circle</Button>
				<div>{`id:${canvasState.selectedItemId}`}</div>
				<div>{`x:${canvasFunctions.getSelectedItem()?.x}`}</div>
				<div>{`y:${canvasFunctions.getSelectedItem()?.y}`}</div>
				{/*
				<div>{`width:${canvasFunctions.getSelectedItem()?.width}`}</div>
				<div>{`height:${canvasFunctions.getSelectedItem()?.height}`}</div>
				<div>{`rotation:${canvasFunctions.getSelectedItem()?.rotation}`}</div>
				<div>{`scaleX:${canvasFunctions.getSelectedItem()?.scaleX}`}</div>
				<div>{`scaleY:${canvasFunctions.getSelectedItem()?.scaleY}`}</div>
				*/}
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
				{/*
				<Input
					value={canvasFunctions.getSelectedItem()?.width?.toString() || ""}
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
				*/}
				<Button
					onClick={() => {
						canvasFunctions.redo();
					}}
				>
					Redo
				</Button>
				<Button
					onClick={() => {
						canvasFunctions.undo();
					}}
				>
					Undo
				</Button>
				<Button
					onClick={() => {
						window.profiler.summary();
					}}
				>
					Profile
				</Button>
				<AIChat
					onResponse={(res) => {
						// try {
						// 	const item = makeDataFromAi(JSON.parse(res));
						// 	setCanvasState((prev) => ({
						// 		...prev,
						// 		items: [...prev.items, item],
						// 	}));
						// } catch (e) {
						// 	alert("Invalid JSON format. Please check the response.");
						// }
						try {
							const preview = document.getElementById("svg-preview");
							if (preview) {
								preview.innerHTML = res;
							}
							const item = svgDataToDiagram(res);
							setCanvasState((prev) => ({
								...prev,
								items: [...prev.items, item],
							}));
						} catch (e) {
							alert("Invalid SVG format. Please check the response.");
						}
					}}
				/>
				<div id="svg-preview" />
			</div>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: "300px",
					bottom: 0,
				}}
			>
				<SvgCanvas {...canvasProps} />
			</div>
		</div>
	);
}

export default App;
