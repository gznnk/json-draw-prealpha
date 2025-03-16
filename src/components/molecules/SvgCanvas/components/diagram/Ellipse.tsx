// Reactのインポート
import type React from "react";
import { memo, useCallback, useRef } from "react";

// SvgCanvas関連型定義をインポート
import type {
	DiagramBaseProps,
	EllipseData,
	TransformativeProps,
} from "../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramTransformEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import Transformative from "../core/Transformative";

// SvgCanvas関連カスタムフックをインポート
import { useDrag } from "../../hooks/dragHooks";

// SvgCanvas関連関数をインポート
import { degreesToRadians } from "../../functions/Math";
import { createSvgTransform } from "../../functions/Diagram";

export type EllipseProps = DiagramBaseProps & TransformativeProps & EllipseData;

const Ellipse: React.FC<EllipseProps> = ({
	id,
	point,
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
	onDragStart,
	onDrag,
	onDragEnd,
	onClick,
	onSelect,
	onTransformStart,
	onTransform,
	onTransformEnd,
}) => {
	const svgRef = useRef<SVGEllipseElement>({} as SVGEllipseElement);

	/**
	 * 四角形のドラッグ開始イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e 四角形のドラッグ開始イベント
	 * @returns {void}
	 */
	const handleDragStart = useCallback(
		(e: DiagramDragEvent) => {
			onDragStart?.(e);
		},
		[onDragStart],
	);

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
	 * 四角形のドラッグ完了イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e 四角形のドラッグ完了イベント
	 * @returns {void}
	 */
	const handleDragEnd = useCallback(
		(e: DiagramDragEvent) => {
			onDragEnd?.(e);
		},
		[onDragEnd],
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
		point,
		ref: svgRef,
		onPointerDown: handlePointerDown,
		onClick: onClick,
		onDragStart: handleDragStart,
		onDrag: handleDrag,
		onDragEnd: handleDragEnd,
	});

	const handleTransformStart = useCallback(
		(e: DiagramTransformEvent) => {
			onTransformStart?.(e);
		},
		[onTransformStart],
	);

	const handleTransform = useCallback(
		(e: DiagramTransformEvent) => {
			onTransform?.(e);
		},
		[onTransform],
	);

	const handleTransformEnd = useCallback(
		(e: DiagramTransformEvent) => {
			onTransformEnd?.(e);
		},
		[onTransformEnd],
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
						point.x,
						point.y,
					)}
					ref={svgRef}
					{...dragProps}
				/>
			</g>
			<Transformative
				diagramId={id}
				type="Ellipse"
				point={point}
				width={width}
				height={height}
				rotation={rotation}
				scaleX={scaleX}
				scaleY={scaleY}
				keepProportion={keepProportion}
				isSelected={isSelected}
				onTransformStart={handleTransformStart}
				onTransform={handleTransform}
				onTransformEnd={handleTransformEnd}
			/>
		</>
	);
};

export default memo(Ellipse);
