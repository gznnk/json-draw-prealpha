// Import React.
import type React from "react";
import { memo } from "react";

// Import local module files.
import { HeaderContainer, HeaderTitle, HeaderControls } from "./HeaderStyled";

/**
 * Props for the HeaderComponent.
 */
type HeaderProps = {
	/**
	 * The height of the header in pixels.
	 * This value will be used to set the height of the header container.
	 */
	height?: number;
};

/**
 * Header component that appears at the top of the application.
 * This component provides navigation and app-level controls.
 *
 * @param props - Component props
 * @returns ReactElement representing the header
 */
const HeaderComponent: React.FC<HeaderProps> = ({ height = 30 }) => {
	return (
		<HeaderContainer height={height}>
			<HeaderTitle>Header</HeaderTitle>
			<HeaderControls>
				{/* ヘッダーの右側にはコントロールを配置できます */}
			</HeaderControls>
		</HeaderContainer>
	);
};

export const Header = memo(HeaderComponent);
