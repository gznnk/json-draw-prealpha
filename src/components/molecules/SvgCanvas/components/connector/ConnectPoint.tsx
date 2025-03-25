// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Box, Point } from "../../types/CoordinateTypes";
import type {
	ConnectPointData,
	CreateDiagramProps,
	Diagram,
	PathPointData,
	Shape,
} from "../../types/DiagramTypes";
import type {
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramHoverEvent,
} from "../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import DragPoint from "../core/DragPoint";
import Path from "../diagram/Path";

// SvgCanvas関連関数をインポート
import {
	calcDistance,
	calcRadians,
	calcRectangleOuterBox,
	closer,
	isLineIntersectingBox,
	lineIntersects,
	radiansToDegrees,
} from "../../functions/Math";
import { newId } from "../../functions/Diagram";

/** 図形と接続線のマージン */
const CONNECT_LINE_MARGIN = 20;

/** 接続イベントの名前 */
const EVENT_NAME_CONNECTTION = "Connection";

/**
 * 接続ポイントの方向
 */
export type Direction = "up" | "down" | "left" | "right";

/**
 * 接続ポイントプロパティ
 */
type ConnectPointProps = CreateDiagramProps<
	ConnectPointData,
	{ connectable: true }
> & {
	ownerId: string;
	ownerShape: Shape; // memo化して渡すこと
	isTransparent: boolean;
	onConnect?: (e: DiagramConnectEvent) => void;
};

/**
 * 接続ポイントコンポーネント
 */
const ConnectPoint: React.FC<ConnectPointProps> = ({
	id,
	x,
	y,
	ownerId,
	ownerShape,
	isTransparent,
	onConnect,
}) => {
	// ホバー状態の管理
	const [isHovered, setIsHovered] = useState(false);
	// ドラッグ状態の管理
	const [isDragging, setIsDragging] = useState(false);
	// 接続線の座標
	const [pathPoints, setPathPoints] = useState<PathPointData[]>([]);
	// 接続中のポイント
	const connectingPoint = useRef<ConnectingPoint | undefined>(undefined);
	// 接続ポイントの所有者の外接矩形
	const ownerOuterBox = calcRectangleOuterBox(ownerShape);
	// 接続ポイントの方向
	const direction = getLineDirection(ownerShape.x, ownerShape.y, x, y);

	/**
	 * 接続線の座標を更新
	 */
	const updatePathPoints = (dragX: number, dragY: number) => {
		let newPoints: Point[] = [];

		if (!connectingPoint.current) {
			// ドラッグ中の接続線
			newPoints = createConnectPathOnDrag(
				x,
				y,
				direction,
				ownerOuterBox,
				dragX,
				dragY,
			);
		} else {
			// 接続中のポイントがある場合の接続線
			newPoints = createBestConnectPath(
				x,
				y,
				direction,
				ownerShape,
				connectingPoint.current.x, // 接続先のX座標
				connectingPoint.current.y, // 接続先のY座標
				connectingPoint.current.ownerShape, // 接続先の所有者の形状
			);
		}

		const newPathPoints = newPoints.map(
			(p, i) =>
				({
					id: `${id}-${i}`, // 仮のIDを付与
					x: p.x,
					y: p.y,
				}) as PathPointData,
		);

		setPathPoints(newPathPoints);
	};

	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		// プロパティ
		id,
		x,
		y,
		ownerId,
		ownerShape,
		onConnect,
		// 内部変数・内部関数
		pathPoints,
		updatePathPoints,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * 接続ポイントのドラッグイベントハンドラ
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		if (e.eventType === "Start") {
			setIsDragging(true);
		}

		if (connectingPoint.current) {
			// 接続中のポイントがある場合は、そのポイントを終点とする
			return;
		}

		// 接続線の座標を再計算
		refBus.current.updatePathPoints(e.endX, e.endY);

		if (e.eventType === "End") {
			setPathPoints([]);
			setIsDragging(false);
		}
	}, []);

	/**
	 * この接続ポイントの上に要素が乗った時のイベントハンドラ
	 */
	const handleDragOver = useCallback((e: DiagramDragDropEvent) => {
		if (e.dropItem.type === "ConnectPoint") {
			setIsHovered(true);

			const { id, x, y, ownerId, ownerShape } = refBus.current;

			// 接続元に情報を送信
			document.dispatchEvent(
				new CustomEvent(EVENT_NAME_CONNECTTION, {
					detail: {
						type: "connecting",
						startPointId: e.dropItem.id,
						startX: e.dropItem.x,
						startY: e.dropItem.y,
						endPointId: id,
						endX: x,
						endY: y,
						endOwnerId: ownerId,
						endOwnerShape: ownerShape,
					},
				}),
			);
		}
	}, []);

	/**
	 * この接続ポイントの上から要素が外れた時のイベントハンドラ
	 */
	const handleDragLeave = useCallback((e: DiagramDragDropEvent) => {
		setIsHovered(false);
		// 接続が切れた時の処理
		if (e.dropItem.type === "ConnectPoint") {
			const { id, x, y, ownerId, ownerShape } = refBus.current;

			// 接続元に情報を送信
			document.dispatchEvent(
				new CustomEvent(EVENT_NAME_CONNECTTION, {
					detail: {
						type: "disconnect",
						startPointId: e.dropItem.id,
						startX: e.dropItem.x,
						startY: e.dropItem.y,
						endPointId: id,
						endX: x,
						endY: y,
						endOwnerId: ownerId,
						endOwnerShape: ownerShape,
					},
				}),
			);
		}
	}, []);

	/**
	 * この接続ポイントに要素がドロップされた時のイベントハンドラ
	 */
	const handleDrop = useCallback((e: DiagramDragDropEvent) => {
		// ドロップされたときの処理
		if (e.dropItem.type === "ConnectPoint") {
			const { id, x, y, ownerId, ownerShape } = refBus.current;

			// 接続元に情報を送信
			document.dispatchEvent(
				new CustomEvent(EVENT_NAME_CONNECTTION, {
					detail: {
						type: "connect",
						startPointId: e.dropItem.id,
						startX: e.dropItem.x,
						startY: e.dropItem.y,
						endPointId: id,
						endX: x,
						endY: y,
						endOwnerId: ownerId,
						endOwnerShape: ownerShape,
					},
				}),
			);
		}
		setIsHovered(false);
	}, []);

	/**
	 * ホバー状態変更イベントハンドラ
	 *
	 * @param {DiagramHoverEvent} e ホバー状態変更イベント
	 * @returns {void}
	 */
	const handleHover = useCallback((e: DiagramHoverEvent) => {
		setIsHovered(e.isHovered);
	}, []);

	useEffect(() => {
		const handleConnection = (e: Event) => {
			// refBusを介して参照値を取得
			const { id, pathPoints, ownerId, onConnect, updatePathPoints } =
				refBus.current;

			const customEvent = e as CustomEvent<ConnectionEvent>;
			if (customEvent.detail.startPointId === id) {
				if (customEvent.detail.type === "connecting") {
					// 接続が始まった時の処理
					// 接続先のポイントを保持
					connectingPoint.current = {
						id: customEvent.detail.endPointId,
						x: customEvent.detail.endX,
						y: customEvent.detail.endY,
						onwerId: customEvent.detail.endOwnerId,
						ownerShape: customEvent.detail.endOwnerShape,
					};

					// 接続先のポイントと線がつながるよう、パスポイントを再計算
					updatePathPoints(customEvent.detail.endX, customEvent.detail.endY);
				}

				if (customEvent.detail.type === "disconnect") {
					// 切断時の処理
					// 接続中のポイントを解除
					connectingPoint.current = undefined;
				}

				if (customEvent.detail.type === "connect") {
					// 接続完了時の処理
					// 接続線のデータを生成してイベント発火

					const points: PathPointData[] = [...pathPoints];
					points[0].id = id;
					for (let i = 1; i < points.length - 1; i++) {
						points[i].id = newId();
					}
					points[points.length - 1].id = customEvent.detail.endPointId;

					onConnect?.({
						startOwnerId: ownerId,
						points: points,
						endOwnerId: customEvent.detail.endOwnerId,
					});

					setPathPoints([]);
				}
			}
		};

		document.addEventListener(EVENT_NAME_CONNECTTION, handleConnection);

		return () => {
			if (handleConnection) {
				document.removeEventListener(EVENT_NAME_CONNECTTION, handleConnection);
			}
		};
	}, []);

	return (
		<>
			<DragPoint
				id={id}
				x={x}
				y={y}
				type="ConnectPoint"
				radius={6}
				stroke="rgba(255, 204, 0, 0.8)"
				fill="rgba(255, 204, 0, 0.8)"
				outline="none"
				isTransparent={isTransparent && !isHovered} // TODO: !isHoverdは必要か検討
				onDrag={handleDrag}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onHover={handleHover}
			/>
			{isDragging && (
				<Path
					id={`${id}-connecting-path`}
					x={0}
					y={0}
					width={0}
					height={0}
					rotation={0}
					scaleX={1}
					scaleY={1}
					stroke="black"
					strokeWidth="1px"
					keepProportion={false}
					isSelected={false}
					isMultiSelectSource={false}
					dragEnabled={false}
					segmentDragEnabled={false}
					newVertexEnabled={false}
					items={pathPoints as Diagram[]}
				/>
			)}
		</>
	);
};

export default memo(ConnectPoint);

// 以下内部型定義
type ConnectionEvent = {
	type: "connecting" | "connect" | "disconnect";
	startPointId: string;
	startX: number;
	startY: number;
	endPointId: string;
	endX: number;
	endY: number;
	endOwnerId: string;
	endOwnerShape: Shape;
};

type ConnectingPoint = {
	id: string;
	x: number;
	y: number;
	onwerId: string;
	ownerShape: Shape;
};

// 以下内部関数定義
const getDirection = (radians: number): Direction => {
	const degrees = Math.round(radiansToDegrees(radians));
	if (degrees <= 45 || 315 <= degrees) {
		return "up";
	}
	if (45 < degrees && degrees < 135) {
		return "right";
	}
	if (135 <= degrees && degrees <= 225) {
		return "down";
	}
	return "left";
};

export const getLineDirection = (
	ox: number,
	oy: number,
	px: number,
	py: number,
): Direction => {
	return getDirection(calcRadians(ox, oy, px, py));
};

const isUpDown = (direction: Direction): boolean => {
	return direction === "up" || direction === "down";
};

const getSecondConnectPoint = (
	ownerShape: Shape,
	cx: number,
	cy: number,
): Point => {
	const ownerOuterBox = calcRectangleOuterBox(ownerShape);
	const direction = getLineDirection(ownerShape.x, ownerShape.y, cx, cy);

	if (direction === "up") {
		return { x: cx, y: ownerOuterBox.top - CONNECT_LINE_MARGIN };
	}
	if (direction === "down") {
		return { x: cx, y: ownerOuterBox.bottom + CONNECT_LINE_MARGIN };
	}
	if (direction === "left") {
		return { x: ownerOuterBox.left - CONNECT_LINE_MARGIN, y: cy };
	}
	if (direction === "right") {
		return { x: ownerOuterBox.right + CONNECT_LINE_MARGIN, y: cy };
	}
	return { x: 0, y: 0 };
};

const addGridCrossPoint = (grid: GridPoint[], point: GridPoint) => {
	if (!grid.some((p) => p.x === point.x && p.y === point.y)) {
		const len = grid.length;
		for (let i = 0; i < len; i++) {
			const p = grid[i];
			// すでにある点を中心とする水平線および垂直線上と
			// 追加した点を中心とする水平線および垂直線上との交点を追加
			if (p.x !== point.x) {
				grid.push({ x: p.x, y: point.y, score: p.score });
			}
			if (p.y !== point.y) {
				grid.push({ x: point.x, y: p.y, score: p.score });
			}
		}
		grid.push(point);
	}
};

const addMarginToBox = (box: Box): Box => {
	const left = box.left - CONNECT_LINE_MARGIN;
	const top = box.top - CONNECT_LINE_MARGIN;
	const right = box.right + CONNECT_LINE_MARGIN;
	const bottom = box.bottom + CONNECT_LINE_MARGIN;
	return {
		top,
		left,
		right,
		bottom,
		center: box.center,
		leftTop: { x: left, y: top },
		leftBottom: { x: left, y: bottom },
		rightTop: { x: right, y: top },
		rightBottom: { x: right, y: bottom },
	};
};

const createConnectPathOnDrag = (
	startX: number,
	startY: number,
	startDirection: Direction,
	startOwnerOuterBox: Box,
	endX: number,
	endY: number,
) => {
	// 図形と重ならないように線を引く
	const newPoints: Point[] = [];

	// 開始方向が上下かどうか
	const isDirectionUpDown = isUpDown(startDirection);

	const marginBox = addMarginToBox(startOwnerOuterBox);

	// p1
	const p1 = { x: startX, y: startY };
	newPoints.push(p1);

	// p2
	const p2 = {
		x: isDirectionUpDown ? p1.x : endX,
		y: isDirectionUpDown ? endY : p1.y,
	};

	if (isDirectionUpDown) {
		if (startDirection === "up") {
			p2.y = marginBox.top;
		} else {
			p2.y = marginBox.bottom;
		}
	} else {
		if (startDirection === "right") {
			p2.x = marginBox.right;
		} else {
			p2.x = marginBox.left;
		}
	}
	newPoints.push(p2);

	// p3
	const p3 = {
		x: isDirectionUpDown ? p2.x : endX,
		y: isDirectionUpDown ? endY : p2.y,
	};

	// p4
	const p4 = { x: endX, y: endY };

	// p2-p3間の線の方向が逆向きになっているかチェック
	const isP2ReverseDirection =
		getLineDirection(p2.x, p2.y, p3.x, p3.y) !== startDirection;
	if (isP2ReverseDirection) {
		// 逆向きになっている場合
		if (isDirectionUpDown) {
			p3.x = p4.x;
			p3.y = p2.y;
		} else {
			p3.x = p2.x;
			p3.y = p4.y;
		}
	}
	newPoints.push(p3);
	newPoints.push(p4);

	// p3-p4間の線が図形の辺と交差しているかチェック
	let isAccrossCloserLine = false;
	let isAccrossFartherLine = false;
	if (startDirection === "up") {
		isAccrossCloserLine = lineIntersects(
			marginBox.leftTop,
			marginBox.rightTop,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBox.leftBottom,
			marginBox.rightBottom,
			p3,
			p4,
		);
	}
	if (startDirection === "down") {
		isAccrossCloserLine = lineIntersects(
			marginBox.leftBottom,
			marginBox.rightBottom,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBox.leftTop,
			marginBox.rightTop,
			p3,
			p4,
		);
	}
	if (startDirection === "left") {
		isAccrossCloserLine = lineIntersects(
			marginBox.leftTop,
			marginBox.leftBottom,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBox.rightTop,
			marginBox.rightBottom,
			p3,
			p4,
		);
	}
	if (startDirection === "right") {
		isAccrossCloserLine = lineIntersects(
			marginBox.rightTop,
			marginBox.rightBottom,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			marginBox.leftTop,
			marginBox.leftBottom,
			p3,
			p4,
		);
	}

	if (isAccrossCloserLine) {
		// 近い辺と交差している場合は、p3を近い辺に移動
		if (isDirectionUpDown) {
			p3.x = closer(endX, marginBox.left, marginBox.right);
		} else {
			p3.y = closer(endY, marginBox.top, marginBox.bottom);
		}
		// p4が図形の中に入らないよう位置を修正
		if (isDirectionUpDown) {
			p4.x = p3.x;
			p4.y = endY;
		} else {
			p4.x = endX;
			p4.y = p3.y;
		}
	}

	if (isAccrossFartherLine) {
		// 遠い辺も交差している場合は、p5を追加して交差しないようにする
		const p5 = { x: endX, y: endY };
		newPoints.push(p5);
	}

	return newPoints;
};

type GridPoint = Point & {
	score?: number;
};

export const createBestConnectPath = (
	startX: number,
	startY: number,
	startDirection: Direction,
	startOwnerShape: Shape,
	endX: number,
	endY: number,
	endOwnerShape: Shape,
): Point[] => {
	const startOuterBox = calcRectangleOuterBox(startOwnerShape);
	const endOuterBox = calcRectangleOuterBox(endOwnerShape);

	const startP2 = getSecondConnectPoint(startOwnerShape, startX, startY);
	const endP2 = getSecondConnectPoint(endOwnerShape, endX, endY);

	const p2MidX = (startP2.x + endP2.x) / 2;
	const p2MidY = (startP2.y + endP2.y) / 2;

	const startCloserX = closer(p2MidX, startOuterBox.left, startOuterBox.right);
	const startCloserY = closer(p2MidY, startOuterBox.top, startOuterBox.bottom);
	const endCloserX = closer(p2MidX, endOuterBox.left, endOuterBox.right);
	const endCloserY = closer(p2MidY, endOuterBox.top, endOuterBox.bottom);

	const midPoint = {
		x: Math.round((startCloserX + endCloserX) / 2),
		y: Math.round((startCloserY + endCloserY) / 2),
		score: 1,
	};

	// 接続線の中心候補となるポイントのグリッドを作成
	const grid: Point[] = [];
	addGridCrossPoint(grid, startP2);
	addGridCrossPoint(grid, endP2);
	addGridCrossPoint(grid, midPoint);

	// そのぞれの中心候補のポイントを通過するルートを作成
	const pathList: Point[][] = [];
	const intersectsPathList: Point[][] = [];
	for (const p of grid) {
		// 接続元から中心候補までのルート
		const startToCenter = createConnectPathOnDrag(
			startX,
			startY,
			startDirection,
			startOuterBox,
			p.x,
			p.y,
		);

		// 接続先から中心候補までのルート
		const endToCenter = createConnectPathOnDrag(
			endX,
			endY,
			getLineDirection(endOwnerShape.x, endOwnerShape.y, endX, endY),
			calcRectangleOuterBox(endOwnerShape),
			p.x,
			p.y,
		);

		const connectPath = [...startToCenter, ...endToCenter.reverse()];

		// 図形と交差しているかチェック
		const isIntersecting = () => {
			for (let i = 1; i < connectPath.length - 2; i++) {
				const p1 = connectPath[i];
				const p2 = connectPath[i + 1];
				if (
					isLineIntersectingBox(p1, p2, startOuterBox) ||
					isLineIntersectingBox(p1, p2, endOuterBox)
				) {
					return true;
				}
			}
			return false;
		};

		if (!isIntersecting()) {
			pathList.push(cleanPath(connectPath));
		} else {
			intersectsPathList.push(cleanPath(connectPath));
		}
	}

	const bestPath =
		pathList.length !== 0
			? getBestPath(pathList, [midPoint])
			: getBestPath(intersectsPathList, [midPoint]);

	return cleanPath(bestPath);
};

const cleanPath = (list: Point[]): Point[] => {
	const points: Point[] = [...list];
	for (let i = points.length - 3; i >= 0; i--) {
		if (
			// 3点が一直線上にある場合は中間の点を削除
			isStraight(points[i], points[i + 1], points[i + 2])
		) {
			points.splice(i + 1, 1);
		}
	}
	return points;
};

const isStraight = (p1: Point, p2: Point, p3: Point): boolean => {
	return (p1.x === p2.x && p2.x === p3.x) || (p1.y === p2.y && p2.y === p3.y);
};

const getBestPath = (list: Point[][], goodPoints: GridPoint[]): Point[] => {
	const getScore = (p: Point): number => {
		const goodPoint = goodPoints.find((gp) => gp.x === p.x && gp.y === p.y);
		return goodPoint ? goodPoint.score || 0 : 0;
	};

	return list.reduce((a, b) => {
		const distanceA = a.reduce((acc, p, i) => {
			if (i === 0) return acc;
			const ap = a[i - 1];
			return acc + calcDistance(ap.x, ap.y, p.x, p.y);
		}, 0);
		const turnsA = a.reduce((acc, p, i) => {
			if (i < 2) return acc;
			return acc + (isStraight(a[i - 2], a[i - 1], p) ? 0 : 1);
		}, 0);
		const scoreA = a.reduce((acc, p) => acc + getScore(p), 0);

		const distanceB = b.reduce((acc, p, i) => {
			if (i === 0) return acc;
			const bp = b[i - 1];
			return acc + calcDistance(bp.x, bp.y, p.x, p.y);
		}, 0);
		const turnsB = b.reduce((acc, p, i) => {
			if (i < 2) return acc;
			return acc + (isStraight(b[i - 2], b[i - 1], p) ? 0 : 1);
		}, 0);
		const scoreB = b.reduce((acc, p) => acc + getScore(p), 0);

		return distanceA < distanceB ||
			(distanceA === distanceB && turnsA < turnsB) ||
			(distanceA === distanceB && turnsA === turnsB && scoreA > scoreB)
			? a
			: b;
	});
};
