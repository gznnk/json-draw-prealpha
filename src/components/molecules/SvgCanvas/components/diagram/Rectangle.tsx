// Reactのインポート
import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Point, RectangleVertices } from "../../types/CoordinateTypes";
import type {
	ConnectPointData,
	Diagram,
	DiagramBaseProps,
	RectangleData,
	Shape,
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
import { useDrag } from "../../hooks/dragHooks";

// SvgCanvas関連関数をインポート
import { newId, createSvgTransform } from "../../functions/Diagram";
import { calcRectangleVertices, degreesToRadians } from "../../functions/Math";

// ユーティリティをインポート
// import { getLogger } from "../../../../../utils/Logger";

// ロガーを取得
// const logger = getLogger("Rectangle");

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
	onDragStart,
	onDrag,
	onDragEnd,
	onClick,
	onSelect,
	onConnect,
	onConnectPointMove,
	onTransformStart,
	onTransform,
	onTransformEnd,
}) => {
	const rectangleRenderKey = window.profiler.start(`Rectangle render ${id}`);

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
		(shape: Shape) => {
			const vertices = calcRectangleVertices(shape);

			for (const cp of (items as ConnectPointData[]) ?? []) {
				const cPoint = (vertices as RectangleVertices)[
					cp.name as keyof RectangleVertices
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
		[onConnectPointMove, items],
	);

	/**
	 * 四角形のドラッグ開始イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e 四角形のドラッグ開始イベント
	 * @returns {void}
	 */
	const handleDragStart = useCallback(
		(e: DiagramDragEvent) => {
			setIsTransforming(true);
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
			updateConnectPoints({
				point: e.endPoint,
				width,
				height,
				rotation,
				scaleX,
				scaleY,
			});

			onDrag?.(e);
		},
		[onDrag, updateConnectPoints, width, height, rotation, scaleX, scaleY],
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
			setIsTransforming(false);
		},
		[onDragEnd],
	);

	const handleTransformStart = useCallback(
		(e: DiagramTransformStartEvent) => {
			onTransformStart?.(e);
			setIsTransforming(true);
		},
		[onTransformStart],
	);

	const handleTransform = useCallback(
		(e: DiagramTransformEvent) => {
			onTransform?.(e);
			updateConnectPoints(e.endShape);
		},
		[onTransform, updateConnectPoints],
	);

	const handleTransformEnd = useCallback(
		(e: DiagramTransformEvent) => {
			onTransformEnd?.(e);
			setIsTransforming(false);
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
			onSelect?.({
				id,
			});
		}
	}, [id, isSelected, onSelect]);

	/**
	 * ホバー状態変更イベントハンドラ
	 *
	 * @param {DiagramHoverEvent} e ホバー状態変更イベント
	 * @returns {void}
	 */
	const handleHoverChange = useCallback((e: DiagramHoverEvent) => {
		setIsHovered(e.isHovered);
	}, []);

	const dragProps = useDrag({
		id,
		type: "Rectangle",
		point,
		ref: svgRef,
		onPointerDown: handlePointerDown,
		onClick: onClick,
		onDragStart: handleDragStart,
		onDrag: handleDrag,
		onDragEnd: handleDragEnd,
		onHoverChange: handleHoverChange,
	});

	const rectTransform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		point.x,
		point.y,
	);

	window.profiler.end(`Rectangle render ${id}`, rectangleRenderKey);

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
					tabIndex={0}
					cursor="move"
					transform={rectTransform}
					ref={svgRef}
					{...dragProps}
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
				(items as ConnectPointData[])?.map((cp) => (
					<ConnectPoint
						key={cp.id}
						id={cp.id}
						name={cp.name}
						point={cp.point}
						isSelected={false}
						ownerShape={{
							point,
							width,
							height,
							rotation,
							scaleX,
							scaleY,
						}}
						visible={isHovered && !isTransformimg}
						onConnect={onConnect}
					/>
				))}
		</>
	);
};

export default memo(Rectangle);

// export default memo(
// 	Rectangle,
// 	(prevProps: RectangleProps, nextProps: RectangleProps) => {
// 		console.log("前回の props:", prevProps);
// 		console.log("今回の props:", nextProps);

// 		// どのプロパティが変わったか確認
// 		for (const key in nextProps) {
// 			if (
// 				prevProps[key as keyof RectangleProps] !==
// 				nextProps[key as keyof RectangleProps]
// 			) {
// 				console.log(`変更された prop: ${key}`);
// 			}
// 		}

// 		// デフォルトの比較ロジック（=== 比較）を維持
// 		return Object.keys(prevProps).every(
// 			(key: string) =>
// 				prevProps[key as keyof RectangleProps] ===
// 				nextProps[key as keyof RectangleProps],
// 		);
// 	},
// );

/**
 * 短径データ作成
 */
export const createRectangleData = (
	id: string,
	point: Point,
	width: number,
	height: number,
	fill: string,
	stroke: string,
	strokeWidth: string,
): RectangleData => {
	const vertices = calcRectangleVertices({
		point,
		width,
		height,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
	});

	const items: Diagram[] = [];
	items.push({
		id: newId(),
		type: "ConnectPoint",
		point: vertices.leftTopPoint,
		isSelected: false,
		name: "leftTopPoint",
	});
	items.push({
		id: newId(),
		type: "ConnectPoint",
		point: vertices.rightTopPoint,
		isSelected: false,
		name: "rightTopPoint",
	});
	items.push({
		id: newId(),
		type: "ConnectPoint",
		point: vertices.leftBottomPoint,
		isSelected: false,
		name: "leftBottomPoint",
	});
	items.push({
		id: newId(),
		type: "ConnectPoint",
		point: vertices.rightBottomPoint,
		isSelected: false,
		name: "rightBottomPoint",
	});
	items.push({
		id: newId(),
		type: "ConnectPoint",
		point: vertices.topCenterPoint,
		isSelected: false,
		name: "topCenterPoint",
	});
	items.push({
		id: newId(),
		type: "ConnectPoint",
		point: vertices.bottomCenterPoint,
		isSelected: false,
		name: "bottomCenterPoint",
	});
	items.push({
		id: newId(),
		type: "ConnectPoint",
		point: vertices.leftCenterPoint,
		isSelected: false,
		name: "leftCenterPoint",
	});
	items.push({
		id: newId(),
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
		rotation: 0,
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
