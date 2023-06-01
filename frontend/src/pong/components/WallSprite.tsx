import React from "react";
import { Rect } from "react-konva";
import PositionGetter from "./PositionGetter";
import Wall from "./Wall"
import ICollider from "./ICollider"

interface WallProperties {
	wall: Wall;
}

function WallSprite({wall}: WallProperties) {
	
	return (
	<Rect
		width={wall.width}
		height={wall.height}
		fill="gray"
		x={wall.position.x - wall.width / 2}
		y={wall.position.y - wall.height / 2}
	/>
	)
}

export default WallSprite;