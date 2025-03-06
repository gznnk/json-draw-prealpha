// Reactのインポート
import type React from "react";
import {
	forwardRef,
	memo,
	useCallback,
	useImperativeHandle,
	useRef,
} from "react";

// SvgCanvas関連型定義をインポート
import type { EllipseData, DiagramRef } from "../../types/DiagramTypes";
import type {
	DiagramResizeEvent,
	GroupResizeEvent,
	GroupDragEvent,
	DiagramDragEvent,
	DiagramTransformStartEvent,
	DiagramTransformEvent,
	DiagramTransformEndEvent,
} from "../../types/EventTypes";

// RectangleBase関連コンポーネントをインポート
import type { RectangleBaseProps } from "../core/RectangleBase";

// RectangleBase関連関数をインポート
import {
	calcArrangmentOnGroupResize,
	calcPointOnGroupDrag,
} from "../core/RectangleBase/RectangleBaseFunctions";

// SvgCanvas関連カスタムフックをインポート
import { useDraggable } from "../../hooks/draggableHooks";

import { degreesToRadians } from "../../functions/Math";
import { createSvgTransform } from "../../functions/Svg";
import Transformative from "../core/Transformative";

export type EllipseProps = RectangleBaseProps & EllipseData;

const Ellipse: React.FC<EllipseProps> = memo(
	forwardRef<DiagramRef, EllipseProps>(
		(
			{
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
				tabIndex = 0,
				isSelected = false,
				onDiagramClick,
				onDiagramDragStart,
				onDiagramDrag,
				onDiagramDragEnd,
				onDiagramSelect,
				onTransformStart,
				onTransform,
				onTransformEnd,
			},
			ref,
		) => {
			const svgRef = useRef<SVGEllipseElement>({} as SVGEllipseElement);

			/**
			 * 四角形のドラッグ開始イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e 四角形のドラッグ開始イベント
			 * @returns {void}
			 */
			const handleDiagramDragStart = useCallback(
				(e: DiagramDragEvent) => {
					onDiagramDragStart?.(e);
				},
				[onDiagramDragStart],
			);

			/**
			 * 四角形のドラッグ中イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e 四角形のドラッグ中イベント
			 * @returns {void}
			 */
			const handleDiagramDrag = useCallback(
				(e: DiagramDragEvent) => {
					onDiagramDrag?.(e);
				},
				[onDiagramDrag],
			);

			/**
			 * 四角形のドラッグ完了イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e 四角形のドラッグ完了イベント
			 * @returns {void}
			 */
			const handleDiagramDragEnd = useCallback(
				(e: DiagramDragEvent) => {
					onDiagramDragEnd?.(e);
				},
				[onDiagramDragEnd],
			);

			/**
			 * ポインターダウンイベントハンドラ
			 *
			 * @returns {void}
			 */
			const handlePointerDown = useCallback(() => {
				if (!isSelected) {
					// 図形選択イベントを発火
					onDiagramSelect?.({
						id,
					});
				}
			}, [id, isSelected, onDiagramSelect]);

			const draggableProps = useDraggable({
				id,
				type: "Ellipse",
				point,
				ref: svgRef,
				onPointerDown: handlePointerDown,
				onClick: onDiagramClick,
				onDragStart: handleDiagramDragStart,
				onDrag: handleDiagramDrag,
				onDragEnd: handleDiagramDragEnd,
			});

			const handleTransformStart = useCallback(
				(e: DiagramTransformStartEvent) => {
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
				(e: DiagramTransformEndEvent) => {
					onTransformEnd?.(e);
				},
				[onTransformEnd],
			);

			return (
				<>
					<ellipse
						id={id}
						cx={0}
						cy={0}
						rx={width / 2}
						ry={height / 2}
						fill={fill}
						stroke={stroke}
						strokeWidth={strokeWidth}
						transform={createSvgTransform(
							scaleX,
							scaleY,
							degreesToRadians(rotation),
							point.x,
							point.y,
						)}
						tabIndex={0}
						ref={svgRef}
						{...draggableProps}
					/>
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
		},
	),
);

export default Ellipse;
