import type React from "react";
import { memo } from "react";

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
	/**
	 * Callback invoked when the save button is clicked
	 */
	onSave?: () => void;
};

/**
 * Header component that appears at the top of the application.
 * This component provides navigation and app-level controls.
 *
 * @param props - Component props
 * @returns ReactElement representing the header
 */
const HeaderComponent: React.FC<HeaderProps> = ({ height = 30, onSave }) => {
	return (
		<HeaderContainer height={height}>
			<HeaderTitle />
			<HeaderControls>
				{onSave && (
					<button
						type="button"
						onClick={onSave}
						style={{
							background: "#1890ff",
							color: "#FFFFFF",
							border: "none",
							borderRadius: "4px",
							padding: "4px 8px",
							cursor: "pointer",
							fontSize: "12px",
						}}
					>
						保存
					</button>
				)}
			</HeaderControls>
		</HeaderContainer>
	);
};

export const Header = memo(HeaderComponent);
