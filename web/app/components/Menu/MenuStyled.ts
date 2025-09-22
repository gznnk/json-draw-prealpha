import styled from "@emotion/styled";

/**
 * Container component for the menu.
 * Defines the styling and layout for the menu bar.
 */
export const MenuContainer = styled.div`
	display: flex;
	align-items: center;
	position: relative;
	height: 100%;
`;

/**
 * Individual menu item component.
 * Displays each menu option (File, Help, etc.)
 */
export const MenuItem = styled.div<{ isActive: boolean }>`
	padding: 6px 12px;
	cursor: pointer;
	background-color: ${(props) => (props.isActive ? "#374151" : "transparent")};
	color: #374151;
	border-radius: 2px;
	font-size: 12px;
	position: relative;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: #374151;
		color: #ffffff;
	}

	user-select: none;
`;

/**
 * Dropdown menu container.
 * Contains dropdown items for each menu.
 */
export const MenuDropdown = styled.div`
	position: absolute;
	top: 100%;
	left: 0;
	background-color: #ffffff;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	min-width: 120px;
	z-index: 9999;
	padding: 4px 0;
	margin-top: 2px;
`;

/**
 * Individual dropdown item component.
 * Displays each action option within a dropdown menu.
 */
export const MenuDropdownItem = styled.div`
	padding: 8px 16px;
	cursor: pointer;
	color: #374151;
	font-size: 12px;
	background-color: transparent;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: #f3f4f6;
	}

	user-select: none;
`;