import type React from "react";
import { memo } from "react";

import {
	LineStyleMenuWrapper,
	LineStyleSection,
	LineStyleButton,
} from "./LineStyleMenuStyled";
import type { PathType } from "../../../../types/core/PathType";
import type { StrokeDashType } from "../../../../types/core/StrokeDashType";
import { LineStyle as LineStyleIcon } from "../../../icons/LineStyle";
import { DiagramMenuPositioner } from "../DiagramMenu/DiagramMenuStyled";
import { DiagramMenuControl } from "../DiagramMenuControl";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type LineStyleMenuProps = {
	isOpen: boolean;
	onToggle: () => void;
	strokeWidth: string;
	pathType: PathType;
	strokeDashType: StrokeDashType;
	onStrokeWidthChange: (value: string) => void;
	onPathTypeChange: (value: PathType) => void;
	onStrokeDashTypeChange: (value: StrokeDashType) => void;
};

const strokeWidths = ["1px", "2px", "3px", "4px"] as const;
const strokeDashTypes: StrokeDashType[] = ["solid", "dashed", "dotted"];

const LineStyleMenuComponent: React.FC<LineStyleMenuProps> = ({
	isOpen,
	onToggle,
	strokeWidth,
	pathType,
	strokeDashType,
	onStrokeWidthChange,
	onPathTypeChange,
	onStrokeDashTypeChange,
}) => {
	return (
		<DiagramMenuPositioner>
			<DiagramMenuItemNew isActive={isOpen} onClick={onToggle}>
				<LineStyleIcon title="Line Style" />
			</DiagramMenuItemNew>
			{isOpen && (
				<DiagramMenuControl>
					<LineStyleMenuWrapper>
						{/* Stroke Width */}
						<LineStyleSection>
							{strokeWidths.map((width) => (
								<LineStyleButton
									key={width}
									isActive={strokeWidth === width}
									onClick={() => onStrokeWidthChange(width)}
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
								</LineStyleButton>
							))}
						</LineStyleSection>

						{/* Path Type */}
						<LineStyleSection>
							<LineStyleButton
								isActive={pathType === "Linear"}
								onClick={() => onPathTypeChange("Linear")}
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
							</LineStyleButton>
							<LineStyleButton
								isActive={pathType === "Bezier"}
								onClick={() => onPathTypeChange("Bezier")}
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
							</LineStyleButton>
							<LineStyleButton
								isActive={pathType === "Rounded"}
								onClick={() => onPathTypeChange("Rounded")}
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
							</LineStyleButton>
						</LineStyleSection>

						{/* Stroke Dash Type */}
						<LineStyleSection>
							{strokeDashTypes.map((dashType) => (
								<LineStyleButton
									key={dashType}
									isActive={strokeDashType === dashType}
									onClick={() => onStrokeDashTypeChange(dashType)}
									title={`${dashType} line`}
								>
									<svg width="24" height="24" viewBox="0 0 24 24">
										<line
											x1="4"
											y1="12"
											x2="20"
											y2="12"
											stroke="currentColor"
											strokeWidth="2"
											strokeDasharray={
												dashType === "dashed"
													? "4,2"
													: dashType === "dotted"
														? "1,2"
														: undefined
											}
										/>
									</svg>
								</LineStyleButton>
							))}
						</LineStyleSection>
					</LineStyleMenuWrapper>
				</DiagramMenuControl>
			)}
		</DiagramMenuPositioner>
	);
};

export const LineStyleMenu = memo(LineStyleMenuComponent);
