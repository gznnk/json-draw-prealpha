// Import React.
import type React from "react";
import { memo } from "react";

// Import components related to SvgCanvas.
import { AspectRatio } from "../../../icons/AspectRatio";
import { AlignCenter } from "../../../icons/AlignCenter";
import { AlignLeft } from "../../../icons/AlignLeft";
import { AlignRight } from "../../../icons/AlignRight";
import { BgColor } from "../../../icons/BgColor";
import { Border } from "../../../icons/Border";
import { Bold } from "../../../icons/Bold";
import { FontColor } from "../../../icons/FontColor";
import { FontSize } from "../../../icons/FontSize";
import { VerticalAlignBottom } from "../../../icons/VerticalAlignBottom";
import { VerticalAlignMiddle } from "../../../icons/VerticalAlignMiddle";
import { VerticalAlignTop } from "../../../icons/VerticalAlignTop";
import { Group } from "../../../icons/Group";

// Import types related to SvgCanvas.
import type { RectangleVertices } from "../../../../types/CoordinateTypes";

// Import functions related to SvgCanvas.
import { calcRectangleVertices } from "../../../../utils/Math";

// Imports related to this component.
import { DiagramMenuItem } from "../DiagramMenuItem/DiagramMenuItem";
import {
	DiagramMenuDiv,
	DiagramMenuDivider,
	DiagramMenuWrapper,
} from "./DiagramMenuStyled";
import type { DiagramMenuProps } from "./DiagramMenuTypes";

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
	onMenuClick,
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

	return (
		<DiagramMenuWrapper x={x} y={menuY}>
			<DiagramMenuDiv>
				<DiagramMenuItem
					menuType="BgColor"
					tooltip="背景色"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<BgColor />
				</DiagramMenuItem>
				<DiagramMenuItem
					menuType="BorderColor"
					tooltip="枠線の色"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<Border />
				</DiagramMenuItem>
				<DiagramMenuDivider />
				<DiagramMenuItem
					menuType="FontSize"
					tooltip="フォントサイズ"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<FontSize />
				</DiagramMenuItem>
				<DiagramMenuItem
					menuType="Bold"
					tooltip="太字"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<Bold />
				</DiagramMenuItem>
				<DiagramMenuItem
					menuType="FontColor"
					tooltip="フォントの色"
					menuStateMap={menuStateMap}
					onMenuClick={onMenuClick}
				>
					<FontColor />
				</DiagramMenuItem>
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
				{menuStateMap.KeepAspectRatio !== "Hidden" && (
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
				{menuStateMap.Group !== "Hidden" && (
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
