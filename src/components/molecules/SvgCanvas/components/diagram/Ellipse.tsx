import type React from "react";
import { useRef, useCallback, memo } from "react";
import type { ChangeEvent } from "../../types";
import RectangleBase from "../core/RectangleBase";
import type { RectangleBaseProps } from "../core/RectangleBase";
import { forwardRef, useImperativeHandle } from "react";

type EllipseProps = RectangleBaseProps & {
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
};

const Ellipse: React.FC<EllipseProps> = memo(
	forwardRef<
		{
			draggableRef: React.RefObject<SVGGElement>;
			onParentChange: (e: ChangeEvent) => void;
		},
		EllipseProps
	>(
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
			const domRef = useRef<SVGEllipseElement>({} as SVGEllipseElement);

			useImperativeHandle(ref, () => ({
				draggableRef: domRef,
				onParentChange: () => {
					console.log("onParentChange");
				},
			}));

			const onChange = useCallback((e: ChangeEvent) => {
				if (e.width && e.height) {
					domRef.current?.setAttribute("cx", `${e.width / 2}`);
					domRef.current?.setAttribute("cy", `${e.height / 2}`);
					domRef.current?.setAttribute("rx", `${e.width / 2}`);
					domRef.current?.setAttribute("ry", `${e.height / 2}`);
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
				>
					<ellipse
						cx={width / 2}
						cy={height / 2}
						rx={width / 2}
						ry={height / 2}
						ref={domRef}
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
