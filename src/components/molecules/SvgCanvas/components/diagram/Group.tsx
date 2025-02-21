import React from "react";
import { useRef, memo } from "react";
import RectangleBase from "../core/RectangleBase";
import type { ChangeEvent, Diagram } from "../../types";
import type { RectangleProps } from "./Rectangle";
import Rectangle from "./Rectangle";

import { ITEM_TYPE_COMPONENT_MAP } from "../SvgCanvas";

type GroupProps = RectangleProps & {
	items?: Diagram[];
};

const Group: React.FC<GroupProps> = memo(
	({
		id,
		point,
		width,
		height,
		keepProportion = false,
		tabIndex = 0,
		isSelected = false,
		onPointerDown,
		onChangeEnd,
		items = [],
	}) => {
		const ref = useRef<{
			[key: string]: {
				draggableRef: React.RefObject<SVGElement>;
				onParentChange: (e: ChangeEvent) => void;
			} | null;
		}>({});

		const createDiagram = (item: Diagram): React.ReactNode => {
			const itemType = ITEM_TYPE_COMPONENT_MAP[item.type];
			const props = {
				...item,
				key: item.id,
				ref: (r: {
					draggableRef: React.RefObject<SVGElement>;
					onParentChange: (e: ChangeEvent) => void;
				}) => {
					ref.current[item.id] = r;
				},
			};

			return React.createElement(itemType, props);
		};

		const children = items.map((item) => {
			return createDiagram(item);
		});

		return (
			<Rectangle
				id={id}
				point={point}
				width={width}
				height={height}
				tabIndex={tabIndex}
				strokeWidth={"0px"}
				keepProportion={keepProportion}
				isSelected={isSelected}
				onPointerDown={onPointerDown}
				onChange={(e: ChangeEvent) => {
					if (e.width && e.height) {
						for (const item of items) {
							ref.current[item.id]?.onParentChange(e);
							console.log(ref.current[item.id]?.draggableRef.current);
							// const wr = e.width / width;
							// const wh = e.height / height;
							// const elm = document.getElementById(item.id);
							// elm?.setAttribute(
							// 	"transform",
							// 	`translate(${item.point.x / wr}, ${item.point.y / wh})`,
							// );
							// elm
							// 	?.getElementsByTagName("rect")?.[0]
							// 	.setAttribute("width", `${item.width * wr}`);
							// elm
							// 	?.getElementsByTagName("rect")?.[0]
							// 	.setAttribute("height", `${item.height * wh}`);
						}
					}
				}}
				onChangeEnd={onChangeEnd}
			>
				{children}
			</Rectangle>
		);
	},
);

export default Group;
