// Reactのインポート
import type React from "react";
import { memo, useRef } from "react";

// SvgCanvas関連コンポーネントをインポート
import type { DragProps } from "../../hooks/dragHooks";
import { useDrag } from "../../hooks/dragHooks";

/**
 * 辺ドラッグ用の線のプロパティ
 */
type DragLineProps = Omit<DragProps, "ref"> & {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	cursor: string;
};

/**
 * 辺ドラッグ用の線コンポーネント
 */
const DragLine: React.FC<DragLineProps> = ({
	id,
	x,
	y,
	startX,
	startY,
	endX,
	endY,
	cursor,
	onPointerDown,
	onClick,
	onDrag,
	dragPositioningFunction,
}) => {
	const svgRef = useRef<SVGLineElement>({} as SVGLineElement);

	const dragProps = useDrag({
		id,
		x,
		y,
		ref: svgRef,
		onPointerDown,
		onClick,
		onDrag,
		dragPositioningFunction,
	});

	return (
		<line
			id={id}
			x1={startX}
			y1={startY}
			x2={endX}
			y2={endY}
			stroke="transparent"
			strokeWidth={3}
			cursor={cursor}
			ref={svgRef}
			{...dragProps}
		/>
	);
};

export default memo(DragLine);
