import { memo, type ReactElement } from "react";

import { StyledCircle } from "./ProcessIndicatorStyled";
import type {
	ProcessItem,
	ProcessStatus,
} from "../../../types/core/ProcessItem";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { rotatePoint } from "../../../utils/math/points/rotatePoint";

type ProcessIndicatorProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	processes: ProcessItem[];
};

const getStatusColor = (status: ProcessStatus): string => {
	switch (status) {
		case "processing":
			return "#64748b";
		case "success":
			return "#3b82f6";
		case "failed":
			return "#ef4444";
		default:
			return "transparent";
	}
};

const calculatePositions = (
	centerX: number,
	centerY: number,
	width: number,
	height: number,
	rotation: number,
	count: number,
): Array<{ x: number; y: number }> => {
	if (count === 0) return [];

	const positions: Array<{ x: number; y: number }> = [];
	const radius = 8; // アイコンの半径
	const padding = 4; // ノードとアイコンの間の余白
	const iconSpacing = radius * 2 + 4; // アイコン間の間隔

	// ノードの境界を計算
	const halfWidth = width / 2;
	const halfHeight = height / 2;

	// 最初のアイコンを左上角に配置
	const startX = centerX - halfWidth - padding - radius;
	const startY = centerY - halfHeight - padding - radius;

	// 配置順序を定義（左上から時計回りに隣接配置）
	const placements = [
		// 1個目: 左上角
		{ dx: 0, dy: 0 },
		// 2個目: 上辺（右隣）
		{ dx: iconSpacing, dy: 0 },
		// 3個目: 上辺（さらに右隣）
		{ dx: iconSpacing * 2, dy: 0 },
		// 4個目: 上辺右端付近
		{ dx: halfWidth * 2 + padding + radius, dy: 0 },
		// 5個目: 右上角
		{ dx: halfWidth * 2 + padding * 2 + radius * 2, dy: 0 },
		// 6個目: 右辺（下隣）
		{ dx: halfWidth * 2 + padding * 2 + radius * 2, dy: iconSpacing },
		// 7個目: 右辺（さらに下隣）
		{ dx: halfWidth * 2 + padding * 2 + radius * 2, dy: iconSpacing * 2 },
		// 8個目: 右下角
		{
			dx: halfWidth * 2 + padding * 2 + radius * 2,
			dy: halfHeight * 2 + padding + radius,
		},
		// 9個目: 下辺（左隣）
		{
			dx: halfWidth * 2 + padding + radius,
			dy: halfHeight * 2 + padding * 2 + radius * 2,
		},
		// 10個目: 下辺（さらに左隣）
		{ dx: iconSpacing * 2, dy: halfHeight * 2 + padding * 2 + radius * 2 },
		// 11個目: 下辺
		{ dx: iconSpacing, dy: halfHeight * 2 + padding * 2 + radius * 2 },
		// 12個目: 左下角
		{ dx: 0, dy: halfHeight * 2 + padding * 2 + radius * 2 },
		// 13個目: 左辺（上隣）
		{ dx: 0, dy: halfHeight * 2 + padding + radius },
		// 14個目: 左辺（さらに上隣）
		{ dx: 0, dy: iconSpacing * 2 },
		// 15個目: 左辺
		{ dx: 0, dy: iconSpacing },
		// 16個目以降は外周に配置
	];

	for (let i = 0; i < count; i++) {
		let x: number, y: number;

		if (i < placements.length) {
			// 事前定義された配置を使用
			const placement = placements[i];
			x = startX + placement.dx;
			y = startY + placement.dy;
		} else {
			// 16個目以降は外周に等間隔で配置
			const circumferenceRadius =
				Math.max(halfWidth, halfHeight) + padding + radius + iconSpacing * 2;
			const angle =
				((i - placements.length) * 2 * Math.PI) /
				Math.max(1, count - placements.length);
			x = centerX + circumferenceRadius * Math.cos(angle - Math.PI / 2); // -π/2で上から開始
			y = centerY + circumferenceRadius * Math.sin(angle - Math.PI / 2);
		}

		// Apply rotation around the center point
		const rotated = rotatePoint(
			x,
			y,
			centerX,
			centerY,
			degreesToRadians(rotation),
		);
		positions.push(rotated);
	}

	return positions;
};

const ProcessIndicatorComponent = ({
	x,
	y,
	width,
	height,
	rotation,
	processes,
}: ProcessIndicatorProps): ReactElement => {
	const positions = calculatePositions(
		x,
		y,
		width,
		height,
		rotation,
		processes.length,
	);

	return (
		<g>
			{processes.map((process, index) => {
				const position = positions[index];
				if (!position) return null;

				return (
					<StyledCircle
						key={process.id}
						cx={position.x}
						cy={position.y}
						r={8}
						statusColor={getStatusColor(process.status)}
						isProcessing={process.status === "processing"}
					/>
				);
			})}
		</g>
	);
};

export const ProcessIndicator = memo(ProcessIndicatorComponent);
