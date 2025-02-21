import type React from "react";
import { useRef, useCallback, useImperativeHandle, memo } from "react";
import type { ChangeEvent, DiagramRef, ParentResizeEvent } from "../../types";
import RectangleBase from "../core/RectangleBase";
import type { RectangleBaseProps } from "../core/RectangleBase";
import { forwardRef } from "react";

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
				onChange,
				onChangeEnd,
				children,
			},
			ref,
		) => {
			const svgRef = useRef<SVGRectElement>({} as SVGRectElement);
			const diagramRef = useRef<DiagramRef>({} as DiagramRef);

			useImperativeHandle(ref, () => ({
				svgRef,
				draggableRef: diagramRef.current.draggableRef,
				onParentResize: (e: ParentResizeEvent) => {
					diagramRef.current.draggableRef?.current?.setAttribute(
						"transform",
						`translate(${point.x * e.scaleX}, ${point.y * e.scaleY})`,
					);
					svgRef?.current?.setAttribute("width", `${width * e.scaleX}`);
					svgRef?.current?.setAttribute("height", `${height * e.scaleY}`);
				},
				onParentResizeEnd: (e: ParentResizeEvent) => {
					onChangeEnd?.({
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
				(e: ChangeEvent) => {
					if (e.width && e.height) {
						svgRef.current?.setAttribute("width", `${e.width}`);
						svgRef.current?.setAttribute("height", `${e.height}`);
					}
					onChange?.(e);
				},
				[onChange],
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
					onChange={handleChange}
					onChangeEnd={onChangeEnd}
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
