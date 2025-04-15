// Reactのインポート
import type React from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { EllipseVertices } from "../../../types/CoordinateTypes";
import type {
	ConnectPointData,
	CreateDiagramProps,
	EllipseData,
	Shape,
} from "../../../types/DiagramTypes";
import type {
	ConnectPointMoveData,
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramPointerEvent,
	DiagramTransformEvent,
	EventType,
} from "../../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import { PositionLabel } from "../../core/PositionLabel";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoint } from "../ConnectPoint";

// SvgCanvas関連カスタムフックをインポート
import { useDrag } from "../../../hooks/dragHooks";

// SvgCanvas関連関数をインポート
import { createSvgTransform } from "../../../utils/Diagram";
import { calcEllipseVertices, degreesToRadians } from "../../../utils/Math";

/**
 * 楕円コンポーネントのプロパティ
 */
export type EllipseProps = CreateDiagramProps<
	EllipseData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		textable: true;
	}
>;

/**
 * 楕円コンポーネント
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
	items,
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
	onConnectPointsMove, // TODO: onDiagramChangeに変更すべきか？
	onTextEdit,
}) => {
	// ドラッグ中かのフラグ
	const [isDragging, setIsDragging] = useState(false);
	// 変形中かのフラグ
	const [isTransformimg, setIsTransforming] = useState(false);
	// ホバー中かのフラグ
	const [isHovered, setIsHovered] = useState(false);
	// 変形対象のSVG要素への参照
	const svgRef = useRef<SVGEllipseElement>({} as SVGEllipseElement);

	/**
	 * 接続ポイントの位置を更新
	 *
	 * @param eventType イベントタイプ
	 * @param rectShape 四角形の形状（差分）
	 */
	const updateConnectPoints = (
		eventId: string,
		eventType: EventType,
		rectShape: Partial<Shape>,
	) => {
		// 複数選択時の選択元の場合、複数選択グループ側の処理と重複するためスキップ
		if (isMultiSelectSource) return;

		// 更新後の四角形の形状
		const newRectShape = {
			x,
			y,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
			...rectShape,
		};
		// 更新後の楕円の頂点座標を計算
		const vertices = calcEllipseVertices(newRectShape);

		// 接続ポイントの移動データを生成
		const newConnectPoints: ConnectPointMoveData[] = [];
		for (const connectPointData of (items as ConnectPointData[]) ?? []) {
			const vertex = (vertices as EllipseVertices)[
				connectPointData.name as keyof EllipseVertices
			];

			newConnectPoints.push({
				id: connectPointData.id,
				x: vertex.x,
				y: vertex.y,
				ownerId: id,
				ownerShape: newRectShape,
			});
		}

		// 接続ポイント移動イベントを発火
		onConnectPointsMove?.({
			eventId,
			eventType,
			points: newConnectPoints,
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
		onTextEdit,
		// 内部変数・内部関数
		updateConnectPoints,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * 楕円のドラッグイベントハンドラ
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		const { onDrag, updateConnectPoints } = refBus.current;

		if (e.eventType === "Start") {
			setIsDragging(true);
		}

		// TODO: onDiagramChangeに変更し、接続ポイントの位置更新も同時におこなう？
		onDrag?.(e);

		updateConnectPoints(e.eventId, e.eventType, {
			x: e.endX,
			y: e.endY,
		});

		if (e.eventType === "End") {
			setIsDragging(false);
		}
	}, []);

	/**
	 * 楕円の変形イベントハンドラ
	 */
	const handleTransform = useCallback((e: DiagramTransformEvent) => {
		const { onTransform, updateConnectPoints } = refBus.current;

		if (e.eventType === "Start") {
			setIsTransforming(true);
		}

		// TODO: onDiagramChangeに変更し、接続ポイントの位置更新も同時におこなう？
		onTransform?.(e);

		updateConnectPoints(e.eventId, e.eventType, e.endShape);

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
		type: "Ellipse",
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

	// ellipseのtransform属性を生成
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
				<ellipse
					className="diagram"
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
				(items as ConnectPointData[])?.map((cp) => (
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
