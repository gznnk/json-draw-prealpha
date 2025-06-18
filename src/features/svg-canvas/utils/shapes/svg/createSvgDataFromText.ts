// Import related functions.
import { createSvgData } from "./createSvgData";

/**
 * Creates svg data from an SVG text string.
 *
 * @param data - The SVG text
 * @returns The created SvgData or undefined if parsing fails
 */
export const createSvgDataFromText = (data: string) => {
    try {
        return createSvgData({
            x: 0,
            y: 0,
            svgText: data,
            width: 100,
            height: 100,
            keepProportion: true,
        });
    } catch (e) {
        console.error("Error parsing SVG data:", e);
        return undefined;
    }
};
