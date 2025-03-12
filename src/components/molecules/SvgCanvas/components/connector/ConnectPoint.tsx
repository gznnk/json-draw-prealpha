// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Box, Point } from "../../types/CoordinateTypes";
import type {
	ConnectPointData,
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
	boolSign,
	calcDistance,
	calcRadian,
	calcRectangleOuterBox,
	closer,
	degreesToRadians,
	isLineIntersectingBox,
	isPointInShape,
	isPointOnSegment,
	lineIntersects,
	radiansToDegrees,
	signNonZero,
} from "../../functions/Math";

import { drawPoint, drawRect } from "../../functions/Diagram";

/** 図形と接続線のマージン */
const CONNECT_LINE_MARGIN = 20;

const createPathPointId = (id: string, index: number) => `${id}-pp-${index}`;

const createPathPointData = (id: string, point: Point): PathPointData => ({
	id,
	point,
	isSelected: false,
});

type Direction = "up" | "down" | "left" | "right";

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

const getLineDirection = (o: Point, p: Point): Direction => {
	return getDirection(calcRadian(o, p));
};

const isUpDown = (direction: Direction): boolean => {
	return direction === "up" || direction === "down";
};

const isLeftRight = (direction: Direction): boolean => {
	return direction === "left" || direction === "right";
};

const getSecondConnectPoint = (ownerShape: Shape, point: Point): Point => {
	const ownerOuterBox = calcRectangleOuterBox(ownerShape);
	const direction = getLineDirection(ownerShape.point, point);

	if (direction === "up") {
		return { x: point.x, y: ownerOuterBox.top - CONNECT_LINE_MARGIN };
	}
	if (direction === "down") {
		return { x: point.x, y: ownerOuterBox.bottom + CONNECT_LINE_MARGIN };
	}
	if (direction === "left") {
		return { x: ownerOuterBox.left - CONNECT_LINE_MARGIN, y: point.y };
	}
	if (direction === "right") {
		return { x: ownerOuterBox.right + CONNECT_LINE_MARGIN, y: point.y };
	}
	return { x: 0, y: 0 };
};

// 幅優先探索
const findShortestPath = (grid: Point[], start: Point, end: Point): Point[] => {
	const queue: { point: Point; route: Point[] }[] = [
		{ point: start, route: [start] },
	];
	const visited = new Set<string>();

	const key = (p: Point) => `${p.x},${p.y}`;
	visited.add(key(start));

	while (queue.length > 0) {
		const item = queue.shift();
		console.log(item?.route);
		if (!item) break;
		const { point, route } = item;

		if (point.x === end.x && point.y === end.y) {
			return route;
		}

		for (const next of grid) {
			if (visited.has(key(next))) continue;
			if (point.x !== next.x && point.y !== next.y) continue;

			// const isPathClear = route.every((p) => p.x === next.x || p.y === next.y);
			// if (!isPathClear) continue;

			visited.add(key(next));
			queue.push({ point: next, route: [...route, next] });
		}
	}

	return [];
};

// TODO 重い
/**
 * 最短距離で移動し、かつ曲がる回数が最小のルートを探索する関数
 *
 * @param grid 許可された座標のリスト
 * @param start 開始地点の座標
 * @param end 終了地点の座標
 * @returns 最適なルート（通過する座標の配列）
 */
const findOptimalPath = (
	grid: Point[],
	start: Point,
	end: Point,
	forbidden: Point[] = [],
): Point[] => {
	const key = (p: Point) => `${p.x},${p.y}`;

	// 探索のためのキュー（現在地、通過ルート、曲がった回数を管理）
	const queue: {
		point: Point;
		route: Point[];
		distance: number;
		turns: number;
		visited: Set<string>;
	}[] = [
		{
			point: start,
			route: [start],
			distance: 0,
			turns: 0,
			visited: new Set(key(start)),
		},
	];

	let bestPath: Point[] = [];
	let minTurns = Number.POSITIVE_INFINITY;
	let minDistance = Number.POSITIVE_INFINITY;

	while (queue.length > 0) {
		const item = queue.shift();
		if (!item) {
			break;
		}
		const { point, route, distance, turns, visited } = item;
		const newVisited = new Set(visited);

		// ゴールに到達した場合、最適なルートを更新
		if (point.x === end.x && point.y === end.y) {
			if (
				distance < minDistance ||
				(distance === minDistance && turns < minTurns)
			) {
				minDistance = distance;
				minTurns = turns;
				bestPath = route;
			}
			continue;
		}

		// グリッド内のすべての点に対して移動を試みる
		for (const next of grid) {
			// 水平または垂直に移動できる場合のみ進む
			if (point.x !== next.x && point.y !== next.y) continue;
			// if (forbidden.some((p) => isPointOnSegment(point, next, p))) continue; // TODO: だめ

			const nextKey = key(next);

			const newDistance = distance + calcDistance(point, next);

			// 直前の移動方向と異なる場合はターンを増加
			const newTurns =
				route.length > 1 &&
				route[route.length - 2].x !== next.x &&
				route[route.length - 2].y !== next.y
					? turns + 1
					: turns;

			// まだ訪問していない場合のみ追加
			if (!newVisited.has(nextKey)) {
				newVisited.add(nextKey);
				queue.push({
					point: next,
					route: [...route, next],
					distance: newDistance,
					turns: newTurns,
					visited: newVisited,
				});
			}
		}
	}

	return bestPath;
};

const addGridCrossPoint = (grid: Point[], point: Point) => {
	if (!grid.some((p) => p.x === point.x && p.y === point.y)) {
		const len = grid.length;
		for (let i = 0; i < len; i++) {
			const p = grid[i];
			// すでにある点を中心とする水平線および垂直線上と
			// 追加した点を中心とする水平線および垂直線上との交点を追加
			if (p.x !== point.x) {
				grid.push({ x: p.x, y: point.y });
			}
			if (p.y !== point.y) {
				grid.push({ x: point.x, y: p.y });
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
		leftTop: { x: left, y: top },
		leftBottom: { x: left, y: bottom },
		rightTop: { x: right, y: top },
		rightBottom: { x: right, y: bottom },
	};
};

type ConnectionEvent = {
	id: string;
	type: "connecting" | "connect" | "disconnect";
	point: Point;
	ownerShape: Shape;
};

type ConnectingPoint = {
	id: string;
	point: Point;
	ownerShape: Shape;
};

type ConnectPointProps = ConnectPointData & {
	ownerShape: Shape;
	visible: boolean;
	onConnect?: (e: DiagramConnectEvent) => void;
};

const ConnectPoint: React.FC<ConnectPointProps> = ({
	id,
	point,
	ownerShape,
	visible,
	onConnect,
}) => {
	// console.log("ConnectPoint rendered")
	// ホバー状態の管理
	const [isHovered, setIsHovered] = useState(false);
	// ドラッグ状態の管理
	const [isDragging, setIsDragging] = useState(false);
	// 接続中のポイント
	const connectingPoint = useRef<ConnectingPoint | undefined>(undefined);

	// パスポイントのID
	const pathPointIds = useMemo(
		() => ({
			p1: createPathPointId(id, 1),
			p2: createPathPointId(id, 2),
			p3: createPathPointId(id, 3),
			p4: createPathPointId(id, 4),
			p5: createPathPointId(id, 5),
			p6: createPathPointId(id, 6),
			p7: createPathPointId(id, 7),
		}),
		[id],
	);

	const [pathPoints, setPathPoints] = useState<PathPointData[]>([]);

	const ownerOuterBox = calcRectangleOuterBox(ownerShape);

	const direction = getLineDirection(ownerShape.point, point);
	const isDirectionUpDown = isUpDown(direction);

	const calcPathPoints = useCallback(
		(dragPoint: Point) => {
			// 接続中のポイントがある場合は、そのポイントを終点とする
			// ない場合は、ドラッグ中のポイントを終点とする
			const endPoint = connectingPoint.current
				? connectingPoint.current.point
				: dragPoint;

			// 図形と重ならないように線を引く
			const newPoints = createConnectPathOnDrag(
				point,
				direction,
				ownerOuterBox,
				endPoint,
			).map((p, i) => {
				const pathPointId = createPathPointId(id, i + 1); // TODO: IDの振り方改善
				return createPathPointData(pathPointId, p);
			});

			// drawPoint(`${pathPointIds.p1}-point`, {
			// 	x: newPoints[1].point.x,
			// 	y: point.y + signNonZero(newPoints[1].point.y - point.y) * 2,
			// });

			// ----------------------------------------------------------------
			// 接続中の図形がある場合
			if (connectingPoint.current) {
				const targetPoint = connectingPoint.current.point;

				// 始点と終点の中間地点を取得
				const midPoint = {
					x: (point.x + targetPoint.x) / 2,
					y: (point.y + targetPoint.y) / 2,
				};

				const path1 = createConnectPathOnDrag(
					point,
					direction,
					ownerOuterBox,
					midPoint,
				);

				const path2 = createConnectPathOnDrag(
					targetPoint,
					getLineDirection(
						connectingPoint.current.ownerShape.point,
						targetPoint,
					),
					calcRectangleOuterBox(connectingPoint.current.ownerShape),
					midPoint,
				);

				return [...path1, ...path2.reverse()].map((p, i) => {
					const pathPointId = createPathPointId(id, i + 1);
					return createPathPointData(pathPointId, p);
				});

				// const targetOwnerShape = connectingPoint.current.ownerShape;
				// // 接続中のポイントを取得
				// const secondConnectPoint = getSecondConnectPoint(ownerShape, point);

				// ルート作成用のマトリクスを作成
				// const grid: Point[] = [];
				// const box1 = addMarginToBox(ownerOuterBox);
				// const box2 = addMarginToBox(
				// 	calcRectangleOuterBox(connectingPoint.current.ownerShape),
				// );
				// addGridCrossPoint(grid, box1.leftTop);
				// addGridCrossPoint(grid, box1.leftBottom);
				// addGridCrossPoint(grid, box1.rightTop);
				// addGridCrossPoint(grid, box1.rightBottom);
				// addGridCrossPoint(grid, box2.leftTop);
				// addGridCrossPoint(grid, box2.leftBottom);
				// addGridCrossPoint(grid, box2.rightTop);
				// addGridCrossPoint(grid, box2.rightBottom);

				// const secondConnectPoint = getSecondConnectPoint(ownerShape, point);
				// const targetSecondConnectPoint = getSecondConnectPoint(
				// 	connectingPoint.current.ownerShape,
				// 	endPoint,
				// );
				// addGridCrossPoint(grid, secondConnectPoint);
				// addGridCrossPoint(grid, targetSecondConnectPoint);

				// // grid.push(point);
				// grid.push(endPoint);

				// for (const p of grid) {
				// 	drawPoint(`${id}-grid-${p.x}-${p.y}`, p);
				// }

				// // ルートを作成
				// const route = findOptimalPath(grid, point, endPoint, [
				// 	ownerShape.point,
				// 	connectingPoint.current.ownerShape.point,
				// ]);

				// // console.log(route);

				// return route.map((p, i) => {
				// 	const pathPointId = createPathPointId(id, i + 1);
				// 	return createPathPointData(pathPointId, p);
				// });
			}

			return newPoints;
		},
		[
			point,
			ownerShape,
			ownerOuterBox,
			direction,
			isDirectionUpDown,
			pathPointIds,
		],
	);

	const handleDragStart = useCallback((_e: DiagramDragEvent) => {
		setIsDragging(true);
	}, []);

	const handleDrag = useCallback(
		(e: DiagramDragEvent) => {
			if (connectingPoint.current) {
				return;
			}
			setPathPoints(calcPathPoints(e.endPoint));
		},
		[calcPathPoints],
	);

	const handleDragEnd = useCallback(
		(_e: DiagramDragEvent) => {
			setPathPoints([]);
			setIsDragging(false);
		},
		[point],
	);

	const handleDragOver = useCallback(
		(e: DiagramDragDropEvent) => {
			if (e.dropItem.type === "ConnectPoint") {
				setIsHovered(true);
				// 接続中の処理
				document.dispatchEvent(
					new CustomEvent("Connection", {
						detail: { id, type: "connecting", point, ownerShape },
					}),
				);
			}
		},
		[id, point, ownerShape],
	);

	const handleDragLeave = useCallback(
		(e: DiagramDragDropEvent) => {
			setIsHovered(false);
			// 接続が切れた時の処理
			if (e.dropItem.type === "ConnectPoint") {
				// 接続元に情報を送信
				document.dispatchEvent(
					new CustomEvent("Connection", {
						detail: { id, type: "disconnect", point },
					}),
				);
			}
		},
		[id, point],
	);

	const handleDrop = useCallback(
		(e: DiagramDragDropEvent) => {
			// ドロップされたときの処理
			if (e.dropItem.type === "ConnectPoint") {
				// 接続元に情報を送信
				document.dispatchEvent(
					new CustomEvent("Connection", {
						detail: { id, type: "connect", point, ownerShape },
					}),
				);
			}
			setIsHovered(false);
		},
		[id, point, ownerShape],
	);

	/**
	 * ホバー状態変更イベントハンドラ
	 *
	 * @param {DiagramHoverEvent} e ホバー状態変更イベント
	 * @returns {void}
	 */
	const handleHoverChange = useCallback((e: DiagramHoverEvent) => {
		setIsHovered(e.isHovered);
	}, []);

	// 接続イベントのリスナー登録
	useEffect(() => {
		let handleConnection: (e: Event) => void;
		if (isDragging) {
			handleConnection = (e: Event) => {
				const customEvent = e as CustomEvent<ConnectionEvent>;
				if (customEvent.detail.id !== id) {
					if (customEvent.detail.type === "connecting") {
						// 接続が始まった時の処理
						// 接続中のポイントを保持
						connectingPoint.current = {
							...customEvent.detail,
						};

						// 接続中のポイントと線がつながるよう、パスポイントを再計算
						setPathPoints(calcPathPoints(customEvent.detail.point));
					}

					if (customEvent.detail.type === "disconnect") {
						// 切断時の処理
						// 接続中のポイントを解除
						connectingPoint.current = undefined;
					}

					if (customEvent.detail.type === "connect") {
						// 接続完了時の処理
						// 接続ラインのデータを生成してイベント発火
						const points: PathPointData[] = [];
						points.push({
							id,
							point,
							isSelected: false,
						});
						for (let i = 1; i < pathPoints.length - 1; i++) {
							points.push({
								id: pathPoints[i].id,
								point: pathPoints[i].point,
								isSelected: false,
							});
						}
						points.push({
							id: customEvent.detail.id,
							point: customEvent.detail.point,
							isSelected: false,
						});

						onConnect?.({
							points,
						});
					}
				}
			};

			document.addEventListener("Connection", handleConnection);
		}

		return () => {
			if (handleConnection) {
				document.removeEventListener("Connection", handleConnection);
			}
		};
	}, [onConnect, id, point, isDragging, pathPoints, calcPathPoints]);

	return (
		<>
			<DragPoint
				id={id}
				point={point}
				type="ConnectPoint"
				radius={6}
				color="rgba(255, 204, 0, 0.8)"
				visible={visible || isHovered}
				onDragStart={handleDragStart}
				onDrag={handleDrag}
				onDragEnd={handleDragEnd}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onHoverChange={handleHoverChange}
			/>
			{isDragging && (
				<Path
					id={`${id}-path`}
					point={{ x: 0, y: 0 }}
					width={0}
					height={0}
					rotation={0}
					scaleX={1}
					scaleY={1}
					fill="none"
					stroke="black"
					strokeWidth="1px"
					keepProportion={false}
					isSelected={false}
					items={pathPoints as Diagram[]}
				/>
			)}
		</>
	);
};

export default memo(ConnectPoint);

const createConnectPathOnDrag = (
	startPoint: Point,
	startDirection: Direction,
	startOwnerOuterBox: Box,
	endPoint: Point,
) => {
	// 図形と重ならないように線を引く
	const newPoints: Point[] = [];

	// 開始方向が上下かどうか
	const isDirectionUpDown = isUpDown(startDirection);

	// p1
	const p1 = { ...startPoint };
	newPoints.push(startPoint);

	// p2
	const p2 = {
		x: isDirectionUpDown ? p1.x : Math.abs((p1.x + endPoint.x) / 2),
		y: isDirectionUpDown ? Math.abs((p1.y + endPoint.y) / 2) : p1.y,
	};
	// p1-p2間の線の方向が逆向きになっているかチェック
	const isP2ReverseDirection = getLineDirection(p1, p2) !== startDirection;
	if (isP2ReverseDirection) {
		// 逆向きになっている場合は、p2を反対方向に移動
		if (isDirectionUpDown) {
			if (startDirection === "up") {
				p2.y = startOwnerOuterBox.top - CONNECT_LINE_MARGIN;
			} else {
				p2.y = startOwnerOuterBox.bottom + CONNECT_LINE_MARGIN;
			}
		} else {
			if (startDirection === "right") {
				p2.x = startOwnerOuterBox.right + CONNECT_LINE_MARGIN;
			} else {
				p2.x = startOwnerOuterBox.left - CONNECT_LINE_MARGIN;
			}
		}
	}
	newPoints.push(p2);

	// p3
	const p3 = {
		x: isDirectionUpDown ? endPoint.x : p2.x,
		y: isDirectionUpDown ? p2.y : endPoint.y,
	};

	// p4
	const p4 = { ...endPoint };

	// p3-p4間の線が図形の辺と交差しているかチェック
	let isAccrossCloserLine = false;
	let isAccrossFartherLine = false;
	if (startDirection === "up") {
		isAccrossCloserLine = lineIntersects(
			startOwnerOuterBox.leftTop,
			startOwnerOuterBox.rightTop,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			startOwnerOuterBox.leftBottom,
			startOwnerOuterBox.rightBottom,
			p3,
			p4,
		);
	}
	if (startDirection === "down") {
		isAccrossCloserLine = lineIntersects(
			startOwnerOuterBox.leftBottom,
			startOwnerOuterBox.rightBottom,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			startOwnerOuterBox.leftTop,
			startOwnerOuterBox.rightTop,
			p3,
			p4,
		);
	}
	if (startDirection === "left") {
		isAccrossCloserLine = lineIntersects(
			startOwnerOuterBox.leftTop,
			startOwnerOuterBox.leftBottom,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			startOwnerOuterBox.rightTop,
			startOwnerOuterBox.rightBottom,
			p3,
			p4,
		);
	}
	if (startDirection === "right") {
		isAccrossCloserLine = lineIntersects(
			startOwnerOuterBox.rightTop,
			startOwnerOuterBox.rightBottom,
			p3,
			p4,
		);
		isAccrossFartherLine = lineIntersects(
			startOwnerOuterBox.leftTop,
			startOwnerOuterBox.leftBottom,
			p3,
			p4,
		);
	}

	if (isAccrossCloserLine) {
		// 近い辺と交差している場合は、p3を近い辺に移動
		if (isDirectionUpDown) {
			p3.x = closer(
				endPoint.x,
				startOwnerOuterBox.left - CONNECT_LINE_MARGIN,
				startOwnerOuterBox.right + CONNECT_LINE_MARGIN,
			);
		} else {
			p3.y = closer(
				endPoint.y,
				startOwnerOuterBox.top - CONNECT_LINE_MARGIN,
				startOwnerOuterBox.bottom + CONNECT_LINE_MARGIN,
			);
		}
		// p4が図形の中に入らないよう位置を修正
		if (isDirectionUpDown) {
			p4.x = p3.x;
			p4.y = endPoint.y;
		} else {
			p4.x = endPoint.x;
			p4.y = p3.y;
		}
	}
	newPoints.push(p3);
	newPoints.push(p4);

	if (isAccrossFartherLine) {
		// 遠い辺も交差している場合は、p5を追加して交差しないようにする
		newPoints.push({ ...endPoint });
	}

	return newPoints;
};
