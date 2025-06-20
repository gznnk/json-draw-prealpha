// Import React.
import type React from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";

// Import types.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramHoverEvent } from "../../../types/events/DiagramHoverEvent";
import type { DiagramPointerEvent } from "../../../types/events/DiagramPointerEvent";
import type { DiagramTransformEvent } from "../../../types/events/DiagramTransformEvent";
import type { EllipseProps } from "../../../types/props/shapes/EllipseProps";

// SvgCanvas関連コンポ�Eネントをインポ�EチE
import { PositionLabel } from "../../core/PositionLabel";
import { Outline } from "../../core/Outline";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoint } from "../ConnectPoint";

// Import hooks.
import { useDrag } from "../../../hooks/useDrag";

// Import utils.
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";

// Import local module files.
import { EllipseElement } from "./EllipseStyled";

/**
 * 楕�Eコンポ�EネンチE
 */
const EllipseComponent: React.FC<EllipseProps> = ({
	id,
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	fill,
	stroke,
	strokeWidth,
	keepProportion,
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
	showOutline = false,
	onDrag,
	onClick,
	onSelect,
	onTransform,
	onConnect,
	onTextEdit,
}) => {
	// ドラチE��中か�Eフラグ
	const [isDragging, setIsDragging] = useState(false);
	// 変形中か�Eフラグ
	const [isTransformimg, setIsTransforming] = useState(false);
	// ホバー中か�Eフラグ
	const [isHovered, setIsHovered] = useState(false);
	// 変形対象のSVG要素への参�E
	const svgRef = useRef<SVGEllipseElement>({} as SVGEllipseElement);

	// ハンドラ生�Eの頻発を回避するため、参照する値をuseRefで保持する
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
	 * 楕�EのドラチE��イベントハンドラ
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
	 * 楕�Eの変形イベントハンドラ
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
	 * ドラチE��オーバ�Eイベントハンドラ
	 */
	const handleDragOver = useCallback(() => {
		setIsHovered(true);
	}, []);

	/**
	 * ドラチE��リーブイベントハンドラ
	 */
	const handleDragLeave = useCallback(() => {
		setIsHovered(false);
	}, []);

	/**
	 * ダブルクリチE��イベントハンドラ
	 */
	const handleDoubleClick = useCallback(() => {
		const { id, isSelected, isTextEditEnabled, onTextEdit } = refBus.current;

		if (!isTextEditEnabled) return;

		if (!isSelected) return;

		// チE��スト編雁E��ベントを発火
		onTextEdit?.({
			id,
		});
	}, []);

	// ドラチE��用のプロパティを生戁E
	const dragProps = useDrag({
		id,
		type: "Ellipse",
		x,
		y,
		syncWithSameId,
		ref: svgRef,
		onPointerDown: handlePointerDown,
		onClick: onClick,
		onDrag: handleDrag,
		onHover: handleHover,
		onDragOver: handleDragOver,
		onDragLeave: handleDragLeave,
	});

	// memo化によりConnectPointの再描画を抑制
	// keyで刁E��してばら�Eらにpropsで渡すと、各ConnectPoint側それぞれで吁Eeyに対して
	// 比輁E�E琁E��走り非効玁E��ので、ここでまとめてShapeの差異を検知する
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

	// ellipseのtransform属性を生戁E
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// 変形コンポ�Eネントを表示するか�Eフラグ
	const showTransformative = isSelected && !isMultiSelectSource && !isDragging;

	// 接続�Eイントを表示するか�Eフラグ
	const doShowConnectPoints =
		showConnectPoints &&
		!isSelected &&
		!isMultiSelectSource &&
		!isDragging &&
		!isTransformimg;

	return (
		<>
			<g transform="translate(0.5,0.5)">
				<EllipseElement
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
					isTransparent={isTransparent || isMultiSelectSource}
					transform={transform}
					ref={svgRef}
					onDoubleClick={handleDoubleClick}
					{...dragProps}
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
				showOutline={showOutline}
			/>
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

export const Ellipse = memo(EllipseComponent);
