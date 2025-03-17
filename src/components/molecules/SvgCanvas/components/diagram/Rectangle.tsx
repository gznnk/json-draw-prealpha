// Reactのインポート
import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { RectangleVertices } from "../../types/CoordinateTypes";
import type {
	ConnectPointData,
	CreateDiagramProps,
	Diagram,
	RectangleData,
	Shape,
} from "../../types/DiagramTypes";
import type {
	ConnectPointMoveEventType,
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramTransformEvent,
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

/**
 * 四角形コンポーネントのプロパティ
 */
export type RectangleProps = CreateDiagramProps<
	RectangleData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
	}
>;

/**
 * 四角形コンポーネント
 */
const Rectangle: React.FC<RectangleProps> = ({
	id,
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	keepProportion,
	fill,
	stroke,
	strokeWidth,
	isSelected,
	items,
	onDragStart,
	onDrag,
	onDragEnd,
	onClick,
	onSelect,
	onTransformStart,
	onTransform,
	onTransformEnd,
	onConnect,
}) => {
	window.profiler.call(`Rectangle render: ${id}`);

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

			for (const connectPointData of (items as ConnectPointData[]) ?? []) {
				const connectPoint = (vertices as RectangleVertices)[
					connectPointData.name as keyof RectangleVertices
				];

				triggerConnectPointMove({
					id: connectPointData.id,
					type,
					x: connectPoint.x,
					y: connectPoint.y,
					ownerId: id,
					ownerShape,
				});
			}
		},
		[id, items],
	);

	/**
	 * 四角形のドラッグ開始イベントハンドラ
	 */
	const handleDragStart = useCallback(
		(e: DiagramDragEvent) => {
			setIsDragging(true);

			// TODO: 簡潔に書きたい
			triggerConnectPointsMove("moveStart", {
				x: e.endX,
				y: e.endY,
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
				x: e.endX,
				y: e.endY,
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
				x: e.endX,
				y: e.endY,
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
	const handleHover = useCallback((e: DiagramHoverEvent) => {
		setIsHovered(e.isHovered);
	}, []);

	const dragProps = useDrag({
		id,
		type: "Rectangle",
		x,
		y,
		ref: svgRef,
		onPointerDown: handlePointerDown,
		onClick: onClick,
		onDragStart: handleDragStart,
		onDrag: handleDrag,
		onDragEnd: handleDragEnd,
		onHover: handleHover,
	});

	const rectTransform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// TODO:
	const ownerShape = {
		x,
		y,
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
					x={x}
					y={y}
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
						x={cp.x}
						y={cp.y}
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
export const createRectangleData = ({
	x,
	y,
	width = 100,
	height = 100,
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
	keepProportion = false,
	fill = "transparent",
	stroke = "black",
	strokeWidth = "1px",
}: {
	x: number;
	y: number;
	width?: number;
	height?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	keepProportion?: boolean;
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
}): RectangleData => {
	// 接続ポイントを生成
	const vertices = calcRectangleVertices({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	const items: Diagram[] = [];
	for (const key of Object.keys(vertices)) {
		const point = vertices[key as keyof RectangleVertices];
		items.push({
			id: newId(),
			type: "ConnectPoint",
			x: point.x,
			y: point.y,
			isSelected: false,
			name: key,
		});
	}

	return {
		id: newId(),
		type: "Rectangle",
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		keepProportion,
		fill,
		stroke,
		strokeWidth,
		isSelected: false,
		items,
	} as RectangleData;
};
