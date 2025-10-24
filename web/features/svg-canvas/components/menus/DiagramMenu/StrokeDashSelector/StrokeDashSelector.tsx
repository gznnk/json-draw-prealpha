import type React from "react";
import { memo } from "react";

import {
	StrokeDashButton,
	StrokeDashSelectorWrapper,
} from "./StrokeDashSelectorStyled";
import type { StrokeDashType } from "../../../../types/core/StrokeDashType";

type StrokeDashSelectorProps = {
	value: StrokeDashType;
	onChange: (value: StrokeDashType) => void;
};

const StrokeDashSelectorComponent: React.FC<StrokeDashSelectorProps> = ({
	value,
	onChange,
}) => {
	return (
		<StrokeDashSelectorWrapper>
			<StrokeDashButton
				isActive={value === "solid"}
				onClick={() => onChange("solid")}
				title="Solid line"
			>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<line
						x1="4"
						y1="12"
						x2="20"
						y2="12"
						stroke="currentColor"
						strokeWidth="2"
					/>
				</svg>
			</StrokeDashButton>
			<StrokeDashButton
				isActive={value === "dashed"}
				onClick={() => onChange("dashed")}
				title="Dashed line"
			>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<line
						x1="4"
						y1="12"
						x2="20"
						y2="12"
						stroke="currentColor"
						strokeWidth="2"
						strokeDasharray="4,2"
					/>
				</svg>
			</StrokeDashButton>
			<StrokeDashButton
				isActive={value === "dotted"}
				onClick={() => onChange("dotted")}
				title="Dotted line"
			>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<line
						x1="4"
						y1="12"
						x2="20"
						y2="12"
						stroke="currentColor"
						strokeWidth="2"
						strokeDasharray="1,2"
					/>
				</svg>
			</StrokeDashButton>
		</StrokeDashSelectorWrapper>
	);
};

export const StrokeDashSelector = memo(StrokeDashSelectorComponent);
