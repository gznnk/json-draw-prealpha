// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
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
	calcRectangleOuterBox,
	closer,
	isPointInShape,
	signNonZero,
	calcRadian,
	radiansToDegrees,
	lineIntersects,
	degreesToRadians,
	boolSign,
	isLineIntersectingBox,
} from "../../functions/Math";

import { drawPoint, drawRect } from "../../functions/Diagram";

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

const getDirectionFromPoint = (o: Point, p: Point): Direction => {
	return getDirection(calcRadian(o, p));
};

const isUpDown = (direction: Direction): boolean => {
	return direction === "up" || direction === "down";
};

const isLeftRight = (direction: Direction): boolean => {
	return direction === "left" || direction === "right";
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

const findOptimalPath = (grid: Point[], start: Point, end: Point): Point[] => {
	const queue: { point: Point; route: Point[]; turns: number }[] = [
		{ point: start, route: [start], turns: 0 },
	];
	const visited = new Map<string, number>(); // 訪問済みの点とそのターン数を記録

	const key = (p: Point) => `${p.x},${p.y}`;
	visited.set(key(start), 0);

	let bestPath: Point[] = [];
	let minTurns = Number.POSITIVE_INFINITY;
	let minDistance = Number.POSITIVE_INFINITY;

	while (queue.length > 0) {
		const { point, route, turns } = queue.shift()!;

		if (point.x === end.x && point.y === end.y) {
			const distance = route.length;
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

		for (const next of grid) {
			if (point.x !== next.x && point.y !== next.y) continue; // 直線移動のみ許可

			const nextKey = key(next);
			const newTurns =
				route.length > 1 &&
				route[route.length - 2].x !== next.x &&
				route[route.length - 2].y !== next.y
					? turns + 1
					: turns;

			if (!visited.has(nextKey) || visited.get(nextKey)! > newTurns) {
				visited.set(nextKey, newTurns);
				queue.push({ point: next, route: [...route, next], turns: newTurns });
			}
		}
	}

	return bestPath;
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

	const direction = getDirectionFromPoint(ownerShape.point, point);
	const isDirectionUpDown = isUpDown(direction);

	const calcPathPoints = useCallback(
		(dragPoint: Point) => {
			const newPoints: PathPointData[] = [];

			// 接続中のポイントがある場合は、そのポイントを終点とする
			// ない場合は、ドラッグ中のポイントを終点とする
			const endPoint = connectingPoint.current
				? connectingPoint.current.point
				: dragPoint;

			// 図形と重ならないように線を引く

			// p1
			newPoints.push(createPathPointData(pathPointIds.p1, point));

			// p2
			const p2 = {
				x: isDirectionUpDown ? point.x : Math.abs((point.x + endPoint.x) / 2),
				y: isDirectionUpDown ? Math.abs((point.y + endPoint.y) / 2) : point.y,
			};
			// p1-p2間の線の方向が逆向きになっているかチェック
			const isP2ReverseDirection =
				getDirectionFromPoint(point, p2) !== direction;
			if (isP2ReverseDirection) {
				// 逆向きになっている場合は、p2を反対方向に移動
				if (isDirectionUpDown) {
					if (direction === "up") {
						p2.y = ownerOuterBox.top - CONNECT_LINE_MARGIN;
					} else {
						p2.y = ownerOuterBox.bottom + CONNECT_LINE_MARGIN;
					}
				} else {
					if (direction === "right") {
						p2.x = ownerOuterBox.right + CONNECT_LINE_MARGIN;
					} else {
						p2.x = ownerOuterBox.left - CONNECT_LINE_MARGIN;
					}
				}
			}
			newPoints.push(createPathPointData(pathPointIds.p2, p2));

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
			const edges = {
				leftTop: { x: ownerOuterBox.left, y: ownerOuterBox.top },
				rightTop: { x: ownerOuterBox.right, y: ownerOuterBox.top },
				rightBottom: { x: ownerOuterBox.right, y: ownerOuterBox.bottom },
				leftBottom: { x: ownerOuterBox.left, y: ownerOuterBox.bottom },
			};
			if (direction === "up") {
				isAccrossCloserLine = lineIntersects(
					edges.leftTop,
					edges.rightTop,
					p3,
					p4,
				);
				isAccrossFartherLine = lineIntersects(
					edges.leftBottom,
					edges.rightBottom,
					p3,
					p4,
				);
			}
			if (direction === "down") {
				isAccrossCloserLine = lineIntersects(
					edges.leftBottom,
					edges.rightBottom,
					p3,
					p4,
				);
				isAccrossFartherLine = lineIntersects(
					edges.leftTop,
					edges.rightTop,
					p3,
					p4,
				);
			}
			if (direction === "left") {
				isAccrossCloserLine = lineIntersects(
					edges.leftTop,
					edges.leftBottom,
					p3,
					p4,
				);
				isAccrossFartherLine = lineIntersects(
					edges.rightTop,
					edges.rightBottom,
					p3,
					p4,
				);
			}
			if (direction === "right") {
				isAccrossCloserLine = lineIntersects(
					edges.rightTop,
					edges.rightBottom,
					p3,
					p4,
				);
				isAccrossFartherLine = lineIntersects(
					edges.leftTop,
					edges.leftBottom,
					p3,
					p4,
				);
			}

			if (isAccrossCloserLine) {
				// 近い辺と交差している場合は、p3を近い辺に移動
				if (isDirectionUpDown) {
					p3.x = closer(
						endPoint.x,
						ownerOuterBox.left - CONNECT_LINE_MARGIN,
						ownerOuterBox.right + CONNECT_LINE_MARGIN,
					);
				} else {
					p3.y = closer(
						endPoint.y,
						ownerOuterBox.top - CONNECT_LINE_MARGIN,
						ownerOuterBox.bottom + CONNECT_LINE_MARGIN,
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
			newPoints.push(createPathPointData(pathPointIds.p3, p3));
			newPoints.push(createPathPointData(pathPointIds.p4, p4));

			if (isAccrossFartherLine) {
				// 遠い辺も交差している場合は、p5を追加して交差しないようにする
				newPoints.push(createPathPointData(pathPointIds.p5, { ...endPoint }));
			}

			// drawPoint(`${pathPointIds.p1}-point`, {
			// 	x: newPoints[1].point.x,
			// 	y: point.y + signNonZero(newPoints[1].point.y - point.y) * 2,
			// });

			// 接続中の図形がある場合
			if (connectingPoint.current?.ownerShape) {
				// ルート作成用のマトリクスを作成
				const grid: Point[] = [];
				grid.push(point);
				grid.push({
					x: ownerOuterBox.left - CONNECT_LINE_MARGIN,
					y: ownerOuterBox.top - CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: ownerOuterBox.right + CONNECT_LINE_MARGIN,
					y: ownerOuterBox.top - CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: ownerOuterBox.right + CONNECT_LINE_MARGIN,
					y: ownerOuterBox.bottom + CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: ownerOuterBox.left - CONNECT_LINE_MARGIN,
					y: ownerOuterBox.bottom + CONNECT_LINE_MARGIN,
				});
				if (direction === "up") {
					grid.push({
						x: point.x,
						y: ownerOuterBox.top - CONNECT_LINE_MARGIN,
					});
				} else if (direction === "down") {
					grid.push({
						x: point.x,
						y: ownerOuterBox.bottom + CONNECT_LINE_MARGIN,
					});
				} else if (direction === "left") {
					grid.push({
						x: ownerOuterBox.left - CONNECT_LINE_MARGIN,
						y: point.y,
					});
				} else if (direction === "right") {
					grid.push({
						x: ownerOuterBox.right + CONNECT_LINE_MARGIN,
						y: point.y,
					});
				}

				const targetOwnerOuterBox = calcRectangleOuterBox(
					connectingPoint.current.ownerShape,
				);
				grid.push({
					x: targetOwnerOuterBox.left - CONNECT_LINE_MARGIN,
					y: targetOwnerOuterBox.top - CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: targetOwnerOuterBox.right + CONNECT_LINE_MARGIN,
					y: targetOwnerOuterBox.top - CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: targetOwnerOuterBox.right + CONNECT_LINE_MARGIN,
					y: targetOwnerOuterBox.bottom + CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: targetOwnerOuterBox.left - CONNECT_LINE_MARGIN,
					y: targetOwnerOuterBox.bottom + CONNECT_LINE_MARGIN,
				});
				const targetDirection = getDirectionFromPoint(
					connectingPoint.current.ownerShape.point,
					connectingPoint.current.point,
				);
				if (targetDirection === "up") {
					grid.push({
						x: connectingPoint.current.point.x,
						y: targetOwnerOuterBox.top - CONNECT_LINE_MARGIN,
					});
				} else if (targetDirection === "down") {
					grid.push({
						x: connectingPoint.current.point.x,
						y: targetOwnerOuterBox.bottom + CONNECT_LINE_MARGIN,
					});
				} else if (targetDirection === "left") {
					grid.push({
						x: targetOwnerOuterBox.left - CONNECT_LINE_MARGIN,
						y: connectingPoint.current.point.y,
					});
				} else if (targetDirection === "right") {
					grid.push({
						x: targetOwnerOuterBox.right + CONNECT_LINE_MARGIN,
						y: connectingPoint.current.point.y,
					});
				}
				grid.push(endPoint);

				grid.push({
					x: ownerOuterBox.left - CONNECT_LINE_MARGIN,
					y: targetOwnerOuterBox.top - CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: ownerOuterBox.right + CONNECT_LINE_MARGIN,
					y: targetOwnerOuterBox.top - CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: ownerOuterBox.right + CONNECT_LINE_MARGIN,
					y: targetOwnerOuterBox.bottom + CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: ownerOuterBox.left - CONNECT_LINE_MARGIN,
					y: targetOwnerOuterBox.bottom + CONNECT_LINE_MARGIN,
				});

				grid.push({
					x: targetOwnerOuterBox.left - CONNECT_LINE_MARGIN,
					y: ownerOuterBox.top - CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: targetOwnerOuterBox.right + CONNECT_LINE_MARGIN,
					y: ownerOuterBox.top - CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: targetOwnerOuterBox.right + CONNECT_LINE_MARGIN,
					y: ownerOuterBox.bottom + CONNECT_LINE_MARGIN,
				});
				grid.push({
					x: targetOwnerOuterBox.left - CONNECT_LINE_MARGIN,
					y: ownerOuterBox.bottom + CONNECT_LINE_MARGIN,
				});

				for (const p of grid) {
					drawPoint(`${id}-grid-${p.x}-${p.y}`, p);
				}

				// ルートを作成
				const route = findOptimalPath(grid, point, endPoint);

				// console.log(route);

				return route.map((p, i) => {
					const pathPointId = createPathPointId(id, i + 1);
					return createPathPointData(pathPointId, p);
				});
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
