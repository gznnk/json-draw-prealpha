// Import React.
import type React from "react";
import { memo, useCallback, useContext, useEffect, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../../../types/DiagramCatalog";
import type { CreateDiagramProps } from "../../../../types/DiagramTypes";
import type { Shape } from "../../../../types";
import type {
	ConnectPointMoveData,
	ConnectPointsMoveEvent,
	DiagramChangeEvent,
} from "../../../../types/EventTypes";
import type { ConnectLineData } from "../../../../types/shape";

// Import components related to SvgCanvas.
import { SvgCanvasContext } from "../../../../canvas";
import { createBestConnectPath } from "../../ConnectPoint";
import { Path } from "../../Path";

// Import functions related to SvgCanvas.
import { newId } from "../../../../utils/diagram";
import { calcRadians, radiansToDegrees } from "../../../../utils";

// Imports related to this component.
import { EVENT_NAME_CONNECT_POINTS_MOVE } from "./ConnectLineConstants";

/**
 * Props for ConnectLine component.
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
 * ConnectLine component.
 */
const ConnectLineComponent: React.FC<ConnectLineProps> = ({
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
	items = [],
	startOwnerId,
	endOwnerId,
	autoRouting,
	startArrowHead,
	endArrowHead,
	onClick,
	onSelect,
	onDiagramChange,
}) => {
	// Items of ConnectLine component at the start of the change event.
	const startItems = useRef<Diagram[]>([]);
	// Is the line only vertical or horizontal.
	const isVerticalHorizontalLines = useRef<boolean>(true);
	// SvgCanvas state provider.
	const canvasStateProvider = useContext(SvgCanvasContext);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		id,
		items,
		startOwnerId,
		endOwnerId,
		autoRouting,
		onDiagramChange,
		canvasStateProvider,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Register handler for ConnectPoint components move event.
	useEffect(() => {
		const handleConnectPointsMove = (e: Event) => {
			// Bypass references to avoid function creation in every render.
			const {
				id,
				items,
				startOwnerId,
				endOwnerId,
				autoRouting,
				onDiagramChange,
				canvasStateProvider,
			} = refBus.current;

			const event = (e as CustomEvent<ConnectPointsMoveEvent>).detail;

			// Find point data in the event that this ConnectLine component owns.
			const movedPoint = event.points.find((p) =>
				items.some((item) => item.id === p.id),
			);
			if (!movedPoint) {
				// Ignore unrelated ConnectPoint components move events.
				return;
			}

			if (event.eventType === "Start") {
				// 移動開始時のitemsを保持
				startItems.current = items;

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
			}

			// 移動中と移動終了時の処理
			if (startItems.current.length === 0) {
				// 移動開始時のitemsがない場合は何もしない
				// フェイルセーフの処理で、ここにくる場合はバグ
				console.error("Illegal state: startItems is empty.");
				return;
			}

			const _startItems = startItems.current;
			const _isVerticalHorizontalLines = isVerticalHorizontalLines.current;
			const movedPointIdx = _startItems.findIndex(
				(item) => item.id === movedPoint.id,
			);

			// 動いた接続ポイントの反対側の点を取得
			const oppositeItem =
				movedPointIdx === 0
					? _startItems[_startItems.length - 1]
					: _startItems[0];
			let oppositePoint = {
				x: oppositeItem.x,
				y: oppositeItem.y,
			};

			// 反対側の点も動いているかどうかを確認
			const movedOppositPoint = event.points.find(
				(p) => p.id === oppositeItem.id,
			);

			if (!autoRouting) {
				// 自動ルーティング無効時

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
				onDiagramChange?.({
					eventId: event.eventId,
					eventType: event.eventType,
					changeType: "Transform",
					id,
					startDiagram: {
						items: _startItems,
					},
					endDiagram: {
						items: newItems,
					},
				});
			} else {
				// 自動ルーティング有効時は、最適な接続線を再計算

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
				onDiagramChange?.({
					eventId: event.eventId,
					eventType: event.eventType,
					changeType: "Transform",
					id,
					startDiagram: {
						items: _startItems,
					},
					endDiagram: {
						items: newItems,
					},
				});

				if (event.eventType === "End") {
					startItems.current = [];
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

	/**
	 * Handle Path component change event.
	 */
	const handlePathChange = useCallback((e: DiagramChangeEvent) => {
		refBus.current.onDiagramChange?.({
			...e,
			endDiagram: {
				...e.endDiagram,
				autoRouting: false,
			},
		});
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
			rightAngleSegmentDrag={true}
			newVertexEnabled={true}
			fixBothEnds={true}
			startArrowHead={startArrowHead}
			endArrowHead={endArrowHead}
			items={items}
			onClick={onClick}
			onSelect={onSelect}
			onDiagramChange={handlePathChange}
		/>
	);
};

export const ConnectLine = memo(ConnectLineComponent);
