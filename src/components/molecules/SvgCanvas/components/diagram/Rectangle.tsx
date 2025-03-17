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
	ConnectPointMoveEventType,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import ConnectPoint, {
	triggerConnectPointMove,
} from "../connector/ConnectPoint";
import Transformative from "../core/Transformative";

// SvgCanvas関連カスタムフックをインポート
import { useDrag } from "../../hooks/dragHooks";

// SvgCanvas関連関数をインポート
import { createSvgTransform, newId } from "../../functions/Diagram";
import { calcRectangleVertices, degreesToRadians } from "../../functions/Math";

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
	onTransformStart,
	onTransform,
	onTransformEnd,
}) => {
	// ドラッグ中かのフラグ
	const [isDragging, setIsDragging] = useState(false);
	// 変形中かのフラグ
	const [isTransformimg, setIsTransforming] = useState(false);
	// ホバー中かのフラグ
	const [isHovered, setIsHovered] = useState(false);
	// 変形対象のSVG要素への参照
	const svgRef = useRef<SVGRectElement>({} as SVGRectElement);

	/**
	 * 接続ポイントの位置を更新
	 */
	const triggerConnectPointsMove = useCallback(
		(type: ConnectPointMoveEventType, ownerShape: Shape) => {
			const vertices = calcRectangleVertices(ownerShape);

			for (const cp of (items as ConnectPointData[]) ?? []) {
				const cPoint = (vertices as RectangleVertices)[
					cp.name as keyof RectangleVertices
				];

				triggerConnectPointMove({
					id: cp.id,
					type,
					point: {
						x: cPoint.x,
						y: cPoint.y,
					},
					ownerShape,
				});
			}
		},
		[items],
	);

	/**
	 * 四角形のドラッグ開始イベントハンドラ
	 */
	const handleDragStart = useCallback(
		(e: DiagramDragEvent) => {
			setIsDragging(true);

			triggerConnectPointsMove("moveStart", {
				point: e.endPoint,
				width,
				height,
				rotation,
				scaleX,
				scaleY,
			});

			onDragStart?.(e);
		},
		[
			onDragStart,
			triggerConnectPointsMove,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
		],
	);

	/**
	 * 四角形のドラッグ中イベントハンドラ
	 */
	const handleDrag = useCallback(
		(e: DiagramDragEvent) => {
			triggerConnectPointsMove("move", {
				point: e.endPoint,
				width,
				height,
				rotation,
				scaleX,
				scaleY,
			});

			onDrag?.(e);
		},
		[onDrag, triggerConnectPointsMove, width, height, rotation, scaleX, scaleY],
	);

	/**
	 * 四角形のドラッグ完了イベントハンドラ
	 */
	const handleDragEnd = useCallback(
		(e: DiagramDragEvent) => {
			onDragEnd?.(e);

			triggerConnectPointsMove("moveEnd", {
				point: e.endPoint,
				width,
				height,
				rotation,
				scaleX,
				scaleY,
			});

			setIsDragging(false);
		},
		[
			onDragEnd,
			triggerConnectPointsMove,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
		],
	);

	/**
	 * 四角形の変形開始イベントハンドラ
	 */
	const handleTransformStart = useCallback(
		(e: DiagramTransformEvent) => {
			setIsTransforming(true);
			onTransformStart?.(e);
			triggerConnectPointsMove("moveStart", e.endShape);
		},
		[onTransformStart, triggerConnectPointsMove],
	);

	/**
	 * 四角形の変形中イベントハンドラ
	 */
	const handleTransform = useCallback(
		(e: DiagramTransformEvent) => {
			onTransform?.(e);
			triggerConnectPointsMove("move", e.endShape);
		},
		[onTransform, triggerConnectPointsMove],
	);

	/**
	 * 四角形の変形完了イベントハンドラ
	 */
	const handleTransformEnd = useCallback(
		(e: DiagramTransformEvent) => {
			onTransformEnd?.(e);
			triggerConnectPointsMove("moveEnd", e.endShape);
			setIsTransforming(false);
		},
		[onTransformEnd, triggerConnectPointsMove],
	);

	/**
	 * ポインターダウンイベントハンドラ
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

	const ownerShape = {
		point,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	};

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
			{!isDragging && (
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
			)}
			{!isSelected &&
				(items as ConnectPointData[])?.map((cp) => (
					<ConnectPoint
						key={cp.id}
						id={cp.id}
						name={cp.name}
						point={cp.point}
						isSelected={false}
						ownerId={id}
						ownerShape={ownerShape}
						visible={isHovered && !isDragging && !isTransformimg}
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
	for (const key of Object.keys(vertices)) {
		items.push({
			id: newId(),
			type: "ConnectPoint",
			point: vertices[key as keyof RectangleVertices],
			isSelected: false,
			name: key, // TODO: 今んとこ使ってない
		});
	}

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
