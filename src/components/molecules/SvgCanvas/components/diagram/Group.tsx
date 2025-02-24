// Reactのインポート
import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
import type { Diagram, DiagramRef } from "../../types/DiagramTypes";
import { DiagramTypeComponentMap } from "../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramResizeEvent,
	DiagramSelectEvent,
	GroupDragEvent,
	GroupResizeEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import RectangleBase from "../core/RectangleBase";
import type { RectangleProps } from "./Rectangle";

// RectangleBase関連関数をインポート
import {
	calcArrangmentOnGroupResize,
	calcPointOnGroupDrag,
} from "../core/RectangleBase/RectangleBaseFunctions";

/**
 * 選択されたグループ内の図形のIDを再帰的に取得する
 *
 * @param {Diagram[]} diagrams 図形リスト
 * @returns {string | undefined} 選択されたグループ内の図形のID
 */
const getSelectedChildDiagramId = (diagrams: Diagram[]): string | undefined => {
	for (const diagram of diagrams) {
		if (diagram.isSelected) {
			return diagram.id;
		}
		const id = getSelectedChildDiagramId(diagram.items || []);
		if (id) {
			return id;
		}
	}
};

type GroupProps = RectangleProps & {
	items?: Diagram[];
};

const Group: React.FC<GroupProps> = memo(
	forwardRef<DiagramRef, GroupProps>(
		(
			{
				id,
				point,
				width,
				height,
				keepProportion = false,
				tabIndex = 0,
				isSelected = false,
				onDiagramClick,
				onDiagramResizeStart,
				onDiagramResizing,
				onDiagramResizeEnd,
				onDiagramDragStart,
				onDiagramDrag,
				onDiagramDragEnd,
				onDiagramDragEndByGroup,
				onDiagramSelect,
				items = [],
			},
			ref,
		) => {
			const [isDragging, setIsDragging] = useState(false);
			const [isReselect, setIsReselect] = useState(false);

			// 親から参照するためのRefを作成
			useImperativeHandle(ref, () => ({
				onGroupDrag: handleParentGroupDrag,
				onGroupDragEnd: handleParentGroupDragEnd,
				onGroupResize: onParentGroupResize,
				onGroupResizeEnd: onParentGroupResizeEnd,
			}));

			// グループ内の図形への参照を保持するRef作成
			const itemsRef = useRef<{
				[key: string]: DiagramRef | undefined;
			}>({});

			/**
			 * グループ内の図形の選択イベントハンドラ
			 *
			 * @param {DiagramSelectEvent} e 図形選択イベント
			 * @returns {void}
			 */
			const handleChildDiagramSelect = useCallback(
				(e: DiagramSelectEvent) => {
					const selectedChildId = getSelectedChildDiagramId(items);
					// グループ内の図形が選択されていない場合、このグループを選択状態にする
					if (!selectedChildId) {
						onDiagramSelect?.({
							id,
						});
					} else if (selectedChildId !== e.id) {
						// グループ内の図形が選択されていて、かつそれと違うグループ内の図形が選択された場合、そのグループ内の図形を選択状態にする
						onDiagramSelect?.(e);
					}

					if (isSelected) {
						// 再選択時後のクリック（ポインターアップ）時にグループ内の図形を選択したいので、再選択フラグを立てる
						setIsReselect(true);
					}
				},
				[onDiagramSelect, id, isSelected, items],
			);

			/**
			 * グループ内の図形のクリックイベントハンドラ
			 *
			 * @param {DiagramSelectEvent} e 図形選択イベント
			 * @returns {void}
			 */
			const handleChildDiagramClick = useCallback(
				(e: DiagramSelectEvent) => {
					if (isReselect) {
						// 再選択時のクリック（ポインターアップ）時であれば、そのグループ内の図形を選択状態にする
						onDiagramSelect?.(e);
						setIsReselect(false);
					} else {
						// 再選択でない場合は、グループ内の図形のクリックイベントを
						// このグループのクリックイベントに差し替えて、このグループが選択されるようにする
						onDiagramClick?.({
							id,
						});
					}
				},
				[onDiagramSelect, onDiagramClick, isReselect, id],
			);

			useEffect(() => {
				// 選択が外れたら再選択フラグも解除
				if (!isSelected) {
					setIsReselect(false);
				}
			}, [isSelected]);

			/**
			 * 親グループのドラッグ中イベントハンドラ
			 *
			 * @param {GroupDragEvent} e グループのドラッグ中イベント
			 * @returns {void}
			 */
			const handleParentGroupDrag = useCallback(
				(e: GroupDragEvent) => {
					// グループのドラッグに伴うこの図形の座標を計算
					const newPoint = calcPointOnGroupDrag(e, point);

					// グループ内の図形にドラッグ中イベントを通知
					for (const item of items) {
						itemsRef.current[item.id]?.onGroupDrag?.({
							id,
							oldPoint: point,
							newPoint,
						});
					}
				},
				[point, id, items],
			);

			/**
			 * 親グループのドラッグ完了イベントハンドラ
			 *
			 * @param {GroupDragEvent} e グループのドラッグ完了イベント
			 * @returns {void}
			 */
			const handleParentGroupDragEnd = useCallback(
				(e: GroupDragEvent) => {
					// グループのドラッグに伴うこの図形の座標を計算
					const newPoint = calcPointOnGroupDrag(e, point);

					// グループ内の図形にドラッグ完了イベントを通知
					for (const item of items) {
						itemsRef.current[item.id]?.onGroupDragEnd?.({
							id,
							oldPoint: point,
							newPoint,
						});
					}

					// グループの位置も更新
					onDiagramDragEndByGroup?.({
						id,
						old: {
							point: point,
							width,
							height,
						},
						new: {
							point: newPoint,
							width,
							height,
						},
					});
				},
				[onDiagramDragEndByGroup, id, point, width, height, items],
			);

			/**
			 * 親グループのリサイズ中イベントハンドラ
			 *
			 * @param {GroupResizeEvent} e 親図形のリサイズ中イベント
			 */
			const onParentGroupResize = useCallback(
				(e: GroupResizeEvent) => {
					// グループのリサイズ完了に伴うこの図形の変更を計算
					const newArrangment = calcArrangmentOnGroupResize(
						e,
						point,
						width,
						height,
					);

					// リサイズ中イベント作成
					const event = {
						id,
						oldPoint: point,
						oldWidth: width,
						oldHeight: height,
						newPoint: newArrangment.point,
						newWidth: newArrangment.width,
						newHeight: newArrangment.height,
						scaleX: e.scaleX,
						scaleY: e.scaleY,
					};

					// グループ内の図形にリサイズ中イベントを通知
					for (const item of items) {
						itemsRef.current[item.id]?.onGroupResize?.(event);
					}

					// グループのリサイズが契機で、かつDOMを直接更新しての変更なので、グループ側への変更通知はしない
				},
				[id, point, width, height, items],
			);

			/**
			 * 親グループのリサイズ完了イベントハンドラ
			 *
			 * @param {GroupResizeEvent} e グループのリサイズ完了イベント
			 */
			const onParentGroupResizeEnd = useCallback(
				(e: GroupResizeEvent) => {
					// グループのリサイズ完了に伴うこの図形の変更を計算
					const newArrangment = calcArrangmentOnGroupResize(
						e,
						point,
						width,
						height,
					);

					// リサイズ完了イベント作成
					const event = {
						id,
						oldPoint: point,
						oldWidth: width,
						oldHeight: height,
						newPoint: newArrangment.point,
						newWidth: newArrangment.width,
						newHeight: newArrangment.height,
						scaleX: e.scaleX,
						scaleY: e.scaleY,
					};

					// グループ内の図形にリサイズ完了イベントを通知
					for (const item of items) {
						itemsRef.current[item.id]?.onGroupResizeEnd?.(event);
					}

					// グループのリサイズ完了に伴うこのグループのサイズ変更を親に通知し、SvgCanvasまで変更を伝番してもらう
					onDiagramResizeEnd?.({
						id,
						...newArrangment,
					});
				},
				[onDiagramResizeEnd, id, point, width, height, items],
			);

			/**
			 * グループ内の図形のドラッグ開始イベントハンドラ
			 *
			 * @param {DiagramDragEvent} _e 図形ドラッグ開始イベント
			 */
			const handleChildDiagramDragStart = useCallback(
				(e: DiagramDragEvent) => {
					if (isSelected) {
						// グループ選択時であれば、グループ全体をドラッグ可能にする
						setIsDragging(true);
					}

					// ドラッグイベントをそのまま伝番させる
					onDiagramDragStart?.(e);
				},
				[onDiagramDragStart, isSelected],
			);

			/**
			 * グループ内の図形のドラッグ中イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e 図形ドラッグ中イベント
			 */
			const handleChildDiagramDrag = useCallback(
				(e: DiagramDragEvent) => {
					if (!isDragging) {
						// グループのドラッグでなければ、ドラッグイベントをそのまま伝番させて終了
						onDiagramDrag?.(e);
						return;
					}

					const dx = e.new.point.x - e.old.point.x;
					const dy = e.new.point.y - e.old.point.y;

					// グループ内の図形にドラッグ中イベントを通知し、同じグループ内の図形も移動させる
					for (const item of items) {
						if (e.id !== item.id) {
							itemsRef.current[item.id]?.onGroupDrag?.({
								id,
								oldPoint: point,
								newPoint: {
									x: point.x + dx,
									y: point.y + dy,
								},
							});
						}
					}
				},
				[onDiagramDrag, isDragging, id, point, items],
			);

			/**
			 * グループ内の図形の変更イベントに伴うグループの変更後の配置の計算する
			 *
			 * @param {Diagram[]} list グループ内の図形リスト
			 * @param {DiagramResizeEvent} e 図形リサイズイベント
			 * @returns {Object} グループの変更後の配置
			 */
			const calcGroupArrangmentOnChildDiagramEvent = useCallback(
				(
					list: Diagram[],
					e: {
						id: string;
						point: Point;
						width: number;
						height: number;
					},
				) => {
					let top = point.y + height;
					let bottom = point.y;
					let left = point.x + width;
					let right = point.x;
					for (const item of list) {
						if (e.id !== item.id) {
							if (item.type === "group") {
								const groupArrangment = calcGroupArrangmentOnChildDiagramEvent(
									item.items ?? [],
									e,
								);
								top = Math.min(top, groupArrangment.top);
								bottom = Math.max(bottom, groupArrangment.bottom);
								left = Math.min(left, groupArrangment.left);
								right = Math.max(right, groupArrangment.right);
							} else {
								top = Math.min(top, item.point.y);
								bottom = Math.max(bottom, item.point.y + item.height);
								left = Math.min(left, item.point.x);
								right = Math.max(right, item.point.x + item.width);
							}
						}
					}

					return {
						top: Math.min(top, e.point.y),
						bottom: Math.max(bottom, e.point.y + e.height),
						left: Math.min(left, e.point.x),
						right: Math.max(right, e.point.x + e.width),
					};
				},
				[height, point, width],
			);

			/**
			 * グループ内の図形のドラッグ終了イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e 図形ドラッグ終了イベント
			 */
			const handleChildDiagramDragEnd = useCallback(
				(e: DiagramDragEvent) => {
					// グループ内の図形のドラッグ終了イベントを伝番し、ドラッグされた図形の位置を更新
					onDiagramDragEnd?.(e);

					// グループ全体のドラッグでない、かつグループ内の選択された図形のドラッグの場合、その図形の位置変更によるグループの配置を更新する
					if (!isDragging && getSelectedChildDiagramId(items)) {
						const { top, bottom, left, right } =
							calcGroupArrangmentOnChildDiagramEvent(items, {
								id: e.id,
								...e.new,
							});

						onDiagramResizeEnd?.({
							id,
							point: {
								x: left,
								y: top,
							},
							width: right - left,
							height: bottom - top,
						});
						return;
					}

					// 以降、グループ全体のドラッグの場合の処理

					const dx = e.new.point.x - e.old.point.x;
					const dy = e.new.point.y - e.old.point.y;

					// グループ内の図形にドラッグ完了イベントを通知し、同じグループ内の図形を移動させる
					for (const item of items) {
						if (e.id !== item.id) {
							itemsRef.current[item.id]?.onGroupDragEnd?.({
								id,
								oldPoint: point,
								newPoint: {
									x: point.x + dx,
									y: point.y + dy,
								},
							});
						}
					}

					// グループの位置も更新
					onDiagramDragEnd?.({
						id,
						old: {
							point: point,
							width,
							height,
						},
						new: {
							point: {
								x: point.x + dx,
								y: point.y + dy,
							},
							width,
							height,
						},
					});

					setIsDragging(false);
				},
				[
					onDiagramDragEnd,
					onDiagramResizeEnd,
					calcGroupArrangmentOnChildDiagramEvent,
					isDragging,
					id,
					point,
					width,
					height,
					items,
				],
			);

			/**
			 * グループ内の図形のリサイズ終了イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e 図形リサイズ終了イベント
			 */
			const handleChildDiagramResizeEnd = useCallback(
				(e: DiagramResizeEvent) => {
					// グループ内の図形のリサイズ終了イベントを伝番し、リサイズされた図形の位置を更新
					onDiagramResizeEnd?.(e);

					const { top, bottom, left, right } =
						calcGroupArrangmentOnChildDiagramEvent(items, e);

					onDiagramResizeEnd?.({
						id,
						point: {
							x: left,
							y: top,
						},
						width: right - left,
						height: bottom - top,
					});
				},
				[onDiagramResizeEnd, calcGroupArrangmentOnChildDiagramEvent, id, items],
			);

			// TODO: 共通化
			const createDiagram = (item: Diagram): React.ReactNode => {
				const itemType = DiagramTypeComponentMap[item.type];
				const props = {
					...item,
					key: item.id,
					onDiagramClick: handleChildDiagramClick,
					onDiagramDragStart: handleChildDiagramDragStart,
					onDiagramDrag: handleChildDiagramDrag,
					onDiagramDragEnd: handleChildDiagramDragEnd,
					onDiagramDragEndByGroup: onDiagramDragEndByGroup,
					onDiagramResizeStart: onDiagramResizeStart,
					onDiagramResizing: onDiagramResizing,
					onDiagramResizeEnd: handleChildDiagramResizeEnd,
					onDiagramSelect: handleChildDiagramSelect,
					ref: (r: DiagramRef) => {
						itemsRef.current[item.id] = r;
					},
				};

				return React.createElement(itemType, props);
			};

			// グループ内の図形の作成
			const children = items.map((item) => {
				return createDiagram(item);
			});

			/**
			 * このグループのリサイズ中イベントハンドラ
			 *
			 * @param {DiagramResizeEvent} e 短形領域の変更中イベント
			 */
			const handleThisGroupResize = useCallback(
				(e: DiagramResizeEvent) => {
					// グループ内の図形への変更中イベント作成
					const event = {
						id,
						oldPoint: point,
						oldWidth: width,
						oldHeight: height,
						newPoint: e.point,
						newWidth: e.width,
						newHeight: e.height,
						scaleX: e.width / width,
						scaleY: e.height / height,
					};
					// グループ内の図形に変更中イベントを通知
					for (const item of items) {
						if (e.id !== item.id) {
							itemsRef.current[item.id]?.onGroupResize?.(event);
						}
					}
				},
				[id, items, point, width, height],
			);

			/**
			 * このグループのリサイズ完了イベントハンドラ
			 *
			 * @param {DiagramResizeEvent} e 短形領域の変更完了イベント
			 */
			const handleThisGroupResizeEnd = useCallback(
				(e: DiagramResizeEvent) => {
					// グループ内の図形への変更完了イベント作成
					const event = {
						id,
						oldPoint: point,
						oldWidth: width,
						oldHeight: height,
						newPoint: e.point,
						newWidth: e.width,
						newHeight: e.height,
						scaleX: e.width / width,
						scaleY: e.height / height,
					};
					// グループ内の図形に変更完了イベントを通知
					for (const item of items) {
						itemsRef.current[item.id]?.onGroupResizeEnd?.(event);
					}

					// グループの枠表示用の四角形の変更完了イベントを親に伝番させて、Propsの更新を親側にしてもらう
					onDiagramResizeEnd?.(e);
				},
				[onDiagramResizeEnd, id, items, point, width, height],
			);

			return (
				<>
					{!isDragging && (
						<RectangleBase
							id={id}
							point={point}
							width={width}
							height={height}
							tabIndex={tabIndex}
							keepProportion={keepProportion}
							isSelected={isSelected}
							onDiagramResizing={handleThisGroupResize}
							onDiagramResizeEnd={handleThisGroupResizeEnd}
						/>
					)}
					{children}
				</>
			);
		},
	),
);

export default Group;
