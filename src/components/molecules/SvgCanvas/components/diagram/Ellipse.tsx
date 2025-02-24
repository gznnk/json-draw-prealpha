// Reactのインポート
import type React from "react";
import {
	forwardRef,
	memo,
	useCallback,
	useImperativeHandle,
	useRef,
} from "react";

// SvgCanvas関連型定義をインポート
import type { DiagramRef } from "../../types/DiagramTypes";
import type {
	DiagramResizeEvent,
	GroupResizeEvent,
	GroupDragEvent,
} from "../../types/EventTypes";

// RectangleBase関連コンポーネントをインポート
import type { RectangleBaseProps } from "../core/RectangleBase";
import RectangleBase from "../core/RectangleBase";

// RectangleBase関連関数をインポート
import {
	calcArrangmentOnGroupResize,
	calcPointOnGroupDrag,
} from "../core/RectangleBase/RectangleBaseFunctions";

type EllipseProps = RectangleBaseProps & {
	fill?: string;
	stroke?: string;
	strokeWidth?: string;
	ref?: React.Ref<DiagramRef>;
};

const Ellipse: React.FC<EllipseProps> = memo(
	forwardRef<DiagramRef, EllipseProps>(
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
				onDiagramClick,
				onDiagramDragStart,
				onDiagramDrag,
				onDiagramDragEnd,
				onDiagramDragEndByGroup,
				onDiagramResizeStart,
				onDiagramResizing,
				onDiagramResizeEnd,
				onDiagramSelect,
			},
			ref,
		) => {
			const svgRef = useRef<SVGEllipseElement>({} as SVGEllipseElement);
			const rectangleBaseRef = useRef<SVGGElement>({} as SVGGElement);

			// 親から参照するためのRefを作成
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
						old: {
							point,
							width,
							height,
						},
						new: {
							point: calcPointOnGroupDrag(e, point),
							width,
							height,
						},
					});
				},
				[onDiagramDragEndByGroup, id, point, width, height],
			);

			/**
			 * グループのリサイズ中イベントハンドラ
			 *
			 * @param {GroupResizeEvent} e グループのリサイズ中イベント
			 * @returns {void}
			 */
			const onGroupResize = useCallback(
				(e: GroupResizeEvent) => {
					// グループのリサイズ完了に伴うこの図形の変更を計算
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

					// 円形のリサイズをDOMの直接操作で実施
					const rx = newArrangment.width / 2;
					const ry = newArrangment.height / 2;
					svgRef.current?.setAttribute("cx", `${rx}`);
					svgRef.current?.setAttribute("cy", `${ry}`);
					svgRef.current?.setAttribute("rx", `${rx}`);
					svgRef.current?.setAttribute("ry", `${ry}`);

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
					// グループのリサイズ完了に伴うこの図形のサイズ変更を親に通知し、SvgCanvasまで変更を伝番してもらう
					onDiagramResizeEnd?.({
						id,
						...calcArrangmentOnGroupResize(e, point, width, height),
					});
				},
				[onDiagramResizeEnd, id, point, width, height],
			);

			/**
			 * 短形領域の変更中イベントハンドラ
			 *
			 * @param {DiagramResizeEvent} e 短形領域の変更中イベント
			 */
			const handleDiagramResizing = useCallback(
				(e: DiagramResizeEvent) => {
					// 描画処理負荷軽減のため、DOMを直接操作
					svgRef.current?.setAttribute("cx", `${e.width / 2}`);
					svgRef.current?.setAttribute("cy", `${e.height / 2}`);
					svgRef.current?.setAttribute("rx", `${e.width / 2}`);
					svgRef.current?.setAttribute("ry", `${e.height / 2}`);

					// グループ側に変更中イベントを通知
					onDiagramResizing?.(e);
				},
				[onDiagramResizing],
			);

			return (
				<RectangleBase
					id={id}
					point={point}
					width={width}
					height={height}
					keepProportion={keepProportion}
					tabIndex={tabIndex}
					isSelected={isSelected}
					onDiagramClick={onDiagramClick}
					onDiagramDragStart={onDiagramDragStart}
					onDiagramDrag={onDiagramDrag}
					onDiagramDragEnd={onDiagramDragEnd}
					onDiagramResizeStart={onDiagramResizeStart}
					onDiagramResizing={handleDiagramResizing}
					onDiagramResizeEnd={onDiagramResizeEnd} // 短形領域の変更完了イベントはそのまま親に伝番させて、Propsの更新を親側にしてもらう
					onDiagramSelect={onDiagramSelect}
					ref={rectangleBaseRef}
				>
					<ellipse
						id={id}
						cx={width / 2}
						cy={height / 2}
						rx={width / 2}
						ry={height / 2}
						ref={svgRef}
						fill={fill}
						stroke={stroke}
						strokeWidth={strokeWidth}
					/>
				</RectangleBase>
			);
		},
	),
);

export default Ellipse;
