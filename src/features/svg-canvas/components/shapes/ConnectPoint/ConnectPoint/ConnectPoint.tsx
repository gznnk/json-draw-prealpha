// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../../../types/base";
import type { CreateDiagramProps } from "../../../../types/DiagramTypes";
import type { Shape } from "../../../../types";
import type {
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramHoverEvent,
} from "../../../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import { DragPoint } from "../../../core/DragPoint";
import type { PathPointData } from "../../Path";

// SvgCanvas関連関数をインポート
import { newId } from "../../../../utils/diagram";
import { calcRectangleOuterBox } from "../../../../utils";

// Imports related to this component.
import { triggerNewConnectLine } from "../NewConnectLine";
import { EVENT_NAME_CONNECTTION } from "./ConnectPointConstants";
import {
	createBestConnectPath,
	createConnectPathOnDrag,
	getLineDirection,
} from "./ConnectPointFunctions";
import type { ConnectingPoint, ConnectionEvent } from "./ConnectPointTypes";
import type { ConnectPointData } from "../../../../types/shape";

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
const ConnectPointComponent: React.FC<ConnectPointProps> = ({
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

		// Notify the path data for the new connection line rendering.
		triggerNewConnectLine({
			id: `${id}-connecting-path`,
			type: "Path",
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			stroke: "#3A415C",
			strokeWidth: "3px",
			keepProportion: false,
			isSelected: false,
			isMultiSelectSource: false,
			endArrowHead: "Circle",
			items: newPathPoints,
		});
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
		if (connectingPoint.current) {
			// 接続中のポイントがある場合は、そのポイントを終点とする
			return;
		}

		// 接続線の座標を再計算
		refBus.current.updatePathPoints(e.endX, e.endY);

		if (e.eventType === "End") {
			setPathPoints([]);

			// Clear the path data for the new connection line rendering.
			triggerNewConnectLine();
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
						eventId: e.eventId,
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
						eventId: e.eventId,
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
						eventId: e.eventId,
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
						eventId: customEvent.detail.eventId,
						startOwnerId: ownerId,
						points: points,
						endOwnerId: customEvent.detail.endOwnerId,
					});

					setPathPoints([]);

					// Clear the path data for the new connection line rendering.
					triggerNewConnectLine();
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
		<DragPoint
			id={id}
			x={x}
			y={y}
			type="ConnectPoint"
			radius={6}
			stroke="rgba(255, 204, 0, 0.8)"
			fill="rgba(255, 204, 0, 0.8)"
			cursor="pointer"
			outline="none"
			// Show when hovered, even if isTransparent is true.
			// If you want to hide when hovered, do not render this component.
			isTransparent={isTransparent && !isHovered}
			onDrag={handleDrag}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			onHover={handleHover}
		/>
	);
};

export const ConnectPoint = memo(ConnectPointComponent);
