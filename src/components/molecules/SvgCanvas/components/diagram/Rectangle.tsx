// Reactのインポート
import type React from "react";
import {
	forwardRef,
	memo,
	useCallback,
	useImperativeHandle,
	useRef,
} from "react";

// SvgCanvas関連型定義をインポート
import type { DiagramRef } from "../../types/DiagramTypes";
import type {
	DiagramChangeEvent,
	ParentDiagramResizeEvent,
} from "../../types/EventTypes";

// RectangleBase関連コンポーネントをインポート
import type { RectangleBaseProps } from "../core/RectangleBase";
import RectangleBase from "../core/RectangleBase";

export type RectangleProps = RectangleBaseProps & {
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
	ref?: React.Ref<DiagramRef>;
};

const Rectangle: React.FC<RectangleProps> = memo(
	forwardRef<DiagramRef, RectangleProps>(
		(
			{
				id,
				point,
				width,
				height,
				fill = "transparent",
				stroke = "black",
				strokeWidth = "1px",
				keepProportion = false,
				tabIndex = 0,
				isSelected = false,
				onPointerDown,
				onDiagramChange,
				onDiagramChangeEnd,
				children,
			},
			ref,
		) => {
			const svgRef = useRef<SVGRectElement>({} as SVGRectElement);
			const diagramRef = useRef<DiagramRef>({} as DiagramRef);

			useImperativeHandle(ref, () => ({
				svgRef,
				draggableRef: diagramRef.current.draggableRef,
				onParentDiagramResize: (e: ParentDiagramResizeEvent) => {
					diagramRef.current.draggableRef?.current?.setAttribute(
						"transform",
						`translate(${point.x * e.scaleX}, ${point.y * e.scaleY})`,
					);
					svgRef?.current?.setAttribute("width", `${width * e.scaleX}`);
					svgRef?.current?.setAttribute("height", `${height * e.scaleY}`);
				},
				onParentDiagramResizeEnd: (e: ParentDiagramResizeEvent) => {
					onDiagramChangeEnd?.({
						id,
						point: {
							x: point.x * e.scaleX,
							y: point.y * e.scaleY,
						},
						width: width * e.scaleX,
						height: height * e.scaleY,
					});
				},
			}));

			const handleChange = useCallback(
				(e: DiagramChangeEvent) => {
					if (e.width && e.height) {
						svgRef.current?.setAttribute("width", `${e.width}`);
						svgRef.current?.setAttribute("height", `${e.height}`);
					}
					onDiagramChange?.(e);
				},
				[onDiagramChange],
			);

			return (
				<RectangleBase
					id={id}
					point={point}
					width={width}
					height={height}
					tabIndex={tabIndex}
					keepProportion={keepProportion}
					isSelected={isSelected}
					onPointerDown={onPointerDown}
					onDiagramChange={handleChange}
					onDiagramChangeEnd={onDiagramChangeEnd}
					ref={diagramRef}
				>
					<rect
						x={0}
						y={0}
						width={width}
						height={height}
						ref={svgRef}
						fill={fill}
						stroke={stroke}
						strokeWidth={strokeWidth}
					/>
					{children}
				</RectangleBase>
			);
		},
	),
);

export default Rectangle;
