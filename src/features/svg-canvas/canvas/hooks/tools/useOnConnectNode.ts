// Import React.
import { useEffect, useRef } from "react";

// Import types.
import type { Shape } from "../../../types/core/Shape";
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { ConnectableData } from "../../../types/data/shapes/ConnectableData";
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { PathPointData } from "../../../types/data/shapes/PathPointData";
import type { ConnectNodesEvent } from "../../../types/events/ConnectNodesEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import constants.
import { EVENT_NAME_CONNECT_NODE } from "../../../constants/EventNames";

// Import utils.
import { getDiagramById } from "../../../utils/common/getDiagramById";
import { calcOrientedShapeFromPoints } from "../../../utils/math/geometry/calcOrientedShapeFromPoints";
import { newId } from "../../../utils/shapes/common/newId";
import { generateOptimalShapeToShapeConnection } from "../../../utils/shapes/connectPoint/generateOptimalShapeToShapeConnection";
import { dispatchNewItemEvent } from "../listeners/addNewItem";

/**
 * Hook that monitors ConnectNode events and performs node connections.
 */
export const useOnConnectNodes = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBus = useRef({ props });
	refBus.current = { props };

	useEffect(() => {
		// Bypass references to avoid function creation in every render.
		const { props } = refBus.current;
		const { canvasState, eventBus } = props;

		const connectNodesListener = (e: Event) => {
			const event = (e as CustomEvent<ConnectNodesEvent>).detail;

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

			const points = generateOptimalShapeToShapeConnection(
				sourceConnectPoint.x,
				sourceConnectPoint.y,
				sourceNode as Shape,
				targetConnectPoint.x,
				targetConnectPoint.y,
				targetNode as Shape,
			);

			const shape = calcOrientedShapeFromPoints(
				points.map((p) => ({ x: p.x, y: p.y })),
			);

			const newPathPointId = (i: number) => {
				if (i === 0) return sourceConnectPoint.id;
				if (i === points.length - 1) return targetConnectPoint.id;
				return newId();
			};

			const pathPoints = points.map((p, i) => ({
				...p,
				id: newPathPointId(i),
				type: "PathPoint",
			})) as PathPointData[];

			dispatchNewItemEvent({
				eventId: event.eventId,
				item: {
					id: newId(),
					type: "ConnectLine",
					x: shape.x,
					y: shape.y,
					width: shape.width,
					height: shape.height,
					stroke: "#3A415C",
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

		eventBus.addEventListener(EVENT_NAME_CONNECT_NODE, connectNodesListener);

		return () => {
			eventBus.removeEventListener(
				EVENT_NAME_CONNECT_NODE,
				connectNodesListener,
			);
		};
	}, []);
};
