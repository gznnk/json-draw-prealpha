// Reactのインポート
import type React from "react";
import { memo, useContext, useEffect, useRef } from "react";

// SvgCanvas関連コンポーネントをインポート
import { SvgCanvasContext } from "../../SvgCanvas";
import type { Direction } from "../connector/ConnectPoint";
import {
	createBestConnectPath,
	getLineDirection,
} from "../connector/ConnectPoint";
import Path from "../diagram/Path";

// SvgCanvas関連型定義をインポート
import type {
	ConnectLineData,
	CreateDiagramProps,
	Diagram,
	Shape,
} from "../../types/DiagramTypes";
import type {
	ConnectPointMoveData,
	ConnectPointsMoveEvent,
} from "../../types/EventTypes";

// SvgCanvas関連関数をインポート
import { newId } from "../../functions/Diagram";
import { calcRadians, radiansToDegrees } from "../../functions/Math";

/** 接続ポイント移動イベントの名前 */
export const EVENT_NAME_CONNECT_POINTS_MOVE = "ConnectPointMove";

/**
 * 接続ポイント移動イベントを発火する
 *
 * @param id 接続ポイントID
 * @param point 移動先座標
 */
export const notifyConnectPointsMove = (e: ConnectPointsMoveEvent) => {
	document.dispatchEvent(
		new CustomEvent(EVENT_NAME_CONNECT_POINTS_MOVE, {
			detail: e,
		}),
	);
};

/**
 * 接続線コンポーネントのプロパティ
 */
type ConnectLineProps = CreateDiagramProps<
	ConnectLineData,
	{
		selectable: true;
		transformative: true;
		itemable: true;
	}
>;

/**
 * 接続線コンポーネント
 */
const ConnectLine: React.FC<ConnectLineProps> = ({
	id,
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	stroke = "black",
	strokeWidth = "1px",
	isSelected = false,
	onClick,
	onDrag,
	onSelect,
	onTransform,
	onItemableChange,
	items = [],
	startOwnerId,
	endOwnerId,
}) => {
	// 一番最初の描画時のitems
	const initialItems = useRef(items);
	// 移動開始時のitems
	const startItems = useRef<Diagram[]>([]);
	// 移動開始時の接続ポイントの向き
	const startDirection = useRef<Direction>("up");
	// 垂直と水平の線のみかどうか
	const isVerticalHorizontalLines = useRef<boolean>(true);
	// 一番最初の描画時からitemsが変更されているかどうか
	const isItemsChanged = useRef<boolean>(false);
	// SvgCanvasの状態プロバイダ
	const canvasStateProvider = useContext(SvgCanvasContext);

	// 接続ポイント移動イベントハンドラ
	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		id,
		items,
		startOwnerId,
		endOwnerId,
		onItemableChange,
		canvasStateProvider,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		const handleConnectPointsMove = (e: Event) => {
			// refBusを介して参照値を取得
			const {
				id,
				items,
				startOwnerId,
				endOwnerId,
				onItemableChange,
				canvasStateProvider,
			} = refBus.current;

			const event = (e as CustomEvent<ConnectPointsMoveEvent>).detail;

			// イベントの中からこの接続線に対応する接続ポイントを取得
			const movedPoint = event.points.find((p) =>
				items.some((item) => item.id === p.id),
			);
			if (!movedPoint) {
				// 関係ない接続ポイントの移動イベントは無視
				return;
			}

			if (event.eventType === "Start") {
				// 移動開始時のitemsを保持
				startItems.current = items;

				// 移動開始時の接続ポイントの向きを保持
				startDirection.current = getLineDirection(
					movedPoint.ownerShape.x,
					movedPoint.ownerShape.y,
					movedPoint.x,
					movedPoint.y,
				);

				// 垂直と水平の線のみかどうかを判定
				isVerticalHorizontalLines.current = items.every((item, idx) => {
					if (idx === 0) {
						return true;
					}

					const prev = items[idx - 1];
					const degrees = radiansToDegrees(
						calcRadians(prev.x, prev.y, item.x, item.y),
					);
					return degrees % 90 === 0;
				});

				// 一番最初の描画時からitemsが変更されているかどうかを判定
				isItemsChanged.current =
					initialItems.current.length !== startItems.current.length ||
					initialItems.current.some(
						(item, idx) =>
							item.id !== startItems.current[idx].id ||
							item.x !== startItems.current[idx].x ||
							item.y !== startItems.current[idx].y,
					);
				return;
			}

			// 移動中と移動終了時の処理
			if (startItems.current.length === 0) {
				// 移動開始時のitemsがない場合は何もしない
				// フェイルセーフの処理で、ここにくる場合はバグ
				console.error("Illegal state: startItems is empty.");
				return;
			}

			const _startItems = startItems.current;
			const _isItemsChanged = isItemsChanged.current;
			const _isVerticalHorizontalLines = isVerticalHorizontalLines.current;
			const movedPointIdx = _startItems.findIndex(
				(item) => item.id === movedPoint.id,
			);

			// 動いた接続ポイントの反対側の点を取得
			const oppositeItem =
				movedPointIdx === 0 ? items[items.length - 1] : items[0];
			let oppositePoint = {
				x: oppositeItem.x,
				y: oppositeItem.y,
			};

			// 反対側の点も動いているかどうかを確認
			const movedOppositPoint = event.points.find(
				(p) => p.id === oppositeItem.id,
			);

			if (_isItemsChanged) {
				// 一番最初の描画時からitemsが変更されている場合

				// 移動後のポイント作成関数
				const createNewPoint = (
					movedBothEndsPoint: ConnectPointMoveData,
					oldPoint: Diagram,
					idx: number,
				) => {
					// 接続ポイントの移動にあわせて末端の点も移動
					if (oldPoint.id === movedBothEndsPoint.id) {
						return {
							...oldPoint,
							x: movedBothEndsPoint.x,
							y: movedBothEndsPoint.y,
						};
					}

					// 移動した点の隣の点かどうか TODO: 反対の点の時の判定がうまくいかん
					const movedBothEndsPointIdx = _startItems.findIndex(
						(item) => item.id === movedBothEndsPoint.id,
					);
					const isNextPoint =
						(movedBothEndsPointIdx === 0 && idx === 1) ||
						(movedBothEndsPointIdx === _startItems.length - 1 &&
							idx === _startItems.length - 2);

					if (isNextPoint) {
						// 接続線が垂直と水平の線のみでない場合は、２番目の点はそのまま
						if (!_isVerticalHorizontalLines) {
							return oldPoint;
						}

						// 接続線が垂直と水平の線のみは、それが維持されるよう２番目の点も移動する

						// 移動量を計算
						const movedPointOldData = _startItems[movedBothEndsPointIdx];
						const dx = movedBothEndsPoint.x - movedPointOldData.x;
						const dy = movedBothEndsPoint.y - movedPointOldData.y;

						// ２点間の角度を計算
						const direction = calcRadians(
							movedPointOldData.x,
							movedPointOldData.y,
							oldPoint.x,
							oldPoint.y,
						);
						const degrees = radiansToDegrees(direction);
						const isVertical = (degrees + 405) % 180 > 90;

						// ２点間の線が水平であればx座標のみ、垂直であればy座標のみ移動
						return {
							...oldPoint,
							x: !isVertical ? oldPoint.x + dx : oldPoint.x,
							y: isVertical ? oldPoint.y + dy : oldPoint.y,
						};
					}

					return oldPoint;
				};

				const newItems = _startItems.map((item, idx) => {
					const newPoint = createNewPoint(movedPoint, item, idx);
					if (newPoint !== item) {
						return newPoint;
					}
					if (movedOppositPoint) {
						return createNewPoint(movedOppositPoint, item, idx);
					}
					return item;
				}) as Diagram[];

				// 接続線の変更イベントを発火
				onItemableChange?.({
					eventType: event.eventType,
					id,
					items: newItems,
				});
			} else {
				// 一番最初の描画時からitemsが変更されていない場合は、最適な接続線を再計算

				if (movedOppositPoint) {
					// 反対側の点が動いている場合は、その座標を利用
					oppositePoint = movedOppositPoint;
				}

				// 反対側の図形の情報を取得
				let oppositeOwnerShape: Shape;
				if (movedOppositPoint) {
					oppositeOwnerShape = movedOppositPoint.ownerShape;
				} else {
					// 反対側の図形が動いていない場合はcanvasStateProviderから情報を取得（１フレーム前の情報しか取れないが、接続先の図形に移動はない場合なので問題ない）
					oppositeOwnerShape = canvasStateProvider?.getDiagramById(
						movedPoint.ownerId === startOwnerId ? endOwnerId : startOwnerId,
					) as Shape;
				}

				// 最適な接続線を再計算
				const newPath = createBestConnectPath(
					movedPoint.x,
					movedPoint.y,
					startDirection.current,
					movedPoint.ownerShape,
					oppositePoint.x,
					oppositePoint.y,
					oppositeOwnerShape,
				);

				// 接続線の点のデータを作成
				const newItems = (
					movedPointIdx === 0 ? newPath : newPath.reverse()
				).map((p, idx) => ({
					id: event.eventType === "End" ? newId() : `${id}-${idx}`,
					name: `cp-${idx}`,
					type: "PathPoint",
					x: p.x,
					y: p.y,
				})) as Diagram[];
				// 両端の点のIDは維持する
				newItems[0].id = _startItems[0].id;
				newItems[newItems.length - 1].id =
					_startItems[_startItems.length - 1].id;

				// 接続線の変更イベントを発火
				onItemableChange?.({
					eventType: event.eventType,
					id,
					items: newItems,
				});

				if (event.eventType === "End") {
					startItems.current = [];
					if (!_isItemsChanged) {
						// 一番最初の描画時からitemsが変更されていない場合は、
						// 再計算後の接続線を初期状態として保持
						initialItems.current = newItems;
					}
				}
			}
		};
		document.addEventListener(
			EVENT_NAME_CONNECT_POINTS_MOVE,
			handleConnectPointsMove,
		);

		return () => {
			document.removeEventListener(
				EVENT_NAME_CONNECT_POINTS_MOVE,
				handleConnectPointsMove,
			);
		};
	}, []);

	return (
		<Path
			id={id}
			x={x}
			y={y}
			width={width}
			height={height}
			rotation={rotation}
			scaleX={scaleX}
			scaleY={scaleY}
			keepProportion={false}
			stroke={stroke}
			strokeWidth={strokeWidth}
			isSelected={isSelected}
			isMultiSelectSource={false}
			dragEnabled={false}
			transformEnabled={false}
			segmentDragEnabled={true}
			newVertexEnabled={true}
			fixBothEnds={true}
			onClick={onClick}
			onDrag={onDrag}
			onSelect={onSelect}
			onTransform={onTransform}
			onItemableChange={onItemableChange}
			items={items}
		/>
	);
};

export default memo(ConnectLine);
