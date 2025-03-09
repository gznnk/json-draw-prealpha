// Reactのインポート
import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
import type {
	ConnectPointData,
	Diagram,
	DiagramBaseProps,
	RectangleData,
	TransformativeProps,
} from "../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramTransformEvent,
	DiagramTransformStartEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import ConnectPoint from "../connector/ConnectPoint";
import Transformative from "../core/Transformative";

// SvgCanvas関連カスタムフックをインポート
import { useDraggable } from "../../hooks/draggableHooks";

// SvgCanvas関連関数をインポート
import { calcRectangleVertices, degreesToRadians } from "../../functions/Math";
import { createSvgTransform } from "../../functions/Svg";

// RectangleBase関連型定義をインポート
import type { RectangleBaseDragPoints } from "../core/RectangleBase/RectangleBaseTypes";

// RectangleBase関連関数をインポート
import { calcArrangment } from "../core/RectangleBase/RectangleBaseFunctions";

// ユーティリティをインポート
import { getLogger } from "../../../../../utils/Logger";

// ロガーを取得
const logger = getLogger("Rectangle");

export type RectangleProps = DiagramBaseProps &
	TransformativeProps &
	RectangleData;

const Rectangle: React.FC<RectangleProps> = ({
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
	items,
	onTransformStart,
	onTransform,
	onTransformEnd,
	// --------------------------------------------------
	onDiagramClick,
	onDiagramDragStart,
	onDiagramDrag,
	onDiagramDragEnd,
	onDiagramSelect,
	onDiagramConnect,
	onConnectPointMove,
}) => {
	const [isTransformimg, setIsTransforming] = useState(false);
	// ホバー状態の管理
	const [isHovered, setIsHovered] = useState(false);

	const svgRef = useRef<SVGRectElement>({} as SVGRectElement);

	/**
	 * 接続ポイントの位置を更新
	 *
	 * @param {Point} originalPoint 矩形の一つの頂点を表す点
	 * @param {Point} diagonalPoint 矩形の対角線上のもう一つの頂点を表す点
	 * @returns {void}
	 */
	const updateConnectPoints = useCallback(
		(originalPoint: Point, diagonalPoint: Point) => {
			const newArrangement = calcArrangment(
				originalPoint,
				diagonalPoint,
				rotation,
			);

			for (const cp of (items as ConnectPointData[]) ?? []) {
				const cPoint = (newArrangement as RectangleBaseDragPoints)[
					cp.name as keyof RectangleBaseDragPoints
				];

				onConnectPointMove?.({
					id: cp.id,
					point: {
						x: cPoint.x,
						y: cPoint.y,
					},
				});
			}
		},
		[onConnectPointMove, rotation, items],
	);

	/**
	 * 四角形のドラッグ開始イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e 四角形のドラッグ開始イベント
	 * @returns {void}
	 */
	const handleDiagramDragStart = useCallback(
		(e: DiagramDragEvent) => {
			setIsTransforming(true);
			onDiagramDragStart?.(e);

			logger.debug("handleDiagramDragStart", e);
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
			// updateConnectPoints(e.endPoint, {
			// 	x: e.endPoint.x + width,
			// 	y: e.endPoint.y + height,
			// });

			logger.debug("handleDiagramDrag", e);

			onDiagramDrag?.(e);
		},
		[onDiagramDrag, updateConnectPoints, width, height],
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
			setIsTransforming(false);
		},
		[onDiagramDragEnd],
	);

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
		(e: DiagramTransformEvent) => {
			onTransformEnd?.(e);
		},
		[onTransformEnd],
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

	/**
	 * ホバー状態変更イベントハンドラ
	 *
	 * @param {DiagramHoverEvent} e ホバー状態変更イベント
	 * @returns {void}
	 */
	const handleDiagramHoverChange = useCallback((e: DiagramHoverEvent) => {
		setIsHovered(e.isHovered);
	}, []);

	const draggableProps = useDraggable({
		id,
		type: "Rectangle",
		point,
		ref: svgRef,
		onPointerDown: handlePointerDown,
		onClick: onDiagramClick,
		onDragStart: handleDiagramDragStart,
		onDrag: handleDiagramDrag,
		onDragEnd: handleDiagramDragEnd,
		onHoverChange: handleDiagramHoverChange,
	});

	return (
		<>
			<g transform="translate(0.5,0.5)">
				<rect
					key={id}
					id={id}
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
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
			</g>
			<Transformative
				diagramId={id}
				type="Rectangle"
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
			{!isSelected &&
				false &&
				(items as ConnectPointData[])?.map((cp) => (
					<ConnectPoint
						key={cp.id}
						id={cp.id}
						name={cp.name}
						point={cp.point}
						isSelected={false}
						visible={isHovered && !isTransformimg}
						onConnect={onDiagramConnect}
					/>
				))}
		</>
	);
};

export default memo(Rectangle);

export const createRectangleData = (
	id: string,
	point: Point,
	width: number,
	height: number,
	fill: string,
	stroke: string,
	strokeWidth: string,
): RectangleData => {
	const vertices = calcRectangleVertices(point, width, height, 0, 1, 1);

	const items: Diagram[] = [];
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.leftTopPoint,
		isSelected: false,
		name: "leftTopPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.rightTopPoint,
		isSelected: false,
		name: "rightTopPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.leftBottomPoint,
		isSelected: false,
		name: "leftBottomPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.rightBottomPoint,
		isSelected: false,
		name: "rightBottomPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.topCenterPoint,
		isSelected: false,
		name: "topCenterPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.bottomCenterPoint,
		isSelected: false,
		name: "bottomCenterPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.leftCenterPoint,
		isSelected: false,
		name: "leftCenterPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.rightCenterPoint,
		isSelected: false,
		name: "rightCenterPoint",
	});

	return {
		id,
		type: "Rectangle",
		point,
		width,
		height,
		rotation: degreesToRadians(0),
		scaleX: 1,
		scaleY: 1,
		fill,
		stroke,
		strokeWidth,
		keepProportion: false,
		isSelected: false,
		items,
	} as RectangleData;
};
