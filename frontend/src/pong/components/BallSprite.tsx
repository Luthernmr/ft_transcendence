import React from "react";
import { Circle } from "react-konva";
import PositionGetter from "./PositionGetter";

function BallSprite({getPosition}: PositionGetter) {

	let {x, y} = getPosition();
	
	return (
	<Circle
		radius={10}
		fill="green"
		x={x}
		y={y}
	/>
	)
}

export default BallSprite;