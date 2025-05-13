// Import React.
import { useEffect, useRef } from "react";

// Import types related to SvgCanvas.
import type { ConnectLineData } from "../../../components/shapes/ConnectLine";
import type { PathPointData } from "../../../components/shapes/Path";
import type { Diagram } from "../../../catalog";
import type { ConnectableData } from "../../../types/data";
import type { ConnectNodesEvent } from "../../../types/events";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";
import type { Shape } from "../../../types";

// Import functions related to SvgCanvas.
import { createBestConnectPath } from "../../../components/shapes/ConnectPoint";
import { newId } from "../../../utils/shapes";
import { calcPointsOuterShape } from "../../../utils";
import { getDiagramById } from "../../SvgCanvasFunctions";
import { dispatchNewItemEvent } from "../addNewItem";

// Import related to this component.
import { CONNECT_NODES_EVENT_NAME } from "./connectNodesConstants";

/**
 * ConnectNodes イベントを監視してノード接続を行う Hook。
 */
export const useConnectNodes = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBus = useRef({ props });
	refBus.current = { props };

	useEffect(() => {
		const connectNodesListener = (e: Event) => {
			const event = (e as CustomEvent<ConnectNodesEvent>).detail;
			const { props } = refBus.current;
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

		window.addEventListener(CONNECT_NODES_EVENT_NAME, connectNodesListener);

		return () => {
			window.removeEventListener(
				CONNECT_NODES_EVENT_NAME,
				connectNodesListener,
			);
		};
	}, []);
};
