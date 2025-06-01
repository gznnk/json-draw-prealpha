import { useCallback } from "react";
import type { SvgCanvas } from "../models/SvgCanvas";
import { createSvgCanvasRepository } from "../repository/svg-canvas/factory";
import type { SvgCanvasRepository } from "../repository/svg-canvas/interface";

// リポジトリインスタンスの生成
const svgCanvasRepository: SvgCanvasRepository = createSvgCanvasRepository();

export const useSvgCanvases = () => {
	const getCanvasById = useCallback(
		async (id: string): Promise<SvgCanvas | undefined> => {
			return await svgCanvasRepository.getCanvasById(id);
		},
		[],
	);

	const saveCanvas = useCallback(async (canvas: SvgCanvas): Promise<void> => {
		await svgCanvasRepository.updateCanvas(canvas);
	}, []);

	return {
		getCanvasById,
		saveCanvas,
	};
};
