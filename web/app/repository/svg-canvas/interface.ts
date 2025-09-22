import type { SvgCanvas } from "../../models/SvgCanvas";

export interface SvgCanvasRepository {
	getCanvasById(id: string): Promise<SvgCanvas | undefined>;
	updateCanvas(canvas: SvgCanvas): Promise<void>;
}
