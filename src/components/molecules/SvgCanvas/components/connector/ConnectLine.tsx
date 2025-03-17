// Reactのインポート
import type React from "react";
import { memo, useEffect, useRef, useContext } from "react";

// SvgCanvas関連コンポーネントをインポート
import {
	createBestConnectPath,
	getLineDirection,
	EVENT_NAME_CONNECT_POINT_MOVE,
} from "../connector/ConnectPoint";
import type { Direction } from "../connector/ConnectPoint";
import Path from "../diagram/Path";
import { SvgCanvasContext } from "../../SvgCanvas";

// SvgCanvas関連型定義をインポート
import type {
	CreateDiagramProps,
	Diagram,
	ConnectLineData,
} from "../../types/DiagramTypes";
import type { ConnectPointMoveEvent } from "../../types/EventTypes";

// SvgCanvas関連関数をインポート
import { calcRadians, radiansToDegrees } from "../../functions/Math";
import { isShape, newId } from "../../functions/Diagram";

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
	onDragStart,
	onDrag,
	onDragEnd,
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
	const startItems = useRef(items);
	// 移動開始時の接続ポイントの向き
	const startDirection = useRef<Direction>("up");
	// 垂直と水平の線のみかどうか
	const isVerticalHorizontalLines = useRef<boolean>(true);
	// 一番最初の描画時からitemsが変更されているかどうか
	const isItemsChanged = useRef<boolean>(false);
	// SvgCanvasの状態プロバイダ
	const canvasStateProvider = useContext(SvgCanvasContext);

	// 接続ポイント移動イベントハンドラ
	// ハンドラ登録の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		_id: id,
		_items: items,
		_startOwnerId: startOwnerId,
		_endOwnerId: endOwnerId,
		_onItemableChange: onItemableChange,
		_canvasStateProvider: canvasStateProvider,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		const handleConnectPointMove = (e: Event) => {
			const {
				_id,
				_items,
				_startOwnerId,
				_endOwnerId,
				_onItemableChange,
				_canvasStateProvider,
			} = refBus.current;

			const event = (e as CustomEvent<ConnectPointMoveEvent>).detail;

			// 関係ない接続ポイントの移動イベントは無視
			if (_items.every((item) => item.id !== event.id)) {
				return;
			}

			if (event.type === "moveStart") {
				// 移動開始時のitemsを保持
				startItems.current = _items;

				// 移動開始時の接続ポイントの向きを保持
				startDirection.current = getLineDirection(
					event.ownerShape.x,
					event.ownerShape.y,
					event.x,
					event.y,
				);

				// 垂直と水平の線のみかどうかを判定
				isVerticalHorizontalLines.current = _items.every((item, idx) => {
					if (idx === 0) {
						return true;
					}

					const prev = _items[idx - 1];
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
			const _startItems = startItems.current;
			const _isItemsChanged = isItemsChanged.current;
			const _isVerticalHorizontalLines = isVerticalHorizontalLines.current;
			const foundIdx = _startItems.findIndex((item) => item.id === event.id);
			if (0 <= foundIdx) {
				if (_isItemsChanged) {
					// 一番最初の描画時からitemsが変更されている場合は、
					// 接続ポイントとその隣の点のみ位置を変更する
					const p = _startItems[foundIdx];
					const dx = event.x - p.x;
					const dy = event.y - p.y;
					const newItems = _startItems.map((item, idx) => {
						// 接続ポイントの移動にあわせて接続線側の点を移動
						if (item.id === event.id) {
							return { ...item, x: event.x, y: event.y };
						}

						// 移動した点の隣の点かどうか
						const isNextPoint =
							(foundIdx === 0 && idx === 1) ||
							(foundIdx === _startItems.length - 1 &&
								idx === _startItems.length - 2);

						if (isNextPoint) {
							// 接続線が垂直と水平の線のみでない場合は、２番目の点はそのまま
							if (!_isVerticalHorizontalLines) {
								return item;
							}

							// 接続線が垂直と水平の線のみは、それが維持されるよう２番目の点も移動する

							// ２点間の角度を計算
							const direction = calcRadians(p.x, p.y, item.x, item.y);
							const degrees = radiansToDegrees(direction);
							const isVertical = (degrees + 405) % 180 > 90;

							// ２点間の線が水平であればx座標のみ、垂直であればy座標のみ移動
							return {
								...item,
								x: !isVertical ? item.x + dx : item.x,
								y: isVertical ? item.y + dy : item.y,
							};
						}

						return item;
					}) as Diagram[];

					// 子図形の変更イベントを発火
					_onItemableChange?.({
						id: _id,
						items: newItems,
					});
				} else {
					// 一番最初の描画時からitemsが変更されていない場合は、最適な接続線を再計算

					// 動いた接続ポイントの反対側の点を取得
					const lastIdx = _startItems.length - 1;
					const oppositePoint =
						foundIdx === 0 ? _startItems[lastIdx] : _startItems[0];

					// 反対側の図形の情報を取得
					const oppositeOwnerShape = _canvasStateProvider?.getDiagramById(
						event.ownerId === _startOwnerId ? _endOwnerId : _startOwnerId,
					);

					// 型チェック（以降の処理で型エラーが出ないようにするためだけ）
					if (!isShape(oppositeOwnerShape)) {
						return;
					}

					// 最適な接続線を再計算
					const newPath = createBestConnectPath(
						event.x,
						event.y,
						startDirection.current,
						event.ownerShape,
						oppositePoint.x,
						oppositePoint.y,
						oppositeOwnerShape,
					);

					// 接続線の点のデータを作成
					const newItems = (foundIdx === 0 ? newPath : newPath.reverse()).map(
						(p, idx) => ({
							id: event.type === "moveEnd" ? newId() : `${_id}-${idx}`,
							name: `cp-${idx}`,
							type: "PathPoint",
							x: p.x,
							y: p.y,
						}),
					) as Diagram[];
					// 両端の点のIDは維持する
					newItems[0].id = _startItems[0].id;
					newItems[newItems.length - 1].id = _startItems[lastIdx].id;

					// 子図形の変更イベントを発火
					_onItemableChange?.({
						id: _id,
						items: newItems,
					});

					if (event.type === "moveEnd") {
						startItems.current = [];
						if (!_isItemsChanged) {
							// 一番最初の描画時からitemsが変更されていない場合は、
							// 再計算後の接続線を初期状態として保持
							initialItems.current = newItems;
						}
					}
				}
			}
		};
		document.addEventListener(
			EVENT_NAME_CONNECT_POINT_MOVE,
			handleConnectPointMove,
		);

		return () => {
			document.removeEventListener(
				EVENT_NAME_CONNECT_POINT_MOVE,
				handleConnectPointMove,
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
			dragEnabled={false}
			transformEnabled={false}
			segmentDragEnabled={true}
			newVertexEnabled={true}
			onClick={onClick}
			onDragStart={onDragStart}
			onDrag={onDrag}
			onDragEnd={onDragEnd}
			onSelect={onSelect}
			onTransform={onTransform}
			onItemableChange={onItemableChange}
			items={items}
		/>
	);
};

export default memo(ConnectLine);
