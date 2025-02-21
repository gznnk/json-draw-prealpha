import type React from "react";
import { useRef, useCallback, useImperativeHandle, memo } from "react";
import type { ChangeEvent } from "../../types";
import RectangleBase from "../core/RectangleBase";
import type { RectangleBaseProps } from "../core/RectangleBase";
import { forwardRef } from "react";

export type RectangleProps = RectangleBaseProps & {
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
};

const Rectangle: React.FC<RectangleProps> = memo(
	forwardRef<
		{
			draggableRef: React.RefObject<SVGGElement>;
			onParentChange: (e: ChangeEvent) => void;
		},
		RectangleProps
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
				onChange,
				onChangeEnd,
				children,
			},
			ref,
		) => {
			const domRef = useRef<SVGRectElement>({} as SVGRectElement);

			useImperativeHandle(ref, () => ({
				draggableRef: domRef,
				onParentChange: (e: ChangeEvent) => {
					console.log("onParentChange");
				},
			}));

			const handleChange = useCallback(
				(e: ChangeEvent) => {
					if (e.width && e.height) {
						domRef.current?.setAttribute("width", `${e.width}`);
						domRef.current?.setAttribute("height", `${e.height}`);
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
				>
					<rect
						x={0}
						y={0}
						width={width}
						height={height}
						ref={domRef}
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
