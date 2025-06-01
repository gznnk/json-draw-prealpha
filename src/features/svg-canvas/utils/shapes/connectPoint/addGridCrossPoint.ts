import type { GridPoint } from "../../../components/shapes/ConnectPoint/ConnectPoint/ConnectPointTypes";

/**
 * Adds a grid cross point and creates intersection points with existing grid points.
 *
 * @param grid - The grid of points to add to
 * @param point - The point to add to the grid
 */
export const addGridCrossPoint = (grid: GridPoint[], point: GridPoint) => {
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
