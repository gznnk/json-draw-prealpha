import type React from "react";
import { memo } from "react";

import {
	StrokeWidthButton,
	StrokeWidthSelectorWrapper,
} from "./StrokeWidthSelectorStyled";

type StrokeWidthSelectorProps = {
	value: string; // e.g., "1px", "2px", "3px", "4px"
	onChange: (value: string) => void;
};

const strokeWidths = ["1px", "2px", "3px", "4px"] as const;

const StrokeWidthSelectorComponent: React.FC<StrokeWidthSelectorProps> = ({
	value,
	onChange,
}) => {
	return (
		<StrokeWidthSelectorWrapper>
			{strokeWidths.map((width) => (
				<StrokeWidthButton
					key={width}
					isActive={value === width}
					onClick={() => onChange(width)}
					title={`${width} line width`}
				>
					<svg width="24" height="24" viewBox="0 0 24 24">
						<line
							x1="4"
							y1="12"
							x2="20"
							y2="12"
							stroke="currentColor"
							strokeWidth={width}
							strokeLinecap="round"
						/>
					</svg>
				</StrokeWidthButton>
			))}
		</StrokeWidthSelectorWrapper>
	);
};

export const StrokeWidthSelector = memo(StrokeWidthSelectorComponent);
