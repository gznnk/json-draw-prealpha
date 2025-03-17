// Reactのインポート
import type React from "react";
import { memo, useEffect, useRef, useContext } from "react";

// SvgCanvas関連コンポーネントをインポート
import {
	createBestConnectPath,
	getLineDirection,
	EVENT_NAME_CONNECT_POINT_MOVE,
} from "../connector/ConnectPoint";
import Path from "../diagram/Path";
import { SvgCanvasContext } from "../../SvgCanvas";

// SvgCanvas関連型定義をインポート
import type {
	CreateDiagramProps,
	Diagram,
	ConnectLineData,
} from "../../types/DiagramTypes";
import type {
	ConnectPointMoveEvent,
	GroupDataChangeEvent,
} from "../../types/EventTypes";

// SvgCanvas関連関数をインポート
import { calcRadian, radiansToDegrees } from "../../functions/Math";
import { isShape, newId } from "../../functions/Diagram";

type ConnectLineProps = CreateDiagramProps<
	ConnectLineData,
	{
		selectable: true;
		transformative: true;
	}
> & {
	onGroupDataChange?: (e: GroupDataChangeEvent) => void; // TODO: 共通化
};

const ConnectLine: React.FC<ConnectLineProps> = ({
	id,
	point,
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
	onGroupDataChange,
	items = [],
	endOwnerId,
}) => {
	// 一番最初の描画時のitems
	const initialItems = useRef(items);
	// 移動開始時のitems
	const startItems = useRef(items);
	// 垂直と水平の線のみかどうか
	const isVerticalHorizontalLines = useRef<boolean>(true);
	// 一番最初の描画時からitemsが変更されているかどうか
	const isItemsChanged = useRef<boolean>(false);

	const canvasStateProvider = useContext(SvgCanvasContext);

	// 参照を作成
	const refBusVal = {
		_id: id,
		_items: items,
		_endOwnerId: endOwnerId,
		_onGroupDataChange: onGroupDataChange,
		_canvasStateProvider: canvasStateProvider,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		const handleConnectPointMove = (e: Event) => {
			const {
				_id,
				_items,
				_endOwnerId,
				_onGroupDataChange,
				_canvasStateProvider,
			} = refBus.current;

			const event = e as CustomEvent<ConnectPointMoveEvent>;
			const { id: movedId, point: movedPoint, type, ownerShape } = event.detail;

			if (type === "moveStart") {
				// 移動開始時のitemsを保持
				startItems.current = _items;

				// 垂直と水平の線のみかどうかを判定
				isVerticalHorizontalLines.current = _items.every((item, idx) => {
					if (idx === 0) {
						return true;
					}

					const prev = _items[idx - 1];
					const direction = calcRadian(prev.point, item.point);
					const degrees = radiansToDegrees(direction);
					return degrees % 90 === 0;
				});

				// 一番最初の描画時からitemsが変更されているかどうかを判定
				isItemsChanged.current =
					initialItems.current.length !== startItems.current.length ||
					initialItems.current.some(
						(item, idx) =>
							item.id !== startItems.current[idx].id ||
							item.point.x !== startItems.current[idx].point.x ||
							item.point.y !== startItems.current[idx].point.y,
					);
				return;
			}

			// 移動中と移動終了時の処理
			const _startItems = startItems.current;
			const _isItemsChanged = isItemsChanged.current;
			const _isVerticalHorizontalLines = isVerticalHorizontalLines.current;
			const foundIdx = _startItems.findIndex((item) => item.id === movedId);
			if (0 <= foundIdx) {
				if (_isItemsChanged) {
					// 一番最初の描画時からitemsが変更されている場合は、
					// 接続ポイントとその隣の点のみ位置を変更する
					const p = _startItems[foundIdx];
					const dx = movedPoint.x - p.point.x;
					const dy = movedPoint.y - p.point.y;
					const newItems = _startItems.map((item, idx) => {
						if (item.id === movedId) {
							return { ...item, point: movedPoint };
						}

						const mustMove =
							(foundIdx === 0 && idx === 1) ||
							(foundIdx === _startItems.length - 1 &&
								idx === _startItems.length - 2);

						if (mustMove) {
							const direction = calcRadian(p.point, item.point);
							const degrees = radiansToDegrees(direction);
							const isVertical = (degrees + 405) % 180 > 90;

							return {
								...item,
								point: {
									x:
										!isVertical && _isVerticalHorizontalLines
											? item.point.x + dx
											: item.point.x,
									y:
										isVertical && _isVerticalHorizontalLines
											? item.point.y + dy
											: item.point.y,
								},
							};
						}

						return item;
					}) as Diagram[];
					_onGroupDataChange?.({
						id: _id,
						items: newItems,
					});
				} else {
					const lastIdx = _startItems.length - 1;
					const thisSide =
						foundIdx === 0 ? _startItems[0] : _startItems[lastIdx];
					const thisSide2th =
						foundIdx === 0 ? _startItems[1] : _startItems[lastIdx];

					const thatSide =
						foundIdx === 0 ? _startItems[lastIdx] : _startItems[0];
					const thisSidedirection = getLineDirection(
						thisSide.point,
						thisSide2th.point,
					);

					const endPointOwner =
						_canvasStateProvider?.getDiagramById(_endOwnerId);
					if (!isShape(endPointOwner)) {
						return;
					}
					const endOwnerShape = {
						point: endPointOwner?.point ?? { x: 0, y: 0 },
						width: endPointOwner?.width ?? 10,
						height: endPointOwner?.height ?? 10,
						rotation: endPointOwner?.rotation ?? 0,
						scaleX: endPointOwner?.scaleX ?? 1,
						scaleY: endPointOwner?.scaleY ?? 1,
					};

					const newPath = createBestConnectPath(
						movedPoint,
						thisSidedirection,
						ownerShape,
						thatSide.point,
						endOwnerShape,
					);
					const newItems = (foundIdx === 0 ? newPath : newPath.reverse()).map(
						(p, idx) => ({
							id: type === "moveEnd" ? newId() : `${_id}-${idx}`,
							name: `cp-${idx}`,
							type: "PathPoint",
							point: p,
						}),
					) as Diagram[];
					newItems[0].id = _startItems[0].id;
					newItems[newItems.length - 1].id = _startItems[lastIdx].id;
					_onGroupDataChange?.({
						id: _id,
						items: newItems,
					});

					if (type === "moveEnd") {
						startItems.current = [];
						if (!_isItemsChanged) {
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
			point={point}
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
			onGroupDataChange={onGroupDataChange}
			items={items}
		/>
	);
};

export default memo(ConnectLine);
