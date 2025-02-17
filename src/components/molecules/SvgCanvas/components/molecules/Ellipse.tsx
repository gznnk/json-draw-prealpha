import type React from "react";
import { useRef, useCallback, memo } from "react";
import type { ChangeEvent } from "../../types";
import RectangleBase from "./RectangleBase";
import type { RectangleBaseProps } from "./RectangleBase";

type EllipseProps = RectangleBaseProps & {
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
};

const Ellipse: React.FC<EllipseProps> = memo(
	({
		id,
		initialPoint,
		initialWidth,
		initialHeight,
		fill = "transparent",
		stroke = "black",
		strokeWidth = "1px",
		tabIndex = 0,
		isSelected = false,
		onPointerDown,
		onChangeEnd,
	}) => {
		const ref = useRef<SVGEllipseElement>({} as SVGEllipseElement);

		const onChange = useCallback((e: ChangeEvent) => {
			ref.current?.setAttribute("cx", `${e.width / 2}`);
			ref.current?.setAttribute("cy", `${e.height / 2}`);
			ref.current?.setAttribute("rx", `${e.width / 2}`);
			ref.current?.setAttribute("ry", `${e.height / 2}`);
		}, []);

		return (
			<RectangleBase
				id={id}
				initialPoint={initialPoint}
				initialWidth={initialWidth}
				initialHeight={initialHeight}
				tabIndex={tabIndex}
				isSelected={isSelected}
				onPointerDown={onPointerDown}
				onChange={onChange}
				onChangeEnd={onChangeEnd}
			>
				<ellipse
					cx={initialWidth / 2}
					cy={initialHeight / 2}
					rx={initialWidth / 2}
					ry={initialHeight / 2}
					ref={ref}
					fill={fill}
					stroke={stroke}
					strokeWidth={strokeWidth}
				/>
			</RectangleBase>
		);
	},
);

export default Ellipse;
