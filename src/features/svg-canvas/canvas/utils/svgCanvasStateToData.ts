import type { SvgCanvasData, SvgCanvasState } from "../SvgCanvasTypes";

/**
 * SvgCanvasState から SvgCanvasData への変換関数。
 * SvgCanvasData に含まれる必要なプロパティのみを抽出します。
 *
 * @param state - 変換元のSvgCanvasState
 * @returns SvgCanvasDataオブジェクト
 */
export const svgCanvasStateToData = (state: SvgCanvasState): SvgCanvasData => {
	return {
		id: state.id,
		minX: state.minX,
		minY: state.minY,
		items: state.items,
	};
};
