// Import types.
import type { SvgData } from "../../../types/data/shapes/SvgData";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";

// Import constants from Svg component.
import { DEFAULT_SVG_DATA } from "../../../constants/DefaultData";

/**
 * Creates svg data with the specified properties.
 */
export const createSvgData = ({
    x,
    y,
    svgText,
    width = 100,
    height = 100,
    rotation = 0,
    scaleX = 1,
    scaleY = 1,
    keepProportion = false,
}: {
    x: number;
    y: number;
    svgText: string;
    width?: number;
    height?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    keepProportion?: boolean;
}): SvgData => {
    return {
        ...DEFAULT_SVG_DATA,
        id: newId(),
        x,
        y,
        svgText,
        width,
        height,
        rotation,
        scaleX,
        scaleY,
        keepProportion,
        initialWidth: width,
        initialHeight: height,
    } as SvgData;
};
