// Reactのインポート
import type React from "react";
import {
	forwardRef,
	memo,
	useCallback,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
import type {
	ConnectPointData,
	DiagramRef,
	RectangleData,
	Diagram,
} from "../../types/DiagramTypes";
import type {
	DiagramHoverEvent,
	DiagramDragEvent,
	DiagramResizeEvent,
	GroupDragEvent,
	GroupResizeEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import ConnectPoint from "../connector/ConnectPoint";

// RectangleBase関連型定義をインポート
import type { RectangleBaseDragPoints } from "../core/RectangleBase/RectangleBaseTypes";

// RectangleBase関連コンポーネントをインポート
import type { RectangleBaseProps } from "../core/RectangleBase";
import RectangleBase from "../core/RectangleBase";

// RectangleBase関連関数をインポート
import {
	calcRectangleVertices,
	calcArrangment,
	calcArrangmentOnGroupResize,
	calcPointOnGroupDrag,
} from "../core/RectangleBase/RectangleBaseFunctions";
import { degreesToRadians } from "../../functions/Math";

export type RectangleProps = RectangleBaseProps & RectangleData;

const Rectangle: React.FC<RectangleProps> = memo(
	forwardRef<DiagramRef, RectangleProps>(
		(
			{
				id,
				point,
				width,
				height,
				rotation = 0,
				fill = "transparent",
				stroke = "black",
				strokeWidth = "1px",
				keepProportion = false,
				tabIndex = 0,
				isSelected = false,
				items,
				onDiagramClick,
				onDiagramDragStart,
				onDiagramDrag,
				onDiagramDragEnd,
				onDiagramDragEndByGroup,
				onDiagramResizeStart,
				onDiagramResizing,
				onDiagramResizeEnd,
				onDiagramRotateEnd,
				onDiagramSelect,
				onDiagramConnect,
				onConnectPointMove,
			},
			ref,
		) => {
			const [isTransformimg, setIsTransforming] = useState(false);
			// ホバー状態の管理
			const [isHovered, setIsHovered] = useState(false);

			const svgRef = useRef<SVGRectElement>({} as SVGRectElement);
			const rectangleBaseRef = useRef<SVGGElement>({} as SVGGElement);

			// グループのドラッグ・リサイズ時に、グループ側から実行してもらう関数を公開
			useImperativeHandle(ref, () => ({
				onGroupDrag: handleGroupDrag,
				onGroupDragEnd: handleGroupDragEnd,
				onGroupResize: onGroupResize,
				onGroupResizeEnd: onGroupResizeEnd,
			}));

			/**
			 * グループのドラッグ中イベントハンドラ
			 *
			 * @param {GroupDragEvent} e グループのドラッグ中イベント
			 * @returns {void}
			 */
			const handleGroupDrag = useCallback(
				(e: GroupDragEvent) => {
					setIsTransforming(true); // TODO

					// グループのドラッグに伴うこの図形の座標を計算
					const newPoint = calcPointOnGroupDrag(e, point);

					// 描画処理負荷軽減のため、DOMを直接操作
					// 短径領域の移動をDOMの直接操作で実施
					rectangleBaseRef.current?.setAttribute(
						"transform",
						`translate(${newPoint.x}, ${newPoint.y})`,
					);
				},
				[point],
			);

			/**
			 * グループのドラッグ完了イベントハンドラ
			 *
			 * @param {GroupDragEvent} e グループのドラッグ完了イベント
			 * @returns {void}
			 */
			const handleGroupDragEnd = useCallback(
				(e: GroupDragEvent) => {
					// グループのドラッグ完了に伴うこの図形の位置変更をグループ側に通知し、SvgCanvasまで変更を伝番してもらう
					onDiagramDragEndByGroup?.({
						id,
						startPoint: point,
						endPoint: calcPointOnGroupDrag(e, point),
					});

					setIsTransforming(false);
				},
				[onDiagramDragEndByGroup, id, point],
			);

			/**
			 * グループのリサイズ中イベントハンドラ
			 *
			 * @param {GroupResizeEvent} e グループのリサイズ中イベント
			 */
			const onGroupResize = useCallback(
				(e: GroupResizeEvent) => {
					// グループのリサイズに伴うこの図形のリサイズ後の座標とサイズを計算
					const newArrangment = calcArrangmentOnGroupResize(
						e,
						point,
						width,
						height,
					);

					// 描画処理負荷軽減のため、DOMを直接操作
					// 短径領域の移動をDOMの直接操作で実施
					rectangleBaseRef.current?.setAttribute(
						"transform",
						`translate(${newArrangment.point.x}, ${newArrangment.point.y})`,
					);

					// 四角形のリサイズをDOMの直接操作で実施
					svgRef?.current?.setAttribute("width", `${newArrangment.width}`);
					svgRef?.current?.setAttribute("height", `${newArrangment.height}`);

					setIsTransforming(true);

					// グループのリサイズが契機で、かつDOMを直接更新しての変更なので、グループ側への変更通知はしない
				},
				[point, width, height],
			);

			/**
			 * グループのリサイズ完了イベントハンドラ
			 *
			 * @param {GroupResizeEvent} e グループのリサイズ完了イベント
			 */
			const onGroupResizeEnd = useCallback(
				(e: GroupResizeEvent) => {
					// グループのリサイズに伴うこの図形のサイズ変更を親に通知し、SvgCanvasまで変更を伝番してもらう
					onDiagramResizeEnd?.({
						id,
						...calcArrangmentOnGroupResize(e, point, width, height),
					});

					setIsTransforming(false);
				},
				[onDiagramResizeEnd, id, point, width, height],
			);

			/**
			 * 四角形のドラッグ開始イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e 四角形のドラッグ開始イベント
			 * @returns {void}
			 */
			const handleDiagramDragStart = useCallback(
				(e: DiagramDragEvent) => {
					setIsTransforming(true);
					onDiagramDragStart?.(e);
				},
				[onDiagramDragStart],
			);

			/**
			 * 接続ポイントの位置を更新
			 *
			 * @param {Point} originalPoint 矩形の一つの頂点を表す点
			 * @param {Point} diagonalPoint 矩形の対角線上のもう一つの頂点を表す点
			 * @returns {void}
			 */
			const updateConnectPoints = useCallback(
				(originalPoint: Point, diagonalPoint: Point) => {
					const newArrangement = calcArrangment(
						originalPoint,
						diagonalPoint,
						rotation,
					);

					for (const cp of (items as ConnectPointData[]) ?? []) {
						const cPoint = (newArrangement as RectangleBaseDragPoints)[
							cp.name as keyof RectangleBaseDragPoints
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
				[onConnectPointMove, rotation, items],
			);

			/**
			 * 四角形のドラッグ中イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e 四角形のドラッグ中イベント
			 * @returns {void}
			 */
			const handleDiagramDrag = useCallback(
				(e: DiagramDragEvent) => {
					updateConnectPoints(e.endPoint, {
						x: e.endPoint.x + width,
						y: e.endPoint.y + height,
					});

					onDiagramDrag?.(e);
				},
				[onDiagramDrag, updateConnectPoints, width, height],
			);

			/**
			 * 四角形のドラッグ完了イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e 四角形のドラッグ完了イベント
			 * @returns {void}
			 */
			const handleDiagramDragEnd = useCallback(
				(e: DiagramDragEvent) => {
					onDiagramDragEnd?.(e);
					setIsTransforming(false);
				},
				[onDiagramDragEnd],
			);

			/**
			 * 四角形のドラッグ開始イベントハンドラ
			 *
			 * @param {DiagramResizeEvent} e 四角形のドラッグ開始イベント
			 * @returns {void}
			 */
			const handleDiagramResizeStart = useCallback(
				(e: DiagramResizeEvent) => {
					setIsTransforming(true);
					onDiagramResizeStart?.(e);
				},
				[onDiagramResizeStart],
			);

			/**
			 * 四角形のリサイズ中イベントハンドラ
			 *
			 * @param {DiagramResizeEvent} e 四角形のリサイズ中イベント
			 */
			const handleDiagramResizing = useCallback(
				(e: DiagramResizeEvent) => {
					setIsTransforming(true); // TODO

					// 描画処理負荷軽減のため、DOMを直接操作
					svgRef.current?.setAttribute("width", `${e.width}`);
					svgRef.current?.setAttribute("height", `${e.height}`);

					updateConnectPoints(e.point, {
						x: e.point.x + e.width,
						y: e.point.y + e.height,
					});

					// グループ側に変更中イベントを通知
					onDiagramResizing?.(e);
				},
				[onDiagramResizing, updateConnectPoints],
			);

			/**
			 * 四角形のリサイズ完了イベントハンドラ
			 *
			 * @param {DiagramResizeEvent} e 四角形のリサイズ完了イベント
			 *
			 */
			const handleDiagramResizeEnd = useCallback(
				(e: DiagramResizeEvent) => {
					// 短形領域の変更完了イベントをそのまま親に伝番させる。
					// 最終的にSvgCanvasまでイベントが伝番され、この図形のサイズ変更が行われる。
					onDiagramResizeEnd?.(e);

					setIsTransforming(false);
				},
				[onDiagramResizeEnd],
			);

			/**
			 * ホバー状態変更イベントハンドラ
			 *
			 * @param {DiagramHoverEvent} e ホバー状態変更イベント
			 * @returns {void}
			 */
			const handleDiagramHoverChange = useCallback((e: DiagramHoverEvent) => {
				setIsHovered(e.isHovered);
			}, []);

			return (
				<>
					<RectangleBase
						key={`rect-base-${id}`}
						id={id}
						type="Rectangle"
						point={point}
						width={width}
						height={height}
						rotation={rotation}
						tabIndex={tabIndex}
						keepProportion={keepProportion}
						isSelected={isSelected}
						onDiagramClick={onDiagramClick}
						onDiagramDragStart={handleDiagramDragStart}
						onDiagramDrag={handleDiagramDrag}
						onDiagramDragEnd={handleDiagramDragEnd}
						onDiagramResizeStart={handleDiagramResizeStart}
						onDiagramResizing={handleDiagramResizing}
						onDiagramResizeEnd={handleDiagramResizeEnd}
						onDiagramRotateEnd={onDiagramRotateEnd}
						onDiagramSelect={onDiagramSelect}
						onDiagramHoverChange={handleDiagramHoverChange}
						ref={rectangleBaseRef}
					>
						<rect
							key={`rect-${id}`}
							id={id}
							x={0}
							y={0}
							width={width}
							height={height}
							fill={fill}
							stroke={stroke}
							strokeWidth={strokeWidth}
							transform={`rotate(${rotation}, ${width / 2}, ${height / 2})`}
							ref={svgRef}
						/>
					</RectangleBase>
					{!isSelected &&
						(items as ConnectPointData[])?.map((cp) => (
							<ConnectPoint
								key={cp.id}
								id={cp.id}
								name={cp.name}
								point={cp.point}
								isSelected={false}
								visible={isHovered && !isTransformimg}
								onConnect={onDiagramConnect}
							/>
						))}
				</>
			);
		},
	),
);

export default Rectangle;

export const createRectangleData = (
	id: string,
	point: Point,
	width: number,
	height: number,
	fill: string,
	stroke: string,
	strokeWidth: string,
): RectangleData => {
	const vertices = calcRectangleVertices(point, width, height, 0);

	const items: Diagram[] = [];
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.leftTopPoint,
		isSelected: false,
		name: "leftTopPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.rightTopPoint,
		isSelected: false,
		name: "rightTopPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.leftBottomPoint,
		isSelected: false,
		name: "leftBottomPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.rightBottomPoint,
		isSelected: false,
		name: "rightBottomPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.topCenterPoint,
		isSelected: false,
		name: "topCenterPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.bottomCenterPoint,
		isSelected: false,
		name: "bottomCenterPoint",
	});
	items.push({
		id: crypto.randomUUID(),
		type: "ConnectPoint",
		point: vertices.leftCenterPoint,
		isSelected: false,
		name: "leftCenterPoint",
	});
	items.push({
		id: crypto.randomUUID(),
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
		rotation: degreesToRadians(0),
		fill,
		stroke,
		strokeWidth,
		keepProportion: false,
		isSelected: false,
		items,
	} as RectangleData;
};
