// Import React.
import { useRef, useEffect } from "react";

// Import types related to SvgCanvas.
import type { ConnectLineData } from "../../components/shapes/ConnectLine";
import type { PathPointData } from "../../components/shapes/Path";
import type { Diagram } from "../../types/DiagramCatalog";
import type { ConnectableData, Shape } from "../../types/DiagramTypes";
import type { ConnectNodesEvent } from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { createBestConnectPath } from "../../components/shapes/ConnectPoint";
import { newId } from "../../utils/Diagram";
import { calcPointsOuterShape } from "../../utils/Math";

// Import hooks related to SvgCanvas.
import { useNewItem } from "./useNewItem";

// Imports related to this component.
import { getDiagramById } from "../SvgCanvasFunctions";

// Event name for connecting nodes on the canvas.
export const CONNECT_NODES_EVENT_NAME = "connectNodes";

/**
 * Function to trigger a connect nodes event on the canvas.
 * @param e - The connect nodes event to be triggered.
 */
export const triggerConnectNodesEvent = (e: ConnectNodesEvent) => {
	// Create a new event with the specified name and detail.
	const event = new CustomEvent(CONNECT_NODES_EVENT_NAME, {
		detail: e,
	});
	// Dispatch the event on the window object.
	window.dispatchEvent(event);
};

/**
 * Custom hook to handle connect nodes events on the canvas.
 */
export const useConnectNodes = (props: CanvasHooksProps) => {
	// Get the function to add items to the canvas.
	const onNewItem = useNewItem(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onNewItem,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		// Add an event listener for the connect nodes event.
		const connectNodesListener = (e: Event) => {
			// Convert the event to a CustomEvent with the correct type.
			const event = (e as CustomEvent<ConnectNodesEvent>).detail;

			// Bypass references to avoid function creation in every render.
			const { onNewItem, props } = refBus.current;

			// Get the source and target nodes data from canvas state.
			const { canvasState } = props;
			const sourceNode = getDiagramById(
				canvasState.items,
				event.sourceNodeId,
			) as Diagram;
			const targetNode = getDiagramById(
				canvasState.items,
				event.targetNodeId,
			) as Diagram;

			if (!sourceNode || !targetNode) {
				console.error("Source or target node not found.");
				return;
			}

			const sourceConnectPoint = (
				sourceNode as ConnectableData
			).connectPoints.find((p) => p.name === "bottomCenterPoint");
			const targetConnectPoint = (
				targetNode as ConnectableData
			).connectPoints.find((p) => p.name === "topCenterPoint");

			if (!sourceConnectPoint || !targetConnectPoint) {
				console.error("Source or target connect point not found.");
				return;
			}

			const points = createBestConnectPath(
				sourceConnectPoint.x,
				sourceConnectPoint.y,
				sourceNode as Shape,
				targetConnectPoint.x,
				targetConnectPoint.y,
				targetNode as Shape,
			);

			const shape = calcPointsOuterShape(
				points.map((p) => ({ x: p.x, y: p.y })),
			);

			const newPathPointId = (i: number) => {
				if (i === 0) {
					return sourceConnectPoint.id;
				}
				if (i === points.length - 1) {
					return targetConnectPoint.id;
				}
				return newId();
			};

			const pathPoints = points.map((p, i) => ({
				...p,
				id: newPathPointId(i),
				type: "PathPoint",
			})) as PathPointData[];

			onNewItem({
				eventId: event.eventId,
				item: {
					id: newId(),
					type: "ConnectLine",
					x: shape.x,
					y: shape.y,
					width: shape.width,
					height: shape.height,
					stroke: "#fed579",
					strokeWidth: "3px",
					isSelected: false,
					keepProportion: false,
					items: pathPoints,
					startOwnerId: sourceNode.id,
					endOwnerId: targetNode.id,
					autoRouting: true,
					endArrowHead: "Circle",
				} as ConnectLineData,
			});
		};
		window.addEventListener(CONNECT_NODES_EVENT_NAME, connectNodesListener);

		// Cleanup the event listener on component unmount.
		return () => {
			window.removeEventListener(
				CONNECT_NODES_EVENT_NAME,
				connectNodesListener,
			);
		};
	}, []);
};
