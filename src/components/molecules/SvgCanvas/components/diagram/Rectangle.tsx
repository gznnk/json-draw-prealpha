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
import type { DiagramRef, RectangleData } from "../../types/DiagramTypes";
import type {
	DiagramHoverEvent,
	DiagramDragEvent,
	DiagramResizeEvent,
	GroupDragEvent,
	GroupResizeEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import ConnectPoint from "../connector/ConnectPoint";

// RectangleBase関連コンポーネントをインポート
import type { RectangleBaseProps } from "../core/RectangleBase";
import RectangleBase from "../core/RectangleBase";

// RectangleBase関連関数をインポート
import {
	calcArrangment,
	calcArrangmentOnGroupResize,
	calcPointOnGroupDrag,
} from "../core/RectangleBase/RectangleBaseFunctions";

export type RectangleProps = RectangleBaseProps & RectangleData;

const Rectangle: React.FC<RectangleProps> = memo(
	forwardRef<DiagramRef, RectangleProps>(
		(
			{
				id,
				point,
				width,
				height,
				fill = "transparent",
				stroke = "black",
				strokeWidth = "1px",
				keepProportion = false,
				tabIndex = 0,
				isSelected = false,
				connectPoints,
				onDiagramClick,
				onDiagramDragStart,
				onDiagramDrag,
				onDiagramDragEnd,
				onDiagramDragEndByGroup,
				onDiagramResizeStart,
				onDiagramResizing,
				onDiagramResizeEnd,
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
					// グループのドラッグに伴うこの図形の座標を計算
					const newPoint = calcPointOnGroupDrag(e, point);

					// 描画処理負荷軽減のため、DOMを直接操作
					// 短径領域の移動をDOMの直接操作で実施
					rectangleBaseRef.current?.setAttribute(
						"transform",
						`translate(${newPoint.x}, ${newPoint.y})`,
					);

					setIsTransforming(true); // TODO
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

			const handleDiagramDrag = useCallback(
				(e: DiagramDragEvent) => {
					const dx = e.endPoint.x - e.startPoint.x;
					const dy = e.endPoint.y - e.startPoint.y;

					for (const cp of connectPoints ?? []) {
						onConnectPointMove?.({
							id: cp.id,
							point: {
								x: cp.point.x + dx,
								y: cp.point.y + dy,
							},
						});
					}

					onDiagramDrag?.(e);
				},
				[onDiagramDrag, onConnectPointMove, connectPoints],
			);

			/**
			 * 短形領域の変更中イベントハンドラ
			 *
			 * @param {DiagramResizeEvent} e 短形領域の変更中イベント
			 */
			const handleDiagramResizing = useCallback(
				(e: DiagramResizeEvent) => {
					// 描画処理負荷軽減のため、DOMを直接操作
					svgRef.current?.setAttribute("width", `${e.width}`);
					svgRef.current?.setAttribute("height", `${e.height}`);

					// グループ側に変更中イベントを通知
					onDiagramResizing?.(e);

					setIsTransforming(true); // TODO
				},
				[onDiagramResizing],
			);

			/**
			 * 短径領域の変更完了イベントハンドラ
			 *
			 * @param {DiagramResizeEvent} e 短径領域の変更完了イベント
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
						id={id}
						type="Rectangle"
						point={point}
						width={width}
						height={height}
						tabIndex={tabIndex}
						keepProportion={keepProportion}
						isSelected={isSelected}
						onDiagramClick={onDiagramClick}
						onDiagramDragStart={onDiagramDragStart}
						onDiagramDrag={handleDiagramDrag}
						onDiagramDragEnd={onDiagramDragEnd}
						onDiagramResizeStart={onDiagramResizeStart}
						onDiagramResizing={handleDiagramResizing}
						onDiagramResizeEnd={handleDiagramResizeEnd}
						onDiagramSelect={onDiagramSelect}
						onDiagramHoverChange={handleDiagramHoverChange}
						ref={rectangleBaseRef}
					>
						<rect
							id={id}
							x={0}
							y={0}
							width={width}
							height={height}
							ref={svgRef}
							fill={fill}
							stroke={stroke}
							strokeWidth={strokeWidth}
						/>
					</RectangleBase>
					{connectPoints?.map((cp) => (
						<ConnectPoint
							key={cp.id}
							name={cp.name}
							id={cp.id}
							point={cp.point}
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
