import { memo } from "react";

type GridPatternProps = {
	gridSize?: number;
	color?: string;
};

/**
 * SVG grid pattern component using pattern element.
 */
const GridPatternComponent = ({
	gridSize = 20,
	color = "rgba(24, 144, 255, 0.1)",
}: GridPatternProps): React.JSX.Element => {
	return (
		<defs>
			<pattern
				id="grid"
				width={gridSize}
				height={gridSize}
				patternUnits="userSpaceOnUse"
			>
				<path
					d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
					fill="none"
					stroke={color}
					strokeWidth="1"
				/>
			</pattern>
		</defs>
	);
};

export const GridPattern = memo(GridPatternComponent);
