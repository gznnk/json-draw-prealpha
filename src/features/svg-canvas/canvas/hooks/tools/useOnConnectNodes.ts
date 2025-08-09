// Import React.
import { useEffect, useRef } from "react";

// Import types.
import type { Shape } from "../../../types/core/Shape";
import type { ConnectableState } from "../../../types/state/shapes/ConnectableState";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";
import type { PathPointState } from "../../../types/state/shapes/PathPointState";
import type { ConnectNodesEvent } from "../../../types/events/ConnectNodesEvent";
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import constants.
import { DefaultConnectLineState } from "../../../constants/state/shapes/DefaultConnectLineState";
import { EVENT_NAME_CONNECT_NODES } from "../../../constants/core/EventNames";

// Import utils.
import { getDiagramById } from "../../../utils/core/getDiagramById";
import { calcOrientedShapeFromPoints } from "../../../utils/math/geometry/calcOrientedShapeFromPoints";
import { newId } from "../../../utils/shapes/common/newId";
import { generateOptimalShapeToShapeConnection } from "../../../utils/shapes/connectPoint/generateOptimalShapeToShapeConnection";

// Import hooks.
import { useAddDiagram } from "../actions/useAddDiagram";

/**
 * Hook that monitors ConnectNodes events and performs node connections.
 */
export const useOnConnectNodes = (props: SvgCanvasSubHooksProps) => {
	// Create a function to add a new diagram.
	const addDiagram = useAddDiagram(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addDiagram,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		// Bypass references to avoid function creation in every render.
		const { eventBus } = refBus.current.props;

		const connectNodesListener = (e: Event) => {
			// Bypass references to avoid function creation in every render.
			const { props, addDiagram } = refBus.current;
			const { canvasState } = props;

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
				sourceNode as ConnectableState
			).connectPoints.find((p) => p.name === "bottomCenterPoint");

			const targetConnectPoint = (
				targetNode as ConnectableState
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
			})) as PathPointState[];

			addDiagram({
				eventId: event.eventId,
				item: {
					...DefaultConnectLineState,
					id: newId(),
					x: shape.x,
					y: shape.y,
					width: shape.width,
					height: shape.height,
					items: pathPoints,
					startOwnerId: sourceNode.id,
					endOwnerId: targetNode.id,
				} as ConnectLineState,
			});
		};

		eventBus.addEventListener(EVENT_NAME_CONNECT_NODES, connectNodesListener);

		return () => {
			eventBus.removeEventListener(
				EVENT_NAME_CONNECT_NODES,
				connectNodesListener,
			);
		};
	}, []);
};
