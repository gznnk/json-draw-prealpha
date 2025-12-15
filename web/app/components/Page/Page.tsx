import type React from "react";
import { memo } from "react";

import { PageContainer } from "./PageStyled";
import { Body } from "../Body";
import { Header } from "../Header/Header";

/**
 * Constants related to the Page layout.
 */
export const PAGE_CONSTANTS = {
	/**
	 * Default header height in pixels.
	 */
	HEADER_HEIGHT: 30,
};

/**
 * Props for the PageComponent.
 */
type PageProps = {
	/**
	 * The height of the header in pixels.
	 */
	headerHeight?: number;
	/**
	 * The content to render inside the body.
	 */
	children?: React.ReactNode;
	/**
	 * Callback invoked when the save button is clicked
	 */
	onSave?: () => void;
};

/**
 * Page component that represents the entire application layout.
 * This component combines the Header and Body components.
 *
 * @param props - Component props
 * @returns ReactElement representing the entire page
 */
const PageComponent: React.FC<PageProps> = ({
	children,
	headerHeight = PAGE_CONSTANTS.HEADER_HEIGHT,
	onSave,
}) => {
	return (
		<PageContainer>
			<Header height={headerHeight} onSave={onSave} />
			<Body top={headerHeight}>{children}</Body>
		</PageContainer>
	);
};

export const Page = memo(PageComponent);
