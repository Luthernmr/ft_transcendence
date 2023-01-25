import React from "react";
import { Rect } from "react-konva";
import PositionGetter from "./PositionGetter";
import Wall from "./Wall"
import ICollider from "./ICollider"

function WallSprite({position, width, height}: ICollider) {
	
	return (
	<Rect
		width={width}
		height={height}
		fill="gray"
		x={position.x - width / 2}
		y={position.y - height / 2}
	/>
	)
}

export default WallSprite;