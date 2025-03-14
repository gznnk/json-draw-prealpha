// Reactのインポート
import type React from "react";
import { memo, useRef } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";

// SvgCanvas関連コンポーネントをインポート
import type { DragProps } from "../../hooks/dragHooks";
import { useDrag } from "../../hooks/dragHooks";

/**
 * 辺ドラッグ用の線のプロパティ
 */
type DragLineProps = Omit<DragProps, "ref"> & {
	startPoint: Point;
	endPoint: Point;
	cursor: string;
};

/**
 * 辺ドラッグ用の線コンポーネント
 */
const DragLine: React.FC<DragLineProps> = memo(
	({
		id,
		point,
		startPoint,
		endPoint,
		cursor,
		onDragStart,
		onDrag,
		onDragEnd,
		dragPositioningFunction,
	}) => {
		const svgRef = useRef<SVGLineElement>({} as SVGLineElement);

		const dragProps = useDrag({
			id,
			point,
			ref: svgRef,
			onDragStart,
			onDrag,
			onDragEnd,
			dragPositioningFunction,
		});

		return (
			<line
				id={id}
				x1={startPoint.x}
				y1={startPoint.y}
				x2={endPoint.x}
				y2={endPoint.y}
				stroke="transparent"
				strokeWidth={3}
				cursor={cursor}
				ref={svgRef}
				{...dragProps}
			/>
		);
	},
);

export default memo(DragLine);
