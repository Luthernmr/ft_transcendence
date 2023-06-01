import { KeyboardEvent } from "react";
import ICollider from './ICollider'
import Actor from './Actor'

const PADDLE_SPEED = 10;

class Paddle extends Actor {
	constructor() {
		super();
		this.position = {x: 200, y: 200};
		this.width = 20;
		this.height = 100;
	}
		
	onKeyPressed(key: string) {
		if (key === "z")
			this.position.y -= PADDLE_SPEED;
		else if (key === "s")
			this.position.y += PADDLE_SPEED;
	}

	onUpdate() {
		
	}

	onCollision(other: ICollider, direction: {right: boolean, left: boolean, up: boolean, bottom: boolean}) {

	}
	
}

export default Paddle;