import React from "react";
import { Rect } from "react-konva";
import ICollider from "./ICollider";
import Paddle from "./Paddle";

interface PaddleProperties {
	paddle: Paddle;
}

function PaddleSprite({paddle}: PaddleProperties) {
	
	return (
	<Rect
		width={paddle.width}
		height={paddle.height}
		fill="gray"
		x={paddle.position.x - paddle.width / 2}
		y={paddle.position.y - paddle.height / 2}
	/>
	)
}

export default PaddleSprite;