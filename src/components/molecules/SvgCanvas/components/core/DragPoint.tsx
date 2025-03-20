// Reactのインポート
import type React from "react";
import { memo, useRef } from "react";

// ライブラリのインポート
import styled from "@emotion/styled";

// SvgCanvas関連カスタムフックをインポート
import type { DragProps } from "../../hooks/dragHooks";
import { useDrag } from "../../hooks/dragHooks";

/**
 * SVGのcircle要素のProps型定義
 */
type CircleProps = {
	outline: string;
};

/**
 * SVGのcircle要素のスタイル定義
 */
const Circle = styled.circle<CircleProps>`
  :focus {
    outline: ${(props) => props.outline};
	outline-offset: 3px;
  }
`;

/**
 * ドラッグポイントコンポーネントのプロパティ
 */
export type DragPointProps = Omit<DragProps, "ref"> & {
	radius?: number;
	stroke?: string;
	fill?: string;
	cursor?: string;
	outline?: string;
	visible?: boolean;
	hidden?: boolean;
	pointerEventsDisabled?: boolean;
};

/**
 * ドラッグポイントコンポーネント
 */
const DragPoint: React.FC<DragPointProps> = ({
	id,
	type,
	x,
	y,
	allowXDecimal = false,
	allowYDecimal = false,
	onDrag,
	onDragOver,
	onDragLeave,
	onDrop,
	onHover,
	dragPositioningFunction,
	radius = 5,
	stroke = "rgba(100, 149, 237, 0.8)",
	fill = "rgba(100, 149, 237, 0.8)",
	cursor = "move",
	outline = "1px rgba(100, 149, 237, 0.8) dashed",
	visible = true,
	hidden = false,
	pointerEventsDisabled = false,
}) => {
	window.profiler.call(`DragPoint render: ${id}`);

	const svgRef = useRef<SVGCircleElement>({} as SVGCircleElement);

	const dragProps = useDrag({
		id,
		type,
		x,
		y,
		allowXDecimal,
		allowYDecimal,
		ref: svgRef,
		onDrag,
		onDragOver,
		onDragLeave,
		onDrop,
		onHover,
		dragPositioningFunction,
	});

	if (hidden) {
		return;
	}

	return (
		<Circle
			id={id}
			cx={x}
			cy={y}
			r={radius}
			stroke={stroke}
			fill={fill}
			cursor={cursor}
			outline={outline}
			tabIndex={0}
			pointerEvents={pointerEventsDisabled ? "none" : "auto"}
			style={{ opacity: visible ? 1 : 0 }}
			ref={svgRef}
			{...dragProps}
		/>
	);
};

export default memo(DragPoint);
