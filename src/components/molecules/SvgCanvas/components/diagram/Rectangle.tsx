// Reactのインポート
import type React from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { RectangleVertices } from "../../types/CoordinateTypes";
import type {
	ConnectPointData,
	CreateDiagramProps,
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
	connectPoints,
	showConnectPoints = true,
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
	const triggerConnectPointsMove = (
		type: ConnectPointMoveEventType,
		ownerShape: Partial<Shape>,
	) => {
		const newShape = {
			x,
			y,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
			...ownerShape,
		};
		const vertices = calcRectangleVertices(newShape);

		for (const connectPointData of connectPoints ?? []) {
			const connectPoint = (vertices as RectangleVertices)[
				connectPointData.name as keyof RectangleVertices
			];

			triggerConnectPointMove({
				id: connectPointData.id,
				type,
				x: connectPoint.x,
				y: connectPoint.y,
				ownerId: id,
				ownerShape: newShape,
			});
		}
	};

	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		// プロパティ
		id,
		isSelected,
		onDragStart,
		onDrag,
		onDragEnd,
		onSelect,
		onTransformStart,
		onTransform,
		onTransformEnd,
		// 内部変数・内部関数
		triggerConnectPointsMove,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * 四角形のドラッグ開始イベントハンドラ
	 */
	const handleDragStart = useCallback((e: DiagramDragEvent) => {
		const { onDragStart, triggerConnectPointsMove } = refBus.current;

		setIsDragging(true);

		triggerConnectPointsMove("moveStart", {
			x: e.endX,
			y: e.endY,
		});

		onDragStart?.(e);
	}, []);

	/**
	 * 四角形のドラッグ中イベントハンドラ
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		const { onDrag, triggerConnectPointsMove } = refBus.current;

		triggerConnectPointsMove("move", {
			x: e.endX,
			y: e.endY,
		});

		onDrag?.(e);
	}, []);

	/**
	 * 四角形のドラッグ完了イベントハンドラ
	 */
	const handleDragEnd = useCallback((e: DiagramDragEvent) => {
		const { onDragEnd, triggerConnectPointsMove } = refBus.current;

		triggerConnectPointsMove("moveEnd", {
			x: e.endX,
			y: e.endY,
		});

		onDragEnd?.(e);

		setIsDragging(false);
	}, []);

	/**
	 * 四角形の変形開始イベントハンドラ
	 */
	const handleTransformStart = useCallback((e: DiagramTransformEvent) => {
		const { onTransformStart, triggerConnectPointsMove } = refBus.current;
		setIsTransforming(true);
		onTransformStart?.(e);
		triggerConnectPointsMove("moveStart", e.endShape);
	}, []);

	/**
	 * 四角形の変形中イベントハンドラ
	 */
	const handleTransform = useCallback((e: DiagramTransformEvent) => {
		const { onTransform, triggerConnectPointsMove } = refBus.current;
		onTransform?.(e);
		triggerConnectPointsMove("move", e.endShape);
	}, []);

	/**
	 * 四角形の変形完了イベントハンドラ
	 */
	const handleTransformEnd = useCallback((e: DiagramTransformEvent) => {
		const { onTransformEnd, triggerConnectPointsMove } = refBus.current;
		onTransformEnd?.(e);
		triggerConnectPointsMove("moveEnd", e.endShape);
		setIsTransforming(false);
	}, []);

	/**
	 * ポインターダウンイベントハンドラ
	 */
	const handlePointerDown = useCallback(() => {
		const { id, isSelected, onSelect } = refBus.current;

		if (!isSelected) {
			// 図形選択イベントを発火
			onSelect?.({
				id,
			});
		}
	}, []);

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

	// memo化によりConnectPointの再描画を抑制
	// keyで分解してばらばらにpropsで渡すと、各ConnectPoint側それぞれで各keyに対して
	// 比較処理が走り非効率なので、ここでまとめてShapeの差異を検知する
	const ownerShape = useMemo(
		() => ({
			x,
			y,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
		}),
		[x, y, width, height, rotation, scaleX, scaleY],
	);

	const doShowConnectPoints =
		showConnectPoints && !isSelected && !isDragging && !isTransformimg;

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
			{doShowConnectPoints &&
				connectPoints?.map((cp) => (
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

	const connectPoints: ConnectPointData[] = [];
	for (const key of Object.keys(vertices)) {
		const point = vertices[key as keyof RectangleVertices];
		connectPoints.push({
			id: newId(),
			type: "ConnectPoint",
			x: point.x,
			y: point.y,
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
		connectPoints,
	} as RectangleData;
};
