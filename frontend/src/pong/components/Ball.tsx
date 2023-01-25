import React, { useEffect, useRef, useState } from "react";
import { Circle } from "react-konva";
import ICollider from './ICollider'
import Actor from './Actor'

const BALL_SPEED = 10;

class Ball extends Actor {
	constructor(x: number, y: number) {
		super();
		this.position = {x, y};
		this.width = 50;
		this.height = 50;
		this.deltaX = BALL_SPEED;
		this.deltaY = BALL_SPEED;
	}

	onUpdate() {
		const {x, y} = this.position;
		this.setPosition(x + this.deltaX, y + this.deltaY);
	}

	onCollision(other: ICollider, direction: string) {
		console.log("The Ball collided with object at ", other.position, "direction: ", direction);
		if (direction == "right" || direction == "left")
			this.deltaX = -this.deltaX;
		else if (direction == "up" || direction == "bottom")
			this.deltaY = -this.deltaY;
		else
			console.log("Probably hit a corner");
	}
}

export default Ball;