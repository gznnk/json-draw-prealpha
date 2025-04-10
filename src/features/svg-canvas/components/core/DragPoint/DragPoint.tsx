// Reactのインポート
import type React from "react";
import { memo, useRef } from "react";

// ライブラリのインポート
import styled from "@emotion/styled";

// SvgCanvas関連カスタムフックをインポート
import type { DragProps } from "../../../hooks/dragHooks";
import { useDrag } from "../../../hooks/dragHooks";

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
	isTransparent?: boolean;
	hidden?: boolean;
};

/**
 * ドラッグポイントコンポーネント
 */
const DragPoint: React.FC<DragPointProps> = ({
	id,
	type,
	x,
	y,
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
	isTransparent = false,
	hidden = false,
}) => {
	window.profiler.call(`DragPoint render: ${id}`);

	const svgRef = useRef<SVGCircleElement>({} as SVGCircleElement);

	const dragProps = useDrag({
		id,
		type,
		x,
		y,
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
			style={{ opacity: isTransparent ? 0 : 1 }}
			ref={svgRef}
			{...dragProps}
		/>
	);
};

export default memo(DragPoint);
