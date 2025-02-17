import type React from "react";
import classnames from "classnames";

type ButtonProps = {
	onClick: () => void;
	children: React.ReactNode;
	disabled?: boolean;
	visible?: boolean;
	className?: string;
};

const Button: React.FC<ButtonProps> = ({
	onClick,
	children,
	disabled = false,
	visible = true,
	className = "",
}) => {
	if (!visible) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={classnames("btn", className)}
		>
			{children}
		</button>
	);
};

export default Button;
