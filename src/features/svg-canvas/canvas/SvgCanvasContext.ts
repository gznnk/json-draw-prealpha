// Import React.
import { createContext } from "react";

// Import SvgCanvas related type definitions
import type { Diagram } from "../types/data/catalog/Diagram";

// Import SvgCanvas related functions
import { getDiagramById } from "./utils/getDiagramById";

// Imports related to this component.
import type { SvgCanvasState } from "./SvgCanvasTypes";

/**
 * Class that provides SvgCanvas state across component hierarchy.
 */
export class SvgCanvasStateProvider {
	s: SvgCanvasState;
	constructor(state: SvgCanvasState) {
		this.s = state;
	}
	setState(state: SvgCanvasState) {
		// Currently treated as singleton, providing state update function
		this.s = state;
	}
	state(): SvgCanvasState {
		return this.s;
	}
	items(): Diagram[] {
		return this.s.items;
	}
	getDiagramById(id: string): Diagram | undefined {
		return getDiagramById(this.s.items, id);
	}
}

// Create context that holds SvgCanvasStateProvider to provide SvgCanvas state across component hierarchy
export const SvgCanvasContext = createContext<SvgCanvasStateProvider | null>(
	null,
);
