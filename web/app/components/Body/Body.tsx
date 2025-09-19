import type React from "react";
import { memo } from "react";

import { BodyContainer } from "./BodyStyled";

/**
 * Props for the BodyComponent.
 */
type BodyProps = {
	/**
	 * The top position of the body in pixels.
	 * This will be used to position the body below the header.
	 */
	top?: number;
	/**
	 * The content to render inside the body.
	 */
	children?: React.ReactNode;
};

/**
 * Body component that contains the main content of the application.
 * This component is positioned below the header.
 *
 * @param props - Component props
 * @returns ReactElement representing the body content area
 */
const BodyComponent: React.FC<BodyProps> = ({ top = 0, children }) => {
	return <BodyContainer top={top}>{children}</BodyContainer>;
};

export const Body = memo(BodyComponent);
