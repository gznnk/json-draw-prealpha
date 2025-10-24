import type React from "react";
import { memo } from "react";

import {
	PathTypeButton,
	PathTypeSelectorWrapper,
} from "./PathTypeSelectorStyled";
import type { PathType } from "../../../../types/core/PathType";

type PathTypeSelectorProps = {
	value: PathType;
	onChange: (value: PathType) => void;
};

const PathTypeSelectorComponent: React.FC<PathTypeSelectorProps> = ({
	value,
	onChange,
}) => {
	return (
		<PathTypeSelectorWrapper>
			<PathTypeButton
				isActive={value === "Linear"}
				onClick={() => onChange("Linear")}
				title="Linear path"
			>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<path
						d="M 6,12 L 18,12"
						stroke="currentColor"
						strokeWidth="2"
						fill="none"
					/>
					<circle cx="6" cy="12" r="2" fill="currentColor" />
					<circle cx="18" cy="12" r="2" fill="currentColor" />
				</svg>
			</PathTypeButton>
			<PathTypeButton
				isActive={value === "Bezier"}
				onClick={() => onChange("Bezier")}
				title="Bezier path"
			>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<path
						d="M 6,16 Q 12,6 18,16"
						stroke="currentColor"
						strokeWidth="2"
						fill="none"
					/>
					<circle cx="6" cy="16" r="2" fill="currentColor" />
					<circle cx="18" cy="16" r="2" fill="currentColor" />
				</svg>
			</PathTypeButton>
			<PathTypeButton
				isActive={value === "Rounded"}
				onClick={() => onChange("Rounded")}
				title="Rounded path"
			>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<path
						d="M 6,16 L 10,16 Q 12,16 12,14 L 12,10 Q 12,8 14,8 L 18,8"
						stroke="currentColor"
						strokeWidth="2"
						fill="none"
					/>
					<circle cx="6" cy="16" r="2" fill="currentColor" />
					<circle cx="18" cy="8" r="2" fill="currentColor" />
				</svg>
			</PathTypeButton>
		</PathTypeSelectorWrapper>
	);
};

export const PathTypeSelector = memo(PathTypeSelectorComponent);
