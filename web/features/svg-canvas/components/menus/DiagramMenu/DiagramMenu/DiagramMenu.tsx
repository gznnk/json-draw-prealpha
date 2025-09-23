import type React from "react";
import { memo, useRef, useEffect, useState } from "react";

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
import { DISTANCE_FROM_DIAGRAM } from "../../../../constants/styling/menus/DiagramMenuStyling";
import type { RectangleVertices } from "../../../../types/core/RectangleVertices";
import { calcRectangleVertices } from "../../../../utils/math/geometry/calcRectangleVertices";
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
import { ColorPicker } from "../ColorPicker";
import { DiagramMenuItem } from "../DiagramMenuItem";
import { NumberStepper } from "../NumberStepper";

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
	containerWidth = 0,
	containerHeight = 0,
	minX = 0,
	minY = 0,
	onMenuClick,
	onBgColorChange,
	onBorderColorChange,
	onBorderRadiusChange,
	onFontSizeChange,
	onFontColorChange,
}) => {
	const menuRef = useRef<HTMLDivElement>(null);
	const [menuDimensions, setMenuDimensions] = useState({
		width: 0,
		height: 40,
	});

	// Update menu dimensions when DOM changes
	useEffect(() => {
		if (menuRef.current && isVisible) {
			const rect = menuRef.current.getBoundingClientRect();
			setMenuDimensions({ width: rect.width, height: rect.height });
		}
	}, [isVisible, menuStateMap]);

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

	// Get diagram bottom Y position
	const diagramBottomY = Object.keys(vertices).reduce((max, key) => {
		const vertex = vertices[key as keyof RectangleVertices];
		return Math.max(max, vertex.y);
	}, Number.NEGATIVE_INFINITY);

	// Get diagram center X position
	const diagramCenterX = x;

	// Calculate menu position with viewport constraints
	const calculateMenuPosition = (): { x: number; y: number } => {
		const menuWidth = menuDimensions.width;
		const menuHeight = menuDimensions.height;

		// Default position: below the diagram, centered
		let menuX = diagramCenterX - menuWidth / 2;
		let menuY = diagramBottomY + DISTANCE_FROM_DIAGRAM;

		// Check if menu overflows viewport horizontally
		const viewportRight = minX + containerWidth;
		if (menuX + menuWidth > viewportRight) {
			// Adjust to fit within right boundary
			menuX = viewportRight - menuWidth;
		}
		if (menuX < minX) {
			// Adjust to fit within left boundary
			menuX = minX;
		}

		// Check if menu overflows viewport vertically (bottom)
		const viewportBottom = minY + containerHeight;
		if (menuY + menuHeight > viewportBottom) {
			// Position above the diagram
			const diagramTopY = Object.keys(vertices).reduce((min, key) => {
				const vertex = vertices[key as keyof RectangleVertices];
				return Math.min(min, vertex.y);
			}, Number.POSITIVE_INFINITY);
			menuY = diagramTopY - DISTANCE_FROM_DIAGRAM - menuHeight;
		}

		// Ensure menu doesn't go above viewport
		if (menuY < minY) {
			menuY = minY;
		}

		return { x: menuX, y: menuY };
	};

	const menuPosition = calculateMenuPosition();

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
					<BgColor title="Background Color" />
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
					<Edit title="Border Color" />
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
					<BorderRadius title="Border Radius" />
				</DiagramMenuItem>
				{menuStateMap.BorderRadius === "Active" && (
					<NumberStepper
						value={borderRadius}
						min={MIN_BORDER_RADIUS}
						max={MAX_BORDER_RADIUS}
						minusTooltip="Decrease border radius"
						plusTooltip="Increase border radius"
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
					<FontSize title="Font Size" />
				</DiagramMenuItem>
				{menuStateMap.FontSize === "Active" && (
					<NumberStepper
						value={fontSize}
						min={MIN_FONT_SIZE}
						max={MAX_FONT_SIZE}
						minusTooltip="Decrease font size"
						plusTooltip="Increase font size"
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
					<FontColor title="Font Color" />
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
				<Bold title="Bold" />
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
				<AlignLeft title="Align Left" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignCenter"
				menuType="AlignCenter"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<AlignCenter title="Align Center" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignRight"
				menuType="AlignRight"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<AlignRight title="Align Right" />
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
				<VerticalAlignTop title="Align Top" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignMiddle"
				menuType="AlignMiddle"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<VerticalAlignMiddle title="Align Middle" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="AlignBottom"
				menuType="AlignBottom"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<VerticalAlignBottom title="Align Bottom" />
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
				<BringToFront title="Bring to Front" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="BringForward"
				menuType="BringForward"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<BringForward title="Bring Forward" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="SendBackward"
				menuType="SendBackward"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<SendBackward title="Send Backward" />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(
			<DiagramMenuItem
				key="SendToBack"
				menuType="SendToBack"
				menuStateMap={menuStateMap}
				onMenuClick={onMenuClick}
			>
				<SendToBack title="Send to Back" />
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
				<AspectRatio width={22} height={22} title="Keep Aspect Ratio" />
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
				<Group title={menuStateMap.Group === "Active" ? "Ungroup" : "Group"} />
			</DiagramMenuItem>,
		);
		menuItemComponents.push(<DiagramMenuDivider key="GroupSectionDivider" />);
	}

	// Remove the last divider.
	menuItemComponents.pop();

	return (
		<DiagramMenuWrapper x={menuPosition.x} y={menuPosition.y}>
			<DiagramMenuDiv ref={menuRef}>
				{menuItemComponents.map((component) => component)}
			</DiagramMenuDiv>
		</DiagramMenuWrapper>
	);
};

export const DiagramMenu = memo(DiagramMenuComponent);
