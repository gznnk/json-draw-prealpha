// Reactのインポート
import type React from "react";
import { memo } from "react";

// SvgCanvas関連コンポーネントをインポート
import Path from "../diagram/Path";

// SvgCanvas関連型定義をインポート
import type {
	ConnectLineData,
	DiagramBaseProps,
	TransformativeProps,
} from "../../types/DiagramTypes";
import type { GroupDataChangeEvent } from "../../types/EventTypes";

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
