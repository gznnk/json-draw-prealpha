import type React from "react";
import { useRef, useCallback, memo } from "react";
import type { ChangeEvent, DiagramRef, ParentResizeEvent } from "../../types";
import RectangleBase from "../core/RectangleBase";
import type { RectangleBaseProps } from "../core/RectangleBase";
import { forwardRef, useImperativeHandle } from "react";

type EllipseProps = RectangleBaseProps & {
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
	ref?: React.Ref<DiagramRef>;
};

const Ellipse: React.FC<EllipseProps> = memo(
	forwardRef<DiagramRef, EllipseProps>(
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
				onChangeEnd,
			},
			ref,
		) => {
			const svgRef = useRef<SVGEllipseElement>({} as SVGEllipseElement);
			const diagramRef = useRef<DiagramRef>({} as DiagramRef);

			useImperativeHandle(ref, () => ({
				svgRef,
				draggableRef: diagramRef.current.draggableRef,
				onParentResize: (e: ParentResizeEvent) => {
					diagramRef.current.draggableRef?.current?.setAttribute(
						"transform",
						`translate(${point.x * e.scaleX}, ${point.y * e.scaleY})`,
					);
					svgRef.current?.setAttribute("cx", `${(width * e.scaleX) / 2}`);
					svgRef.current?.setAttribute("cy", `${(height * e.scaleY) / 2}`);
					svgRef.current?.setAttribute("rx", `${(width * e.scaleX) / 2}`);
					svgRef.current?.setAttribute("ry", `${(height * e.scaleY) / 2}`);
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

			const onChange = useCallback((e: ChangeEvent) => {
				if (e.width && e.height) {
					svgRef.current?.setAttribute("cx", `${e.width / 2}`);
					svgRef.current?.setAttribute("cy", `${e.height / 2}`);
					svgRef.current?.setAttribute("rx", `${e.width / 2}`);
					svgRef.current?.setAttribute("ry", `${e.height / 2}`);
				}
			}, []);

			return (
				<RectangleBase
					id={id}
					point={point}
					width={width}
					height={height}
					keepProportion={keepProportion}
					tabIndex={tabIndex}
					isSelected={isSelected}
					onPointerDown={onPointerDown}
					onChange={onChange}
					onChangeEnd={onChangeEnd}
					ref={diagramRef}
				>
					<ellipse
						cx={width / 2}
						cy={height / 2}
						rx={width / 2}
						ry={height / 2}
						ref={svgRef}
						fill={fill}
						stroke={stroke}
						strokeWidth={strokeWidth}
					/>
				</RectangleBase>
			);
		},
	),
);

export default Ellipse;
