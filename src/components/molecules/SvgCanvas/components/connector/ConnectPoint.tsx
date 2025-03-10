// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
// SvgCanvas関連型定義をインポート
import type {
	ConnectPointData,
	Diagram,
	PathPointData,
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

const createPathPointId = (id: string, index: number) => `${id}-pp-${index}`;

const createPathPointData = (id: string, point: Point): PathPointData => ({
	id,
	point,
	isSelected: false,
});

type ConnectionEvent = {
	id: string;
	type: "connecting" | "connect" | "disconnect";
	point: Point;
};

type ConnectPointProps = ConnectPointData & {
	visible: boolean;
	onConnect?: (e: DiagramConnectEvent) => void;
};

const ConnectPoint: React.FC<ConnectPointProps> = ({
	id,
	point,
	visible,
	onConnect,
}) => {
	// console.log("ConnectPoint rendered")
	// ホバー状態の管理
	const [isHovered, setIsHovered] = useState(false);
	// ドラッグ状態の管理
	const [isDragging, setIsDragging] = useState(false);

	const isConnecting = useRef(false);

	const pathPointNames = useMemo(
		() => ({
			p1: createPathPointId(id, 1),
			p2: createPathPointId(id, 2),
			p3: createPathPointId(id, 3),
			p4: createPathPointId(id, 4),
		}),
		[id],
	);

	const [pathPoints, setPathPoints] = useState<PathPointData[]>([
		createPathPointData(pathPointNames.p1, point),
		createPathPointData(pathPointNames.p2, point),
		createPathPointData(pathPointNames.p3, point),
		createPathPointData(pathPointNames.p4, point),
	]);

	const handleDragStart = useCallback((_e: DiagramDragEvent) => {
		setIsDragging(true);
	}, []);

	const handleDrag = useCallback(
		(e: DiagramDragEvent) => {
			if (isConnecting.current) {
				return;
			}
			setPathPoints((prev) =>
				prev.map((item) => {
					if (item.id === pathPointNames.p1) {
						return item;
					}
					if (item.id === pathPointNames.p2) {
						return {
							...item,
							point: { x: point.x, y: (point.y + e.endPoint.y) / 2 },
						};
					}
					if (item.id === pathPointNames.p3) {
						return {
							...item,
							point: { x: e.endPoint.x, y: (point.y + e.endPoint.y) / 2 },
						};
					}
					if (item.id === pathPointNames.p4) {
						return { ...item, point: e.endPoint };
					}
					return item;
				}),
			);
		},
		[point, pathPointNames],
	);

	const handleDragEnd = useCallback(
		(_e: DiagramDragEvent) => {
			setPathPoints((prevState) =>
				prevState.map((item) => ({
					...item,
					point: point,
				})),
			);
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
						detail: { id, type: "connecting", point },
					}),
				);
			}
		},
		[id, point],
	);

	const handleDragLeave = useCallback(
		(e: DiagramDragDropEvent) => {
			setIsHovered(false);
			// 接続が切れた時の処理
			if (e.dropItem.type === "ConnectPoint") {
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
				document.dispatchEvent(
					new CustomEvent("Connection", {
						detail: { id, type: "connect", point },
					}),
				);
			}
			setIsHovered(false);
		},
		[id, point],
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
						console.log("connecting", customEvent.detail.id);

						isConnecting.current = true;

						// TODO: パスポイントの制御処理の共通化
						setPathPoints((prev) =>
							prev.map((item) => {
								if (item.id === pathPointNames.p1) {
									return item;
								}
								if (item.id === pathPointNames.p2) {
									return {
										...item,
										point: {
											x: point.x,
											y: (point.y + customEvent.detail.point.y) / 2,
										},
									};
								}
								if (item.id === pathPointNames.p3) {
									return {
										...item,
										point: {
											x: customEvent.detail.point.x,
											y: (point.y + customEvent.detail.point.y) / 2,
										},
									};
								}
								if (item.id === pathPointNames.p4) {
									return { ...item, point: customEvent.detail.point };
								}
								return item;
							}),
						);
					} else if (customEvent.detail.type === "disconnect") {
						// 切断
						isConnecting.current = false;
					} else if (customEvent.detail.type === "connect") {
						console.log("connect", customEvent.detail.id);
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
	}, [onConnect, id, point, isDragging, pathPoints, pathPointNames]);

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
