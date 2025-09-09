// Import React.
import { useEffect, useRef } from "react";

// Import types.
import type { Frame } from "../../../types/core/Frame";
import type { ConnectNodesEvent } from "../../../types/events/ConnectNodesEvent";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";
import type { ConnectableState } from "../../../types/state/shapes/ConnectableState";
import type { PathPointState } from "../../../types/state/shapes/PathPointState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

import { EVENT_NAME_CONNECT_NODES } from "../../../constants/core/EventNames";
// Import constants.
import { ConnectLineDefaultState } from "../../../constants/state/shapes/ConnectLineDefaultState";

// Import utils.
import { getDiagramById } from "../../../utils/core/getDiagramById";
import { calcOrientedFrameFromPoints } from "../../../utils/math/geometry/calcOrientedFrameFromPoints";
import { newId } from "../../../utils/shapes/common/newId";
import { generateOptimalFrameToFrameConnection } from "../../../utils/shapes/connectPoint/generateOptimalFrameToFrameConnection";

import { isConnectableState } from "../../../utils/validation/isConnectableState";
import { isFrame } from "../../../utils/validation/isFrame";
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

			if (!isFrame(sourceNode) || !isFrame(targetNode)) {
				console.error("Source or target node is not a frame.");
				return;
			}

			if (!isConnectableState(sourceNode) || !isConnectableState(targetNode)) {
				console.error("Source node is not connectable.");
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

			const points = generateOptimalFrameToFrameConnection(
				sourceConnectPoint.x,
				sourceConnectPoint.y,
				sourceNode as Frame,
				targetConnectPoint.x,
				targetConnectPoint.y,
				targetNode as Frame,
			);

			const frame = calcOrientedFrameFromPoints(
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
					...ConnectLineDefaultState,
					id: newId(),
					x: frame.x,
					y: frame.y,
					width: frame.width,
					height: frame.height,
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
