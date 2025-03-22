// Reactのインポート
import type React from "react";
import { memo, useCallback, useRef } from "react";

// SvgCanvas関連型定義をインポート
import type { CreateDiagramProps, EllipseData } from "../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramTransformEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import Transformative from "../core/Transformative";

// SvgCanvas関連カスタムフックをインポート
import { useDrag } from "../../hooks/dragHooks";

// SvgCanvas関連関数をインポート
import { createSvgTransform } from "../../functions/Diagram";
import { degreesToRadians } from "../../functions/Math";

/**
 * 楕円コンポーネントのプロパティ
 */
export type EllipseProps = CreateDiagramProps<
	EllipseData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
	}
>;

/**
 * 楕円コンポーネント
 */
const Ellipse: React.FC<EllipseProps> = ({
	id,
	x,
	y,
	width,
	height,
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
	fill = "transparent",
	stroke = "black",
	strokeWidth = "1px",
	keepProportion = false,
	isSelected = false,
	onDrag,
	onClick,
	onSelect,
	onTransform,
}) => {
	const svgRef = useRef<SVGEllipseElement>({} as SVGEllipseElement);

	/**
	 * 四角形のドラッグ中イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e 四角形のドラッグ中イベント
	 * @returns {void}
	 */
	const handleDrag = useCallback(
		(e: DiagramDragEvent) => {
			onDrag?.(e);
		},
		[onDrag],
	);

	/**
	 * ポインターダウンイベントハンドラ
	 *
	 * @returns {void}
	 */
	const handlePointerDown = useCallback(() => {
		if (!isSelected) {
			// 図形選択イベントを発火
			onSelect?.({
				id,
			});
		}
	}, [id, isSelected, onSelect]);

	const dragProps = useDrag({
		id,
		type: "Ellipse",
		x,
		y,
		ref: svgRef,
		onPointerDown: handlePointerDown,
		onClick: onClick,
		onDrag: handleDrag,
	});

	const handleTransform = useCallback(
		(e: DiagramTransformEvent) => {
			onTransform?.(e);
		},
		[onTransform],
	);

	return (
		<>
			<g transform="translate(0.5,0.5)">
				<ellipse
					id={id}
					cx={0}
					cy={0}
					rx={width / 2}
					ry={height / 2}
					fill={fill}
					stroke={stroke}
					strokeWidth={strokeWidth}
					tabIndex={0}
					cursor="move"
					transform={createSvgTransform(
						scaleX,
						scaleY,
						degreesToRadians(rotation),
						x,
						y,
					)}
					ref={svgRef}
					{...dragProps}
				/>
			</g>
			<Transformative
				id={id}
				type="Ellipse"
				x={x}
				y={y}
				width={width}
				height={height}
				rotation={rotation}
				scaleX={scaleX}
				scaleY={scaleY}
				keepProportion={keepProportion}
				isSelected={isSelected}
				onTransform={handleTransform}
			/>
		</>
	);
};

export default memo(Ellipse);
