// Import React.
import type React from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";

// Import types.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramHoverEvent } from "../../../types/events/DiagramHoverEvent";
import type { DiagramPointerEvent } from "../../../types/events/DiagramPointerEvent";
import type { DiagramTransformEvent } from "../../../types/events/DiagramTransformEvent";
import type { RectangleProps } from "../../../types/props/shapes/RectangleProps";

// Import components related to SvgCanvas.
import { PositionLabel } from "../../core/PositionLabel";
import { Outline } from "../../core/Outline";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoint } from "../ConnectPoint";

// Import hooks.
import { useDrag } from "../../../hooks/useDrag";
import { useFileDrop } from "../../../hooks/useFileDrop";

// Import utils.
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";

// Import local module files.
import { RectangleElement } from "./RectangleStyled";

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
	isTextEditEnabled = true,
	isTransparent,
	showAsChildOutline = false,
	eventBus,
	onDrag,
	onClick,
	onSelect,
	onTransform,
	onConnect,
	onTextEdit,
	onFileDrop,
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
		isTextEditEnabled,
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
	 * ドラッグオーバーイベントハンドラ
	 */
	const handleDragOver = useCallback(() => {
		setIsHovered(true);
	}, []);

	/**
	 * ドラッグリーブイベントハンドラ
	 */
	const handleDragLeave = useCallback(() => {
		setIsHovered(false);
	}, []);

	/**
	 * ダブルクリックイベントハンドラ
	 */
	const handleDoubleClick = useCallback(() => {
		const { id, isSelected, isTextEditEnabled, onTextEdit } = refBus.current;

		if (!isTextEditEnabled) return;

		if (!isSelected) return;

		// テキスト編集イベントを発火
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
		eventBus,
		onPointerDown: handlePointerDown,
		onClick: onClick,
		onDrag: handleDrag,
		onHover: handleHover,
		onDragOver: handleDragOver,
		onDragLeave: handleDragLeave,
	});

	// ファイルドロップ用のプロパティを生成
	const fileDropProps = useFileDrop({ id, onFileDrop });

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
				<RectangleElement
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
					isTransparent={isTransparent || isMultiSelectSource}
					transform={transform}
					ref={svgRef}
					onDoubleClick={handleDoubleClick}
					{...dragProps}
					{...fileDropProps}
				/>
			</g>
			{isTextEditEnabled && (
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
			)}
			<Outline
				x={x}
				y={y}
				width={width}
				height={height}
				rotation={rotation}
				scaleX={scaleX}
				scaleY={scaleY}
				isSelected={isSelected}
				isMultiSelectSource={isMultiSelectSource}
				showAsChildOutline={showAsChildOutline}
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
					eventBus={eventBus}
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
						eventBus={eventBus}
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
