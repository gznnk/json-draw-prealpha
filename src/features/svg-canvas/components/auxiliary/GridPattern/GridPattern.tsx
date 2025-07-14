import { memo } from "react";

type GridPatternProps = {
	gridSize?: number;
};

/**
 * SVG grid pattern component using pattern element.
 */
const GridPatternComponent = ({
	gridSize = 20,
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
					stroke="rgba(0, 0, 0, 0.1)"
					strokeWidth="1"
				/>
			</pattern>
		</defs>
	);
};

export const GridPattern = memo(GridPatternComponent);
