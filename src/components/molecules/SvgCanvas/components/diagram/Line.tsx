import type React from "react";
import { useCallback, useRef, forwardRef, memo } from "react";
import Draggable from "../core/Draggable";
import DragPoint from "../core/DragPoint";
import type { Point } from "../../types/CoordinateTypes";
import type { DiagramDragEvent } from "../../types/EventTypes";
import type {
	DiagramRef,
	DiagramBaseProps,
	LineData,
} from "../../types/DiagramTypes";

const getRelativePoint = (point: Point, relativePoint: Point) => {
	return {
		x: relativePoint.x - point.x,
		y: relativePoint.y - point.y,
	};
};

const getRelativePointString = (point: Point, relativePoint: Point) => {
	const relativePointValue = getRelativePoint(point, relativePoint);
	return `${relativePointValue.x} ${relativePointValue.y}`;
};

export type LineProps = DiagramBaseProps & LineData;

const Line: React.FC<LineProps> = memo(
	forwardRef<DiagramRef, LineProps>(
		(
			{
				id,
				point,
				startPoint,
				endPoint,
				stroke,
				strokeWidth,
				onDiagramDragEnd,
			},
			_ref,
		) => {
			const svgRef = useRef<SVGRectElement>({} as SVGRectElement);

			const handleDrag = useCallback(
				(e: DiagramDragEvent) => {
					const newPoint = e.endPoint;
					const diffX = newPoint.x - point.x;
					const diffY = newPoint.y - point.y;
					const newStartPoint = {
						x: startPoint.x + diffX,
						y: startPoint.y + diffY,
					};
					const newEndPoint = {
						x: endPoint.x + diffX,
						y: endPoint.y + diffY,
					};

					svgRef.current.setAttribute(
						"d",
						`M ${getRelativePointString(newPoint, newStartPoint)} L ${getRelativePointString(newPoint, newEndPoint)}`,
					);
				},
				[point, startPoint, endPoint],
			);

			const handleDragEnd = useCallback(
				(e: DiagramDragEvent) => {
					onDiagramDragEnd?.(e);
				},
				[onDiagramDragEnd],
			);

			const handleStartPointDrag = useCallback(
				(e: DiagramDragEvent) => {
					const newPoint = e.endPoint;
					svgRef.current.setAttribute(
						"d",
						`M ${getRelativePointString(point, newPoint)} L ${endPoint.x} ${endPoint.y}`,
					);
				},
				[point, endPoint],
			);

			const handleEndPointDrag = useCallback(
				(e: DiagramDragEvent) => {
					const newPoint = e.endPoint;
					svgRef.current.setAttribute(
						"d",
						`M ${startPoint.x} ${startPoint.y} L ${getRelativePointString(point, newPoint)}`,
					);
				},
				[point, startPoint],
			);

			return (
				<>
					<Draggable
						id={id}
						point={point}
						onDrag={handleDrag}
						onDragEnd={handleDragEnd}
					>
						<path
							id={id}
							d={`M ${startPoint.x - point.x} ${startPoint.y - point.y} L ${endPoint.x - point.x} ${endPoint.y - point.y}`}
							stroke={stroke}
							strokeWidth={strokeWidth}
							ref={svgRef}
						/>
					</Draggable>
					<path
						id={id}
						d={`M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`}
						stroke={stroke}
						strokeWidth={strokeWidth}
						ref={svgRef}
					/>
					<DragPoint
						id={`${id}-start`}
						point={startPoint}
						onDrag={handleStartPointDrag}
					/>
					<DragPoint
						id={`${id}-end`}
						point={endPoint}
						onDrag={handleEndPointDrag}
					/>
				</>
			);
		},
	),
);

export default Line;
