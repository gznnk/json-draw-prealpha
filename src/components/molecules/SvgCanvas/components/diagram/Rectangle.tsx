// Reactのインポート
import type React from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";

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
	ConnectPointMoveData,
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramTransformEvent,
	EventType,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import ConnectPoint from "../connector/ConnectPoint";
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
	showConnectPoints = true,
	onDrag,
	onClick,
	onSelect,
	onTransform,
	onConnect,
	onConnectPointsMove,
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
	const updateConnectPoints = (
		eventType: EventType,
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

		const moveDataList: ConnectPointMoveData[] = [];
		for (const connectPointData of (items as ConnectPointData[]) ?? []) {
			const connectPoint = (vertices as RectangleVertices)[
				connectPointData.name as keyof RectangleVertices
			];

			moveDataList.push({
				id: connectPointData.id,
				x: connectPoint.x,
				y: connectPoint.y,
				ownerId: id,
				ownerShape: newShape,
			});
		}

		onConnectPointsMove?.({
			eventType,
			points: moveDataList,
		});
	};

	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		// プロパティ
		id,
		isSelected,
		onDrag,
		onSelect,
		onTransform,
		// 内部変数・内部関数
		updateConnectPoints,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * 四角形のドラッグ中イベントハンドラ
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		const { onDrag, updateConnectPoints } = refBus.current;

		if (e.eventType === "Start") {
			setIsDragging(true);
		}

		onDrag?.(e);

		updateConnectPoints(e.eventType, {
			x: e.endX,
			y: e.endY,
		});

		if (e.eventType === "End") {
			setIsDragging(false);
		}
	}, []);

	/**
	 * 四角形の変形中イベントハンドラ
	 */
	const handleTransform = useCallback((e: DiagramTransformEvent) => {
		const { onTransform, updateConnectPoints } = refBus.current;
		if (e.eventType === "Start") {
			setIsTransforming(true);
		}

		onTransform?.(e);

		updateConnectPoints(e.eventType, e.endShape);

		if (e.eventType === "End") {
			setIsTransforming(false);
		}
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
		onDrag: handleDrag,
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

	// rectのtransform属性を生成
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
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
					transform={transform}
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
					onTransform={handleTransform}
				/>
			)}
			{doShowConnectPoints &&
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
