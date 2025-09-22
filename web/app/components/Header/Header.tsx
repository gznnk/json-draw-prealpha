import type React from "react";
import { memo } from "react";

import { HeaderContainer, HeaderTitle } from "./HeaderStyled";
import { Menu } from "../Menu/Menu";

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
	/**
	 * Callback invoked when new file is selected
	 */
	onNew?: () => void;
	/**
	 * Callback invoked when open file is selected
	 */
	onOpen?: () => void;
	/**
	 * Callback invoked when help is selected
	 */
	onHelp?: () => void;
};

/**
 * Header component that appears at the top of the application.
 * This component provides navigation and app-level controls.
 *
 * @param props - Component props
 * @returns ReactElement representing the header
 */
const HeaderComponent: React.FC<HeaderProps> = ({
	height = 30,
	onSave,
	onNew,
	onOpen,
	onHelp,
}) => {
	return (
		<HeaderContainer height={height}>
			<HeaderTitle />
			<Menu onNew={onNew} onOpen={onOpen} onSave={onSave} onHelp={onHelp} />
		</HeaderContainer>
	);
};

export const Header = memo(HeaderComponent);
