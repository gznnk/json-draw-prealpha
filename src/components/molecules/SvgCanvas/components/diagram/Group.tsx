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
import type { Diagram, DiagramRef, GroupData } from "../../types/DiagramTypes";
import { DiagramTypeComponentMap } from "../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramResizeEvent,
	DiagramSelectEvent,
	GroupDragEvent,
	GroupResizeEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import type { RectangleBaseProps } from "../core/RectangleBase";
import RectangleBase from "../core/RectangleBase";

// SvgCanvas関連関数をインポート
import { isGroupData } from "../../SvgCanvasFunctions";

// RectangleBase関連関数をインポート
import {
	calcArrangmentOnGroupResize,
	calcPointOnGroupDrag,
} from "../core/RectangleBase/RectangleBaseFunctions";

// ユーティリティをインポート
import { getLogger } from "../../../../../utils/Logger";

// ロガーを取得
const logger = getLogger("Group");

/**
 * 選択されたグループ内の図形を、配下のグループも含めて再帰的に取得する
 *
 * @param {Diagram[]} diagrams 図形リスト
 * @returns {string | undefined} 選択されたグループ内の図形
 */
const getSelectedChildDiagram = (diagrams: Diagram[]): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (diagram.isSelected) {
			return diagram;
		}
		if (isGroupData(diagram)) {
			const ret = getSelectedChildDiagram(diagram.items || []);
			if (ret) {
				return ret;
			}
		}
	}
};

/**
 * グループ内の図形のリサイズイベントに伴うグループの変更後の配置の計算する
 *
 * @param {Diagram[]} items グループ内の図形リスト
 * @param {DiagramResizeEvent} e 図形リサイズイベント
 * @returns {Object} グループの変更後の配置
 */
const calcGroupArrangmentOnChildDiagramResizeEvent = (
	items: Diagram[],
	e: DiagramResizeEvent,
) => {
	// グループ内の図形を再帰的に取得し、グループの四辺の座標を計算する
	let top = Number.POSITIVE_INFINITY;
	let left = Number.POSITIVE_INFINITY;
	let bottom = Number.NEGATIVE_INFINITY;
	let right = Number.NEGATIVE_INFINITY;
	for (const item of items) {
		if (e.id !== item.id) {
			if (isGroupData(item)) {
				const groupArrangment = calcGroupArrangmentOnChildDiagramResizeEvent(
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
};

/**
 * グループのPropsの型定義
 *
 * @type {Object} GroupProps
 * @property {string} [id] ID
 * @property {Point} [point] 左上の頂点の座標
 * @property {number} [width] 幅
 * @property {number} [height] 高さ
 * @property {boolean} [keepProportion] アスペクト比を保持するかどうか
 * @property {boolean} [isSelected] 選択されているかどうか
 * @property {(e: DiagramClickEvent) => void} [onDiagramClick] グループ内の図形のクリック時のイベントハンドラ
 * @property {(e: DiagramResizeEvent) => void} [onDiagramResizeStart] グループ・グループ内の図形のリサイズ開始時のイベントハンドラ
 * @property {(e: DiagramResizeEvent) => void} [onDiagramResizing] グループ・グループ内の図形のリサイズ中のイベントハンドラ
 * @property {(e: DiagramResizeEvent) => void} [onDiagramResizeEnd] グループ・グループ内の図形のリサイズ終了時のイベントハンドラ
 * @property {(e: DiagramDragEvent) => void} [onDiagramDragStart] グループ内の図形のドラッグ開始時のイベントハンドラ（グループのドラッグはグループ内の図形のドラッグに連動して行わせるため、グループ自体のドラッグ時は存在しない）
 * @property {(e: DiagramDragEvent) => void} [onDiagramDrag] グループ内の図形のドラッグ中のイベントハンドラ（グループのドラッグはグループ内の図形のドラッグに連動して行わせるため、グループ自体のドラッグ時は存在しない）
 * @property {(e: DiagramDragEvent) => void} [onDiagramDragEnd] グループ内の図形のドラッグ終了時のイベントハンドラ（グループのドラッグはグループ内の図形のドラッグに連動して行わせるため、グループ自体のドラッグ時は存在しない）
 * @property {(e: DiagramDragEvent) => void} [onDiagramDragEndByGroup] グループ全体の移動に伴うグループ内の図形のドラッグ終了時のイベントハンドラ
 * @property {(e: DiagramSelectEvent) => void} [onSelect] 選択時のイベントハンドラ
 * @property {Diagram[]} [items] グループ内の図形リスト
 * @property {React.Ref<DiagramRef>} [ref] 親グループのドラッグ・リサイズ時に、親グループ側から実行してもらう関数への参照
 */
export type GroupProps = RectangleBaseProps & GroupData;

/**
 * グループコンポーネント
 */
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
			// グループ全体のドラッグ中かどうかのフラグ（このグループが選択中でかつドラッグ中の場合のみtrueにする）
			const [isDragging, setIsDragging] = useState(false);
			// グループ連続選択フラグ。グループ連続選択とは、グループ内の図形（同じ図形でなくてよい）を連続して選択する操作のこと。
			// このグループが選択中でかつ再度グループ内の図形でポインター押下された場合のみtrueにする
			const [isSequentialSelection, setIsSequentialSelection] = useState(false);

			// --- 以下、図形選択関連処理 ---

			/**
			 * グループ内の図形の選択イベントハンドラ
			 *
			 * @param {DiagramSelectEvent} e 図形選択イベント
			 * @returns {void}
			 */
			const handleChildDiagramSelect = useCallback(
				(e: DiagramSelectEvent) => {
					const selectedChild = getSelectedChildDiagram(items);
					if (!selectedChild) {
						// グループ内の図形が選択されていない場合は、このグループの選択イベントを発火させる。
						// これにより、グループ内の図形が選択されていないグループのうち、最も上位のグループのイベントが
						// SvgCanvasまで伝番され、そのグループが選択状態になる。
						onDiagramSelect?.({
							id,
						});
					} else if (selectedChild.id !== e.id) {
						// グループ内の図形が選択されていて、かつグループ内の別の図形が選択された場合、その図形を選択状態にする
						onDiagramSelect?.(e);
					}

					if (isSelected) {
						// グループ連続選択時のクリック（ポインターアップ）時に、グループ内でクリックされた図形を選択状態にしたいので、
						// フラグを立てておき、クリックイベント側で参照する。
						setIsSequentialSelection(true);
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
					if (isSequentialSelection) {
						// グループ連続選択時のクリック（ポインターアップ）時であれば、そのグループ内の図形を選択状態にする。
						// これにより、グループがネストしている場合は、選択の階層が１つずつ下がっていき、最終的にクリックされた図形が選択される。
						onDiagramSelect?.(e);
						setIsSequentialSelection(false);
					} else {
						// グループ連続選択時でない場合は、このグループのクリックイベントを発火させる。
						// これにより、連続選択でないグループのうち、最も上位のグループのクリックイベントが
						// 連続選択されたグループまで伝番し、そのグループの連続選択時の処理（当該分岐のtrue側）が実行され、
						// その直下のグループが選択状態になる。
						onDiagramClick?.({
							id,
						});
					}
				},
				[onDiagramSelect, onDiagramClick, isSequentialSelection, id],
			);

			useEffect(() => {
				// グループから選択が外れたら連続選択フラグも解除
				if (!isSelected) {
					setIsSequentialSelection(false);
				}
			}, [isSelected]);

			// --- 以下、親グループの変更関連処理 ---

			// 親グループのドラッグ・リサイズ時に、親グループ側から実行してもらう関数を公開
			useImperativeHandle(ref, () => ({
				onGroupDrag: handleParentGroupDrag,
				onGroupDragEnd: handleParentGroupDragEnd,
				onGroupResize: onParentGroupResize,
				onGroupResizeEnd: onParentGroupResizeEnd,
			}));

			// グループ内の各図形の関数の参照を保持するRef作成
			const diagramsFunctionsRef = useRef<{
				[key: string]: DiagramRef | undefined;
			}>({});

			/**
			 * 親グループのドラッグ中イベントハンドラ
			 *
			 * @param {GroupDragEvent} e グループのドラッグ中イベント
			 * @returns {void}
			 */
			const handleParentGroupDrag = useCallback(
				(e: GroupDragEvent) => {
					// 親グループのドラッグに伴う、このグループの移動後の座標を計算
					const endPoint = calcPointOnGroupDrag(e, point);

					// 親グループのドラッグに伴うこのグループの移動後の座標を、グループ内の図形にドラッグ中イベントとして通知。
					// グループがネストしている場合は、再帰的にonGroupDrag関数が呼ばれ、グループ内のすべての図形が移動する。
					// なお、ドラッグ中イベント内では、DOMを直接操作して移動の描画を行うので、SvgCanvasへの変更通知は行わない。
					for (const item of items) {
						diagramsFunctionsRef.current[item.id]?.onGroupDrag?.({
							id,
							startPoint: point,
							endPoint,
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
					// 親グループのドラッグ完了に伴う、このグループの移動後の座標を計算
					const endPoint = calcPointOnGroupDrag(e, point);

					// 親グループのドラッグ完了に伴うこのグループの移動後の座標を、グループ内の図形にドラッグ完了イベントとして通知。
					// グループがネストしている場合は、再帰的にonGroupDragEnd関数が呼ばれ、グループ内のすべての図形が移動する。
					// なお、グループ内の図形の座標変更は、グループ内の図形側でのonDiagramDragEndByGroup関数の実行により
					// SvgCanvasへ通知が行われるため、ここでは変更通知は行わない。
					for (const item of items) {
						diagramsFunctionsRef.current[item.id]?.onGroupDragEnd?.({
							id,
							startPoint: point,
							endPoint,
						});
					}

					// グループ自身の座標変更をSvgCanvasへ通知するためにイベント発火。
					// グループのドラッグ完了はグループ内の図形のonDiagramDragEndの発火がトリガーになり、それがグループのhandleChildDiagramDragEnd関数でハンドルされ、
					// そのグループ内の図形のonGroupDragEnd関数を呼び出すことによりグループ内の図形へ伝番させるため、onDiagramDragEndを再度発火するとグループ間で処理がループする。
					// それを回避するため、グループ側でハンドルされず、そのままSvgCanvasまでイベントが伝番されるonDiagramDragEndByGroupを使用する。
					onDiagramDragEndByGroup?.({
						id,
						startPoint: point,
						endPoint: endPoint,
					});
				},
				[onDiagramDragEndByGroup, id, point, items],
			);

			/**
			 * 親グループのリサイズ中イベントハンドラ
			 *
			 * @param {GroupResizeEvent} e 親図形のリサイズ中イベント
			 */
			const onParentGroupResize = useCallback(
				(e: GroupResizeEvent) => {
					// 親グループのリサイズに伴うこのグループのリサイズ後の座標とサイズを計算
					const newArrangment = calcArrangmentOnGroupResize(
						e,
						point,
						width,
						height,
					);

					// リサイズ中イベント作成
					const event = {
						id,
						startSize: {
							point,
							width,
							height,
						},
						endSize: newArrangment,
					};

					// グループ内の図形にリサイズ中イベントを通知し、グループ内の図形もリサイズさせる
					// グループがネストしている場合は、再帰的にonGroupResize関数が呼ばれ、グループ内のすべての図形がリサイズする。
					for (const item of items) {
						diagramsFunctionsRef.current[item.id]?.onGroupResize?.(event);
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
					// 親グループのリサイズに伴うこのグループのリサイズ後の座標とサイズを計算
					const newArrangment = calcArrangmentOnGroupResize(
						e,
						point,
						width,
						height,
					);

					// リサイズ完了イベント作成
					const event = {
						id,
						startSize: {
							point,
							width,
							height,
						},
						endSize: newArrangment,
					};

					// グループ内の図形にリサイズ完了イベントを通知し、グループ内の図形もリサイズさせる。
					// グループがネストしている場合は、再帰的にonGroupResizeEnd関数が呼ばれ、グループ内のすべての図形がリサイズする。
					for (const item of items) {
						diagramsFunctionsRef.current[item.id]?.onGroupResizeEnd?.(event);
					}

					// グループのリサイズに伴うこのグループのサイズ変更を親に通知し、SvgCanvasまで変更を伝番してもらう
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

					// ドラッグ開始イベントをそのまま伝番させる
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

					const dx = e.endPoint.x - e.startPoint.x;
					const dy = e.endPoint.y - e.startPoint.y;

					// グループ内の図形にドラッグ中イベントを通知し、同じグループ内の図形も移動させる
					for (const item of items) {
						if (e.id !== item.id) {
							diagramsFunctionsRef.current[item.id]?.onGroupDrag?.({
								id,
								startPoint: point,
								endPoint: {
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
			 * グループ内の図形のドラッグ終了イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e 図形ドラッグ終了イベント
			 */
			const handleChildDiagramDragEnd = useCallback(
				(e: DiagramDragEvent) => {
					// グループ内の図形のドラッグ終了イベントを伝番し、ドラッグされた図形の位置を更新
					onDiagramDragEnd?.(e);

					// グループ全体のドラッグでない場合、その図形の位置変更によるグループの配置を更新する
					const selectedDiagram = getSelectedChildDiagram(items);
					const isNotGroupDrag = !isDragging && selectedDiagram;
					if (isNotGroupDrag) {
						// リサイズイベントに変換して、リサイズ時の配置計算処理を利用
						const resizeEvent = {
							id: e.id,
							point: e.endPoint,
							width: selectedDiagram.width,
							height: selectedDiagram.height,
						};
						const { top, bottom, left, right } =
							calcGroupArrangmentOnChildDiagramResizeEvent(items, resizeEvent);

						// グループ内の図形のドラッグに伴うこのグループのサイズ変更を発火させる。
						// 最終的にSvgCanvasまでイベントが伝番され、グループのサイズ変更が行われる。
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

					const dx = e.endPoint.x - e.startPoint.x;
					const dy = e.endPoint.y - e.startPoint.y;

					// グループ内の図形にドラッグ完了イベントを通知し、同じグループ内の図形を移動させる
					for (const item of items) {
						if (e.id !== item.id) {
							diagramsFunctionsRef.current[item.id]?.onGroupDragEnd?.({
								id,
								startPoint: point,
								endPoint: {
									x: point.x + dx,
									y: point.y + dy,
								},
							});
						}
					}

					// グループ自体の位置変更のイベントを発火させる。
					// 最終的にSvgCanvasまでイベントが伝番され、グループのサイズ変更が行われる。
					onDiagramDragEnd?.({
						id,
						startPoint: point,
						endPoint: {
							x: point.x + dx,
							y: point.y + dy,
						},
					});

					setIsDragging(false);
				},
				[onDiagramDragEnd, onDiagramResizeEnd, isDragging, id, point, items],
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
						calcGroupArrangmentOnChildDiagramResizeEvent(items, e);

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
				[onDiagramResizeEnd, id, items],
			);

			// グループ内の図形の作成
			const children = items.map((item) => {
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
						diagramsFunctionsRef.current[item.id] = r;
					},
				};

				return React.createElement(itemType, props);
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
						startSize: {
							point,
							width,
							height,
						},
						endSize: e,
					};

					// グループ内の図形に変更中イベントを通知
					for (const item of items) {
						if (e.id !== item.id) {
							diagramsFunctionsRef.current[item.id]?.onGroupResize?.(event);
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
						startSize: {
							point,
							width,
							height,
						},
						endSize: e,
					};
					// グループ内の図形に変更完了イベントを通知
					for (const item of items) {
						diagramsFunctionsRef.current[item.id]?.onGroupResizeEnd?.(event);
					}

					// グループの枠表示用の四角形の変更完了イベントを親に伝番させる。
					// 最終的にSvgCanvasまでイベントが伝番され、グループのサイズ変更が行われる。
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
							onDiagramResizeStart={onDiagramResizeStart}
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
