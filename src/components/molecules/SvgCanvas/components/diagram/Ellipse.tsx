// Reactのインポート
import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { CreateDiagramProps, EllipseData } from "../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramTransformEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import Transformative from "../core/Transformative";

// SvgCanvas関連カスタムフックをインポート
import { useDrag } from "../../hooks/dragHooks";

// SvgCanvas関連関数をインポート
import { createSvgTransform, newId } from "../../functions/Diagram";
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
	visible = true,
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
	// ドラッグ中かのフラグ
	const [isDragging, setIsDragging] = useState(false);
	// 変形中かのフラグ
	const [isTransformimg, setIsTransforming] = useState(false);
	// ホバー中かのフラグ
	const [isHovered, setIsHovered] = useState(false);
	// 変形対象のSVG要素への参照
	const svgRef = useRef<SVGEllipseElement>({} as SVGEllipseElement);

	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		// プロパティ
		id,
		isSelected,
		onDrag,
		onSelect,
		onTransform,
		// 内部変数・内部関数
		// updateConnectPoints,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * 楕円のドラッグイベントハンドラ
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		const { onDrag } = refBus.current;

		if (e.eventType === "Start") {
			setIsDragging(true);
		}

		onDrag?.(e);

		if (e.eventType === "End") {
			setIsDragging(false);
		}
	}, []);

	/**
	 * 楕円の変形イベントハンドラ
	 */
	const handleTransform = useCallback((e: DiagramTransformEvent) => {
		const { onTransform } = refBus.current;

		if (e.eventType === "Start") {
			setIsTransforming(true);
		}

		onTransform?.(e);

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

	// ドラッグ用のプロパティを生成
	const dragProps = useDrag({
		id,
		type: "Ellipse",
		x,
		y,
		ref: svgRef,
		onPointerDown: handlePointerDown,
		onClick: onClick,
		onDrag: handleDrag,
		onHover: handleHover,
	});

	// ellipseのtransform属性を生成
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// 変形コンポーネントを表示するかのフラグ
	const showTransformative = visible && !isDragging;

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
					transform={transform}
					style={{ visibility: visible ? "visible" : "hidden" }}
					ref={svgRef}
					{...dragProps}
				/>
			</g>
			{showTransformative && (
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
			)}
		</>
	);
};

export default memo(Ellipse);

/**
 * 楕円データ作成
 */
export const createEllipseData = ({
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
}): EllipseData => {
	return {
		id: newId(),
		type: "Ellipse",
		x,
		y,
		visible: true,
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
		// items,
	} as EllipseData;
};
