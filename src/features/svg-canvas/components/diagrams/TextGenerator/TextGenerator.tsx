// Import React.
import type React from "react";
import { memo } from "react";

// Import other libraries.
// import { OpenAI } from "openai";

// Import types related to SvgCanvas.
import type {
	CreateDiagramProps,
	TextGeneratorData,
} from "../../../types/DiagramTypes";

// Import components related to SvgCanvas.
import Rectangle from "../../shapes/Rectangle/Rectangle";
// import Textable from "../../../../../features/canvas/shapes/base/Textable";

// Import functions related to SvgCanvas.
// import { createSvgTransform } from "../../../utils/Diagram";
// import { degreesToRadians } from "../../../utils/Math";

// Import utilities.
// import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

type TextGeneratorProps = CreateDiagramProps<
	TextGeneratorData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		textable: true;
	}
>;

const TextGenerator: React.FC<TextGeneratorProps> = ({ ...props }) => {
	// const { x, y, width, height, rotation, scaleX, scaleY } = props;

	// const transform = createSvgTransform(
	// 	scaleX,
	// 	scaleY,
	// 	degreesToRadians(rotation),
	// 	x,
	// 	y,
	// );

	return (
		<>
			<Rectangle {...props} />
			{/** 
			<rect
				x={(-width * 0.8) / 2}
				y={(-height * 0.6) / 2}
				width={width * 0.8}
				height={height * 0.6}
				transform={transform}
				stroke="black"
				strokeWidth={1}
				fill="#eeeeee"
				pointerEvents="none"
			/>
			<Textable
				{...props}
				x={(-width * 0.8) / 2}
				y={(-height * 0.6) / 2}
				width={width * 0.8}
				height={height * 0.6}
				transform={transform}
			/>
            */}
		</>
	);
};

export default memo(TextGenerator);
