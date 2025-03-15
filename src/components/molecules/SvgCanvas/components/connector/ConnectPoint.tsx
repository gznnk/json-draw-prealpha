// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

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
	calcDistance,
	calcRadian,
	calcRectangleOuterBox,
	closer,
	isLineIntersectingBox,
	lineIntersects,
	radiansToDegrees,
} from "../../functions/Math";
import { newId } from "../../functions/Diagram";

// import { drawPoint, drawRect } from "../../functions/Diagram";

/** 図形と接続線のマージン */
const CONNECT_LINE_MARGIN = 20;

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
	// ホバー状態の管理
	const [isHovered, setIsHovered] = useState(false);
	// ドラッグ状態の管理
	const [isDragging, setIsDragging] = useState(false);
	// 接続線の座標
	const [pathPoints, setPathPoints] = useState<PathPointData[]>([]);
	// 接続中のポイント
	const connectingPoint = useRef<ConnectingPoint | undefined>(undefined);

	const ownerOuterBox = calcRectangleOuterBox(ownerShape);

	const direction = getLineDirection(ownerShape.point, point);

	const updatePathPoints = useCallback(
		(dragPoint: Point) => {
			let newPoints: Point[] = [];

			if (!connectingPoint.current) {
				newPoints = createConnectPathOnDrag(
					point,
					direction,
					ownerOuterBox,
					dragPoint,
				);
			} else {
				newPoints = createBestConnectPath(
					point,
					direction,
					ownerShape,
					connectingPoint.current.point,
					connectingPoint.current.ownerShape,
				);
			}

			const newPathPoints = newPoints.map((p) => ({
				id: newId(),
				point: p,
				isSelected: false,
			}));

			setPathPoints(newPathPoints);
		},
		[point, ownerShape, ownerOuterBox, direction],
	);

	const handleDragStart = useCallback((_e: DiagramDragEvent) => {
		setIsDragging(true);
	}, []);

	const handleDrag = useCallback(
		(e: DiagramDragEvent) => {
			if (connectingPoint.current) {
				// 接続中のポイントがある場合は、そのポイントを終点とする
				return;
			}

			// 接続線の座標を再計算
			updatePathPoints(e.endPoint);
		},
		[updatePathPoints],
	);

	const handleDragEnd = useCallback((_e: DiagramDragEvent) => {
		setPathPoints([]);
		setIsDragging(false);
	}, []);

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
						updatePathPoints(customEvent.detail.point);
					}

					if (customEvent.detail.type === "disconnect") {
						// 切断時の処理
						// 接続中のポイントを解除
						connectingPoint.current = undefined;
					}

					if (customEvent.detail.type === "connect") {
						// 接続完了時の処理
						// 接続線のデータを生成してイベント発火

						// 接続線をクリーンアップ
						const points: PathPointData[] = [...pathPoints];
						for (let i = points.length - 3; i >= 0; i--) {
							if (
								// 3点が一直線上にある場合は中間の点を削除
								isStraight(
									points[i].point,
									points[i + 1].point,
									points[i + 2].point,
								)
							) {
								points.splice(i + 1, 1);
							}
						}
						points[0].id = id;
						points[points.length - 1].id = customEvent.detail.id;

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
	}, [onConnect, updatePathPoints, id, isDragging, pathPoints]);

	return (
		<>
			<DragPoint
				id={id}
				point={point}
				type="ConnectPoint"
				radius={6}
				stroke="rgba(255, 204, 0, 0.8)"
				fill="rgba(255, 204, 0, 0.8)"
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
					id={`${id}-connecting-path`}
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

type Direction = "up" | "down" | "left" | "right";

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

const getLineDirection = (o: Point, p: Point): Direction => {
	return getDirection(calcRadian(o, p));
};

const isUpDown = (direction: Direction): boolean => {
	return direction === "up" || direction === "down";
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
		center: box.center,
		leftTop: { x: left, y: top },
		leftBottom: { x: left, y: bottom },
		rightTop: { x: right, y: top },
		rightBottom: { x: right, y: bottom },
	};
};

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

	const marginBox = addMarginToBox(startOwnerOuterBox);

	// p1
	const p1 = { ...startPoint };
	newPoints.push(startPoint);

	// p2
	const p2 = {
		x: isDirectionUpDown ? p1.x : endPoint.x,
		y: isDirectionUpDown ? endPoint.y : p1.y,
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
		x: isDirectionUpDown ? p2.x : endPoint.x,
		y: isDirectionUpDown ? endPoint.y : p2.y,
	};

	// p4
	const p4 = { ...endPoint };

	// p2-p3間の線の方向が逆向きになっているかチェック
	const isP2ReverseDirection = getLineDirection(p2, p3) !== startDirection;
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
			p3.x = closer(endPoint.x, marginBox.left, marginBox.right);
		} else {
			p3.y = closer(endPoint.y, marginBox.top, marginBox.bottom);
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

	if (isAccrossFartherLine) {
		// 遠い辺も交差している場合は、p5を追加して交差しないようにする
		const p5 = { ...endPoint };
		newPoints.push(p5);
	}

	return newPoints;
};

const createBestConnectPath = (
	startPoint: Point,
	startDirection: Direction,
	startOwnerShape: Shape,
	endPoint: Point,
	endOwnerShape: Shape,
) => {
	const startOuterBox = calcRectangleOuterBox(startOwnerShape);
	const endOuterBox = calcRectangleOuterBox(endOwnerShape);

	const startP2 = getSecondConnectPoint(startOwnerShape, startPoint);
	const endP2 = getSecondConnectPoint(endOwnerShape, endPoint);
	const midPoint = {
		x: (startP2.x + endP2.x) / 2,
		y: (startP2.y + endP2.y) / 2,
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
			startPoint,
			startDirection,
			startOuterBox,
			p,
		);

		// 接続先から中心候補までのルート
		const endToCenter = createConnectPathOnDrag(
			endPoint,
			getLineDirection(endOwnerShape.point, endPoint),
			calcRectangleOuterBox(endOwnerShape),
			p,
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
			pathList.push(connectPath);
		} else {
			intersectsPathList.push(connectPath);
		}
	}

	return pathList.length !== 0
		? getBestPath(pathList)
		: getBestPath(intersectsPathList);
};

const isStraight = (p1: Point, p2: Point, p3: Point): boolean => {
	return (p1.x === p2.x && p2.x === p3.x) || (p1.y === p2.y && p2.y === p3.y);
};

const getBestPath = (list: Point[][]): Point[] => {
	return list.reduce((a, b) => {
		const distanceA = a.reduce((acc, p, i) => {
			if (i === 0) return acc;
			return acc + calcDistance(a[i - 1], p);
		}, 0);
		const turnsA = a.reduce((acc, p, i) => {
			if (i < 2) return acc;
			return acc + (isStraight(a[i - 2], a[i - 1], p) ? 0 : 1);
		}, 0);
		const distanceB = b.reduce((acc, p, i) => {
			if (i === 0) return acc;
			return acc + calcDistance(b[i - 1], p);
		}, 0);
		const turnsB = b.reduce((acc, p, i) => {
			if (i < 2) return acc;
			return acc + (isStraight(b[i - 2], b[i - 1], p) ? 0 : 1);
		}, 0);

		return distanceA < distanceB || (distanceA === distanceB && turnsA < turnsB)
			? a
			: b;
	});
};
