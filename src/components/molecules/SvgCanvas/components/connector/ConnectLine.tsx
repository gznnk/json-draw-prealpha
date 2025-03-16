// Reactのインポート
import type React from "react";
import { memo, useEffect, useRef } from "react";

// SvgCanvas関連コンポーネントをインポート
import { EVENT_NAME_CONNECT_POINT_MOVE } from "../connector/ConnectPoint";
import Path from "../diagram/Path";

// SvgCanvas関連型定義をインポート
import type {
	ConnectLineData,
	DiagramBaseProps,
	TransformativeProps,
} from "../../types/DiagramTypes";
import type {
	ConnectPointMoveEvent,
	GroupDataChangeEvent,
} from "../../types/EventTypes";

// SvgCanvas関連関数をインポート
import { calcRadian, radiansToDegrees } from "../../functions/Math";

type ConnectLineProps = DiagramBaseProps &
	TransformativeProps &
	ConnectLineData & {
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
	fill = "none",
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
}) => {
	const startItems = useRef(items);
	const isVerticalHorizontalLines = useRef<boolean>(true);

	useEffect(() => {
		const handleConnectPointMove = (e: Event) => {
			const event = e as CustomEvent<ConnectPointMoveEvent>;
			const movedId = event.detail.id;
			const movedPoint = event.detail.point;
			const type = event.detail.type;
			if (type === "moveStart") {
				startItems.current = items;
				isVerticalHorizontalLines.current = items.every((item, idx) => {
					if (idx === 0) {
						return true;
					}

					const prev = items[idx - 1];
					const direction = calcRadian(prev.point, item.point);
					const degrees = radiansToDegrees(direction);
					return degrees % 90 === 0;
				});
				return;
			}

			const i = items.findIndex((item) => item.id === movedId);
			if (0 <= i) {
				const p = startItems.current[i];
				const dx = movedPoint.x - p.point.x;
				const dy = movedPoint.y - p.point.y;
				const newItems = startItems.current.map((item, idx) => {
					if (item.id === movedId) {
						return { ...item, point: movedPoint };
					}

					const mustMove =
						(i === 0 && idx === 1) ||
						(i === items.length - 1 && idx === items.length - 2);

					if (mustMove) {
						const direction = calcRadian(p.point, item.point);
						const degrees = radiansToDegrees(direction);
						const isVertical = (degrees + 405) % 180 > 90;

						return {
							...item,
							point: {
								x:
									!isVertical && isVerticalHorizontalLines.current
										? item.point.x + dx
										: item.point.x,
								y:
									isVertical && isVerticalHorizontalLines.current
										? item.point.y + dy
										: item.point.y,
							},
						};
					}

					return item;
				});
				onGroupDataChange?.({
					id,
					items: newItems,
				});
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
	}, [onGroupDataChange, id, items]);

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
			fill={fill}
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
