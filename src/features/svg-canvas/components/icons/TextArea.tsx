// Import React.
import { memo } from "react";

/**
 * Props for TextArea icon
 */
type TextAreaProps = {
	width?: number;
	height?: number;
	fill?: string;
	title?: string;
};

/**
 * TextArea icon component
 */
export const TextArea = memo<TextAreaProps>(
	({ width = 24, height = 24, fill = "#000000", title = "TextArea" }) => {
		return (
			<svg
				width={width}
				height={height}
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>{title}</title>
				<g fill={fill}>
					{/* Outer rectangle representing textarea border */}
					<rect
						x="2"
						y="3"
						width="20"
						height="18"
						rx="2"
						ry="2"
						fill="none"
						stroke={fill}
						strokeWidth="1.5"
					/>
					{/* Text lines */}
					<line x1="5" y1="7" x2="19" y2="7" stroke={fill} strokeWidth="1" />
					<line x1="5" y1="10" x2="16" y2="10" stroke={fill} strokeWidth="1" />
					<line x1="5" y1="13" x2="18" y2="13" stroke={fill} strokeWidth="1" />
					<line x1="5" y1="16" x2="14" y2="16" stroke={fill} strokeWidth="1" />
					{/* Resize handle in bottom right corner */}
					<g>
						<line
							x1="18"
							y1="19"
							x2="20"
							y2="17"
							stroke={fill}
							strokeWidth="1"
						/>
						<line
							x1="19"
							y1="19"
							x2="21"
							y2="17"
							stroke={fill}
							strokeWidth="1"
						/>
						<line
							x1="20"
							y1="19"
							x2="22"
							y2="17"
							stroke={fill}
							strokeWidth="1"
						/>
					</g>
				</g>
			</svg>
		);
	},
);
