// Reactのインポート
import type React from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { CreateDiagramProps } from "../../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramPointerEvent,
	DiagramTransformEvent,
} from "../../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import { PositionLabel } from "../../core/PositionLabel";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoint } from "../ConnectPoint";

// SvgCanvas関連カスタムフックをインポート
import { useDrag } from "../../../hooks/useDrag";

// SvgCanvas関連関数をインポート
import { createSvgTransform } from "../../../utils/Diagram";
import { degreesToRadians } from "../../../utils/Math";

// Imports related to this component.
import type { RectangleData } from "./RectangleTypes";

/**
 * 四角形コンポーネントのプロパティ
 */
export type RectangleProps = CreateDiagramProps<
	RectangleData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		textable: true;
	}
>;

/**
 * 四角形コンポーネント
 */
const RectangleComponent: React.FC<RectangleProps> = ({
	id,
	x,
	y,
	width,
	height,
	radius,
	rotation,
	scaleX,
	scaleY,
	keepProportion,
	fill,
	stroke,
	strokeWidth,
	isSelected,
	isMultiSelectSource,
	connectPoints,
	showConnectPoints = true,
	syncWithSameId = false,
	text,
	textType,
	fontColor,
	fontSize,
	fontFamily,
	fontWeight,
	textAlign,
	verticalAlign,
	isTextEditing,
	onDrag,
	onClick,
	onSelect,
	onTransform,
	onConnect,
	onTextEdit,
}) => {
	// ドラッグ中かのフラグ
	const [isDragging, setIsDragging] = useState(false);
	// 変形中かのフラグ
	const [isTransformimg, setIsTransforming] = useState(false);
	// ホバー中かのフラグ
	const [isHovered, setIsHovered] = useState(false);
	// 変形対象のSVG要素への参照
	const svgRef = useRef<SVGRectElement>({} as SVGRectElement);

	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		// プロパティ
		id,
		isSelected,
		onDrag,
		onSelect,
		onTransform,
		onTextEdit,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * 四角形のドラッグイベントハンドラ
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
	 * 四角形の変形イベントハンドラ
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
	const handlePointerDown = useCallback((e: DiagramPointerEvent) => {
		const { id, onSelect } = refBus.current;

		// 図形選択イベントを発火
		onSelect?.({
			eventId: e.eventId,
			id,
		});
	}, []);

	/**
	 * ホバー状態変更イベントハンドラ
	 */
	const handleHover = useCallback((e: DiagramHoverEvent) => {
		setIsHovered(e.isHovered);
	}, []);

	/**
	 * ダブルクリックイベントハンドラ
	 */
	const handleDoubleClick = useCallback(() => {
		const { id, isSelected, onTextEdit } = refBus.current;

		// テキスト編集イベントを発火
		if (!isSelected) return;

		onTextEdit?.({
			id,
		});
	}, []);

	// ドラッグ用のプロパティを生成
	const dragProps = useDrag({
		id,
		type: "Rectangle",
		x,
		y,
		syncWithSameId,
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

	// 変形コンポーネントを表示するかのフラグ
	const showTransformative = isSelected && !isMultiSelectSource && !isDragging;

	// 接続ポイントを表示するかのフラグ
	const doShowConnectPoints =
		showConnectPoints &&
		!isSelected &&
		!isMultiSelectSource &&
		!isDragging &&
		!isTransformimg;

	return (
		<>
			<g transform="translate(0.5,0.5)">
				<rect
					className="diagram"
					id={id}
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
					rx={radius}
					ry={radius}
					fill={fill}
					stroke={stroke}
					strokeWidth={strokeWidth}
					tabIndex={0}
					cursor="move"
					transform={transform}
					ref={svgRef}
					onDoubleClick={handleDoubleClick}
					{...dragProps}
				/>
			</g>
			<Textable
				x={-width / 2}
				y={-height / 2}
				width={width}
				height={height}
				transform={transform}
				text={text}
				textType={textType}
				fontColor={fontColor}
				fontSize={fontSize}
				fontFamily={fontFamily}
				fontWeight={fontWeight}
				textAlign={textAlign}
				verticalAlign={verticalAlign}
				isTextEditing={isTextEditing}
			/>
			{showTransformative && (
				<Transformative
					id={id}
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
					isMultiSelectSource={isMultiSelectSource}
					onTransform={handleTransform}
				/>
			)}
			{doShowConnectPoints &&
				connectPoints.map((cp) => (
					<ConnectPoint
						key={cp.id}
						id={cp.id}
						name={cp.name}
						x={cp.x}
						y={cp.y}
						ownerId={id}
						ownerShape={ownerShape}
						isTransparent={!isHovered || isDragging || isTransformimg}
						onConnect={onConnect}
					/>
				))}
			{isSelected && isDragging && (
				<PositionLabel
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
				/>
			)}
		</>
	);
};

export const Rectangle = memo(RectangleComponent);
