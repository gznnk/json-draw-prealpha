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
import { BorderRadius } from "../../../icons/BorderRadius";
import { BringForward } from "../../../icons/BringForward";
import { BringToFront } from "../../../icons/BringToFront";
import { Edit } from "../../../icons/Edit";
import { FontColor } from "../../../icons/FontColor";
import { FontSize } from "../../../icons/FontSize";
import { Group } from "../../../icons/Group";
import { SendBackward } from "../../../icons/SendBackward";
import { SendToBack } from "../../../icons/SendToBack";
import { VerticalAlignBottom } from "../../../icons/VerticalAlignBottom";
import { VerticalAlignMiddle } from "../../../icons/VerticalAlignMiddle";
import { VerticalAlignTop } from "../../../icons/VerticalAlignTop";

// Import types related to SvgCanvas.
import type { RectangleVertices } from "../../../../types/CoordinateTypes";

// Import functions related to SvgCanvas.
import { calcRectangleVertices } from "../../../../utils/Math";

// Imports related to this component.
import { ColorPicker } from "../ColorPicker";
import { DiagramMenuItem } from "../DiagramMenuItem";
import { NumberStepper } from "../NumberStepper";
import {
	MAX_BORDER_RADIUS,
	MAX_FONT_SIZE,
	MIN_BORDER_RADIUS,
	MIN_FONT_SIZE,
} from "./DiagramMenuConstants";
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
	borderRadius,
	fontSize,
	fontColor,
	onMenuClick,
	onBgColorChange,
	onBorderColorChange,
	onBorderRadiusChange,
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

	// Calculate the menu Y position based on the vertices of the rectangle.
	const menuY =
		Object.keys(vertices).reduce((max, key) => {
			const vertex = vertices[key as keyof RectangleVertices];
			return Math.max(max, vertex.y);
		}, Number.NEGATIVE_INFINITY) + 20;

	/**
	 * Check if the menu section should be shown based on the menu types provided.
	 *
	 * @param menuTypes - An array of menu types to check.
	 * @returns {boolean} - Returns true if any of the menu types are not "Hidden", otherwise false.
	 */
	const showSection = (...menuTypes: DiagramMenuType[]) => {
		return menuTypes.some((menuType) => menuStateMap[menuType] !== "Hidden");
	};

	// Array to hold the menu item components.
	// This will be used to render the menu items conditionally based on the state map.
	const menuItemComponents = [];

	// Create a section for fillable and strokable items.
	const showFillableAndStrokableSection = showSection(
		"BgColor",
		"BorderColor",
		"BorderRadius",
	);
	if (showFillableAndStrokableSection) {
		menuItemComponents.push(
			<DiagramMenuPositioner key="BgColor">
				<DiagramMenuItem
					menuType="BgColor"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<BgColor title="背景色" />
				</DiagramMenuItem>
				{menuStateMap.BgColor === "Active" && (
					<ColorPicker color={bgColor} onColorChange={onBgColorChange} />
				)}
			</DiagramMenuPositioner>,
		);
		menuItemComponents.push(
			<DiagramMenuPositioner key="BorderColor">
				<DiagramMenuItem
					menuType="BorderColor"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<Edit title="枠線の色" />
				</DiagramMenuItem>
				{menuStateMap.BorderColor === "Active" && (
					<ColorPicker
						color={borderColor}
						onColorChange={onBorderColorChange}
					/>
				)}
			</DiagramMenuPositioner>,
		);
		menuItemComponents.push(
			<DiagramMenuPositioner key="BorderRadius">
				<DiagramMenuItem
					menuType="BorderRadius"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<BorderRadius title="角丸" />
				</DiagramMenuItem>
				{menuStateMap.BorderRadius === "Active" && (
					<NumberStepper
						value={borderRadius}
						min={MIN_BORDER_RADIUS}
						max={MAX_BORDER_RADIUS}
						minusTooltip="角丸を縮小"
						plusTooltip="角丸を拡大"
						onChange={onBorderRadiusChange}
					/>
				)}
			</DiagramMenuPositioner>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="FillableAndStrokableSectionDivider" />,
		);
	}

	// Create a section for text appearance items.
	const showTextAppearanceSection = showSection(
		"FontSize",
		"FontColor",
		"Bold",
	);
	if (showTextAppearanceSection) {
		menuItemComponents.push(
			<DiagramMenuPositioner key="FontSize">
				<DiagramMenuItem
					menuType="FontSize"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<FontSize title="フォントサイズ" />
				</DiagramMenuItem>
				{menuStateMap.FontSize === "Active" && (
					<NumberStepper
						value={fontSize}
						min={MIN_FONT_SIZE}
						max={MAX_FONT_SIZE}
						minusTooltip="フォントサイズを縮小"
						plusTooltip="フォントサイズを拡大"
						onChange={onFontSizeChange}
					/>
				)}
			</DiagramMenuPositioner>,
		);
		menuItemComponents.push(
			<DiagramMenuPositioner key="FontColor">
				<DiagramMenuItem
					menuType="FontColor"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<FontColor title="フォントの色" />
				</DiagramMenuItem>
				{menuStateMap.FontColor === "Active" && (
					<ColorPicker color={fontColor} onColorChange={onFontColorChange} />
				)}
			</DiagramMenuPositioner>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="Bold"
				menuType="Bold"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<Bold title="太字" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="TextAppearanceSectionDivider" />,
		);
	}

	// Create a section for text alignment items.
	const showTextAlignmentSection = showSection(
		"AlignLeft",
		"AlignCenter",
		"AlignRight",
	);
	if (showTextAlignmentSection) {
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignLeft"
				menuType="AlignLeft"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<AlignLeft title="左揃え" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignCenter"
				menuType="AlignCenter"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<AlignCenter title="中央揃え" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignRight"
				menuType="AlignRight"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<AlignRight title="右揃え" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="TextAlignmentSectionDivider" />,
		);
	}

	// Create a section for text vertical alignment items.
	const showTextVerticalAlignmentSection = showSection(
		"AlignTop",
		"AlignMiddle",
		"AlignBottom",
	);
	if (showTextVerticalAlignmentSection) {
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignTop"
				menuType="AlignTop"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<VerticalAlignTop title="上揃え" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignMiddle"
				menuType="AlignMiddle"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<VerticalAlignMiddle title="中央揃え" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignBottom"
				menuType="AlignBottom"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<VerticalAlignBottom title="下揃え" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="TextVerticalAlignmentSectionDivider" />,
		);
	}

	// Create a section for bring to front and send to back items.
	const showBringToFrontSection = showSection(
		"BringToFront",
		"BringForward",
		"SendBackward",
		"SendToBack",
	);
	if (showBringToFrontSection) {
		menuItemComponents.push(
			<DiagramMenuItem
				key="BringToFront"
				menuType="BringToFront"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<BringToFront title="最前面に移動" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="BringForward"
				menuType="BringForward"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<BringForward title="前面に移動" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="SendBackward"
				menuType="SendBackward"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<SendBackward title="背面に移動" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="SendToBack"
				menuType="SendToBack"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<SendToBack title="最背面に移動" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="BringToFrontSectionDivider" />,
		);
	}

	// Create a section for keep aspect ratio items.
	const showKeepAspectRatioSection = showSection("KeepAspectRatio");
	if (showKeepAspectRatioSection) {
		menuItemComponents.push(
			<DiagramMenuItem
				key="KeepAspectRatio"
				menuType="KeepAspectRatio"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<AspectRatio width={22} height={22} title="アスペクト比維持" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuDivider key="KeepAspectRatioSectionDivider" />,
		);
	}

	// Create a section for group and ungroup items.
	const showGroupSection = showSection("Group");
	if (showGroupSection) {
		menuItemComponents.push(
			<DiagramMenuItem
				key="Group"
				menuType="Group"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<Group
					title={
						menuStateMap.Group === "Active" ? "グループ解除" : "グループ化"
					}
				/>
			</DiagramMenuItem>,
		);
		menuItemComponents.push(<DiagramMenuDivider key="GroupSectionDivider" />);
	}

	// Remove the last divider.
	menuItemComponents.pop();

	return (
		<DiagramMenuWrapper x={x} y={menuY}>
			<DiagramMenuDiv>
				{menuItemComponents.map((component) => component)}
			</DiagramMenuDiv>
		</DiagramMenuWrapper>
	);
};

export const DiagramMenu = memo(DiagramMenuComponent);
