// Import React.
import type React from "react";
import { memo } from "react";

// Import components related to SvgCanvas.
import { AlignCenter } from "../../../icons/AlignCenter";
import { AlignLeft } from "../../../icons/AlignLeft";
import { AlignRight } from "../../../icons/AlignRight";
import { AspectRatio } from "../../../icons/AspectRatio";
import { BgColor } from "../../../icons/BgColor";
import { Bold } from "../../../icons/Bold";
import { BringToFront } from "../../../icons/BringToFront";
import { BringForward } from "../../../icons/BringForward";
import { Edit } from "../../../icons/Edit";
import { FontColor } from "../../../icons/FontColor";
import { FontSize } from "../../../icons/FontSize";
import { Group } from "../../../icons/Group";
import { SendToBack } from "../../../icons/SendToBack";
import { VerticalAlignBottom } from "../../../icons/VerticalAlignBottom";
import { VerticalAlignMiddle } from "../../../icons/VerticalAlignMiddle";
import { VerticalAlignTop } from "../../../icons/VerticalAlignTop";
import { SendBackward } from "../../../icons/SendBackward";

// Import types related to SvgCanvas.
import type { RectangleVertices } from "../../../../types/CoordinateTypes";

// Import functions related to SvgCanvas.
import { calcRectangleVertices } from "../../../../utils/Math";

// Imports related to this component.
import { ColorPicker } from "../ColorPicker";
import { DiagramMenuItem } from "../DiagramMenuItem";
import { FontSizeSelector } from "../FontSizeSelector";
import {
	DiagramMenuDiv,
	DiagramMenuDivider,
	DiagramMenuPositioner,
	DiagramMenuWrapper,
} from "./DiagramMenuStyled";
import type { DiagramMenuProps, DiagramMenuType } from "./DiagramMenuTypes";

const DiagramMenuComponent: React.FC<DiagramMenuProps> = ({
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	isVisible,
	menuStateMap,
	bgColor,
	borderColor,
	fontSize,
	fontColor,
	onMenuClick,
	onBgColorChange,
	onBorderColorChange,
	onFontSizeChange,
	onFontColorChange,
}) => {
	if (!isVisible) return null;

	const vertices = calcRectangleVertices({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	const menuY =
		Object.keys(vertices).reduce((max, key) => {
			const vertex = vertices[key as keyof RectangleVertices];
			return Math.max(max, vertex.y);
		}, Number.NEGATIVE_INFINITY) + 20;

	const showSection = (...menuTypes: DiagramMenuType[]) => {
		return menuTypes.some((menuType) => menuStateMap[menuType] !== "Hidden");
	};

	const showFillableAndStrokableSection = showSection("BgColor", "BorderColor");
	const showTextAppearanceSection = showSection(
		"FontSize",
		"FontColor",
		"Bold",
	);
	const showTextAlignmentSection = showSection(
		"AlignLeft",
		"AlignCenter",
		"AlignRight",
	);
	const showTextVerticalAlignmentSection = showSection(
		"AlignTop",
		"AlignMiddle",
		"AlignBottom",
	);
	const showBringToFrontSection = showSection(
		"BringToFront",
		"BringForward",
		"SendBackward",
		"SendToBack",
	);
	const showKeepAspectRatioSection = showSection("KeepAspectRatio");
	const showGroupSection = showSection("Group");

	return (
		<DiagramMenuWrapper x={x} y={menuY}>
			<DiagramMenuDiv>
				{/* Section for fillable and strokable */}
				{showFillableAndStrokableSection && (
					<>
						<DiagramMenuPositioner>
							<DiagramMenuItem
								menuType="BgColor"
								tooltip="背景色"
								menuStateMap={menuStateMap}
								onMenuClick={onMenuClick}
							>
								<BgColor />
							</DiagramMenuItem>
							{menuStateMap.BgColor === "Active" && (
								<ColorPicker color={bgColor} onColorChange={onBgColorChange} />
							)}
						</DiagramMenuPositioner>
						<DiagramMenuPositioner>
							<DiagramMenuItem
								menuType="BorderColor"
								tooltip="枠線の色"
								menuStateMap={menuStateMap}
								onMenuClick={onMenuClick}
							>
								<Edit />
							</DiagramMenuItem>
							{menuStateMap.BorderColor === "Active" && (
								<ColorPicker
									color={borderColor}
									onColorChange={onBorderColorChange}
								/>
							)}
						</DiagramMenuPositioner>
					</>
				)}

				{/* Section for text appearance */}
				{showTextAppearanceSection && (
					<>
						<DiagramMenuDivider />
						<DiagramMenuPositioner>
							<DiagramMenuItem
								menuType="FontSize"
								tooltip="フォントサイズ"
								menuStateMap={menuStateMap}
								onMenuClick={onMenuClick}
							>
								<FontSize />
							</DiagramMenuItem>
							{menuStateMap.FontSize === "Active" && (
								<FontSizeSelector
									fontSize={fontSize}
									onFontSizeChange={onFontSizeChange}
								/>
							)}
						</DiagramMenuPositioner>
						<DiagramMenuItem
							menuType="Bold"
							tooltip="太字"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<Bold />
						</DiagramMenuItem>
						<DiagramMenuPositioner>
							<DiagramMenuItem
								menuType="FontColor"
								tooltip="フォントの色"
								menuStateMap={menuStateMap}
								onMenuClick={onMenuClick}
							>
								<FontColor />
							</DiagramMenuItem>
							{menuStateMap.FontColor === "Active" && (
								<ColorPicker
									color={fontColor}
									onColorChange={onFontColorChange}
								/>
							)}
						</DiagramMenuPositioner>
					</>
				)}

				{/* Section for text allignment */}
				{showTextAlignmentSection && (
					<>
						<DiagramMenuDivider />
						<DiagramMenuItem
							menuType="AlignLeft"
							tooltip="左揃え"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<AlignLeft />
						</DiagramMenuItem>
						<DiagramMenuItem
							menuType="AlignCenter"
							tooltip="中央揃え"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<AlignCenter />
						</DiagramMenuItem>
						<DiagramMenuItem
							menuType="AlignRight"
							tooltip="右揃え"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<AlignRight />
						</DiagramMenuItem>
					</>
				)}

				{/* Section for text vertical allignment */}
				{showTextVerticalAlignmentSection && (
					<>
						<DiagramMenuDivider />
						<DiagramMenuItem
							menuType="AlignTop"
							tooltip="上揃え"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<VerticalAlignTop />
						</DiagramMenuItem>
						<DiagramMenuItem
							menuType="AlignMiddle"
							tooltip="中央揃え"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<VerticalAlignMiddle />
						</DiagramMenuItem>
						<DiagramMenuItem
							menuType="AlignBottom"
							tooltip="下揃え"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<VerticalAlignBottom />
						</DiagramMenuItem>
					</>
				)}

				{/* Section for bring to front and send to back */}
				{showBringToFrontSection && (
					<>
						<DiagramMenuDivider />
						<DiagramMenuItem
							menuType="BringToFront"
							tooltip="最前面に移動"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<BringToFront />
						</DiagramMenuItem>
						<DiagramMenuItem
							menuType="BringForward"
							tooltip="前面に移動"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<BringForward />
						</DiagramMenuItem>
						<DiagramMenuItem
							menuType="SendBackward"
							tooltip="背面に移動"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<SendBackward />
						</DiagramMenuItem>
						<DiagramMenuItem
							menuType="SendToBack"
							tooltip="最背面に移動"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<SendToBack />
						</DiagramMenuItem>
					</>
				)}

				{/* Section for keep aspect ratio */}
				{showKeepAspectRatioSection && (
					<>
						<DiagramMenuDivider />
						<DiagramMenuItem
							menuType="KeepAspectRatio"
							tooltip="アスペクト比維持"
							viewBox="0 0 16 16"
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<AspectRatio />
						</DiagramMenuItem>
					</>
				)}
				{/* Section for group and ungroup */}
				{showGroupSection && (
					<>
						<DiagramMenuDivider />
						<DiagramMenuItem
							menuType="Group"
							tooltip={
								menuStateMap.Group === "Active" ? "グループ解除" : "グループ化"
							}
							menuStateMap={menuStateMap}
							onMenuClick={onMenuClick}
						>
							<Group />
						</DiagramMenuItem>
					</>
				)}
			</DiagramMenuDiv>
		</DiagramMenuWrapper>
	);
};

export const DiagramMenu = memo(DiagramMenuComponent);
