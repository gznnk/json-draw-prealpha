import type { StrokableData } from "../../../types/data/core/StrokableData";

/**
 * Default strokable data template.
 * Used for State to Data conversion mapping.
 */
export const StrokableDefaultData = {
	stroke: "#000000",
	strokeWidth: "1px",
} as const satisfies StrokableData;
