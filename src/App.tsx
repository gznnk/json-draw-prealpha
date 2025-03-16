import SvgCanvas from "./components/molecules/SvgCanvas";
import { useSvgCanvas } from "./components/molecules/SvgCanvas/hooks";
import Button from "./components/atoms/Button";
import Input from "./components/atoms/Input";
import type { Diagram } from "./components/molecules/SvgCanvas/types/DiagramTypes";
import { createRectangleData } from "./components/molecules/SvgCanvas/components/diagram/Rectangle";

import { getLogger } from "./utils/Logger";
import { Profiler } from "./utils/Profiler";

import { radiansToDegrees } from "./components/molecules/SvgCanvas/functions/Math";
import { useEffect } from "react";
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
	{
		id: "1",
		type: "Rectangle",
		point: { x: 0, y: 0 },
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
	},
	{
		id: "2",
		type: "Ellipse",
		point: { x: 100, y: 100 },
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
	},
	{
		id: "g-1",
		type: "Group",
		point: { x: 350, y: 350 },
		width: 400,
		height: 400,
		rotation: radiansToDegrees(0),
		scaleX: 1,
		scaleY: 1,
		keepProportion: true,
		isSelected: false,
		items: [
			{
				id: "3",
				type: "Rectangle",
				point: { x: 200, y: 200 },
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
			},
			{
				id: "4",
				type: "Ellipse",
				point: { x: 300, y: 200 },
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
			},
			{
				id: "5",
				type: "Rectangle",
				point: { x: 300, y: 300 },
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
			},
			{
				id: "6",
				type: "Ellipse",
				point: { x: 200, y: 300 },
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
			},
			{
				id: "g-2",
				type: "Group",
				point: { x: 450, y: 450 },
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
				items: [
					{
						id: "7",
						type: "Rectangle",
						point: { x: 400, y: 400 },
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
					},
					{
						id: "8",
						type: "Ellipse",
						point: { x: 500, y: 400 },
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
					},
					{
						id: "9",
						type: "Rectangle",
						point: { x: 500, y: 500 },
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
					},
				],
			},
			{
				id: "g-3",
				type: "Group",
				point: { x: 450, y: 250 },
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
				items: [
					{
						id: "10",
						type: "Rectangle",
						point: { x: 400, y: 200 },
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
					},
					{
						id: "11",
						type: "Rectangle",
						point: { x: 500, y: 300 },
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
					},
				],
			},
		],
	},
	{
		id: "12",
		type: "Path",
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
				type: "PathPoint",
				point: { x: 0, y: 100 },
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-2",
				type: "PathPoint",
				point: { x: 100, y: 100 },
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-3",
				type: "PathPoint",
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
		type: "Path",
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
				type: "PathPoint",
				point: { x: 0, y: 100 },
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-2",
				type: "PathPoint",
				point: { x: 100, y: 100 },
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-3",
				type: "PathPoint",
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
		type: "Group",
		point: { x: 250, y: 250 },
		width: 300,
		height: 300,
		rotation: radiansToDegrees(0),
		scaleX: 1,
		scaleY: 1,
		keepProportion: true,
		isSelected: false,
		items: [
			{
				id: "3",
				type: "Rectangle",
				point: { x: 150, y: 150 },
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
			},
			{
				id: "4",
				type: "Ellipse",
				point: { x: 250, y: 150 },
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
			},
			{
				id: "x",
				type: "Triangle",
				point: { x: 350, y: 150 },
				width: 100,
				height: 100,
				rotation: radiansToDegrees(0),
				scaleX: 1,
				scaleY: 1,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
			},
			{
				id: "5",
				type: "Rectangle",
				point: { x: 250, y: 250 },
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
			},
			{
				id: "12",
				type: "Path",
				point: { x: 350, y: 350 },
				width: 100,
				height: 100,
				rotation: radiansToDegrees(0),
				scaleX: 1,
				scaleY: 1,
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
				items: [
					{
						id: "12-1",
						type: "PathPoint",
						point: { x: 300, y: 300 },
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "12-2",
						type: "PathPoint",
						point: { x: 300, y: 400 },
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "12-3",
						type: "PathPoint",
						point: { x: 400, y: 400 },
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
	createRectangleData(
		crypto.randomUUID(),
		{ x: 300, y: 300 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
	createRectangleData(
		crypto.randomUUID(),
		{ x: 500, y: 300 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
	createRectangleData(
		crypto.randomUUID(),
		{ x: 700, y: 300 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
	createRectangleData(
		crypto.randomUUID(),
		{ x: 300, y: 500 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
	createRectangleData(
		crypto.randomUUID(),
		{ x: 500, y: 500 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
	createRectangleData(
		crypto.randomUUID(),
		{ x: 700, y: 500 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
	createRectangleData(
		crypto.randomUUID(),
		{ x: 300, y: 700 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
	createRectangleData(
		crypto.randomUUID(),
		{ x: 500, y: 700 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
	createRectangleData(
		crypto.randomUUID(),
		{ x: 700, y: 700 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
] as Diagram[];

const testItems5 = [
	{
		id: "g-1",
		type: "Group",
		point: { x: 200, y: 200 },
		width: 200,
		height: 200,
		rotation: radiansToDegrees(0),
		scaleX: 1,
		scaleY: 1,
		keepProportion: true,
		isSelected: false,
		items: [
			{
				id: "3",
				type: "Rectangle",
				point: { x: 150, y: 150 },
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
			},
			{
				id: "4",
				type: "Ellipse",
				point: { x: 150, y: 250 },
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
			},
			{
				id: "5",
				type: "Rectangle",
				point: { x: 250, y: 250 },
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
			},
		],
	},
] as Diagram[];

const testItems6 = [
	createRectangleData(
		crypto.randomUUID(),
		{ x: 300, y: 300 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
	createRectangleData(
		crypto.randomUUID(),
		{ x: 500, y: 300 },
		100,
		100,
		"transparent",
		"black",
		"1px",
	),
] as Diagram[];

function App() {
	const {
		state: [canvasState, _setCanvasState],
		canvasProps,
		canvasFunctions,
	} = useSvgCanvas(testItems6);

	const handleAddRectangle = () => {
		canvasFunctions.addItem(
			createRectangleData(
				crypto.randomUUID(),
				{ x: 50, y: 50 },
				100,
				100,
				"transparent",
				"black",
				"1px",
			) as Diagram,
		);
	};

	const handleAddEllipse = () => {
		canvasFunctions.addItem({
			id: crypto.randomUUID(),
			type: "Ellipse",
			point: { x: 0, y: 0 },
			width: 200,
			height: 100,
			keepProportion: false,
			isSelected: false,
		});
	};

	const handleAddSquare = () => {
		canvasFunctions.addItem({
			id: crypto.randomUUID(),
			type: "Rectangle",
			point: { x: 0, y: 0 },
			width: 100,
			height: 100,
			keepProportion: true,
			isSelected: false,
		});
	};

	const handleAddCircle = () => {
		canvasFunctions.addItem({
			id: crypto.randomUUID(),
			type: "Ellipse",
			point: { x: 0, y: 0 },
			width: 100,
			height: 100,
			keepProportion: true,
			isSelected: false,
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
				<div>{`rotation:${canvasFunctions.getSelectedItem()?.rotation}`}</div>
				<div>{`scaleX:${canvasFunctions.getSelectedItem()?.scaleX}`}</div>
				<div>{`scaleY:${canvasFunctions.getSelectedItem()?.scaleY}`}</div>
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
				<Button
					onClick={() => {
						window.profiler.summary();
					}}
				>
					Profile
				</Button>
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
