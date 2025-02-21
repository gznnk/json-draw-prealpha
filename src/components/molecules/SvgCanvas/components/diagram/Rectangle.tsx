import type React from "react";
import { useRef, useCallback, memo } from "react";
import type { ChangeEvent } from "../../types";
import RectangleBase from "../core/RectangleBase";
import type { RectangleBaseProps } from "../core/RectangleBase";

export type RectangleProps = RectangleBaseProps & {
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
};

const Rectangle: React.FC<RectangleProps> = memo(
	({
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
		children,
	}) => {
		const ref = useRef<SVGRectElement>({} as SVGRectElement);

		const onChange = useCallback((e: ChangeEvent) => {
			ref.current?.setAttribute("width", `${e.width}`);
			ref.current?.setAttribute("height", `${e.height}`);
		}, []);

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
				onChange={onChange}
				onChangeEnd={onChangeEnd}
			>
				<rect
					x={0}
					y={0}
					width={width}
					height={height}
					ref={ref}
					fill={fill}
					stroke={stroke}
					strokeWidth={strokeWidth}
				/>
				{children}
			</RectangleBase>
		);
	},
);

export default Rectangle;
