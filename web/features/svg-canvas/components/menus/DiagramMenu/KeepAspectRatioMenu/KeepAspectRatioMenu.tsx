import type React from "react";
import { memo } from "react";

import { AspectRatio } from "../../../icons/AspectRatio";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type KeepAspectRatioMenuProps = {
	isActive: boolean;
	onClick: () => void;
	isHidden?: boolean;
};

const KeepAspectRatioMenuComponent: React.FC<KeepAspectRatioMenuProps> = ({
	isActive,
	onClick,
	isHidden = false,
}) => {
	return (
		<DiagramMenuItemNew
			isActive={isActive}
			onClick={onClick}
			isHidden={isHidden}
		>
			<AspectRatio width={22} height={22} title="Keep Aspect Ratio" />
		</DiagramMenuItemNew>
	);
};

export const KeepAspectRatioMenu = memo(KeepAspectRatioMenuComponent);
