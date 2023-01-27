import ICollider from './ICollider'
import Actor from './Actor'

const BALL_SPEED = 10;

class Ball extends Actor {

	deltaX: number;
	deltaY: number;

	constructor(x: number, y: number) {
		super();
		this.position = {x, y};
		this.width = 25;
		this.height = 25;
		this.deltaX = BALL_SPEED;
		this.deltaY = BALL_SPEED;
	}

	onUpdate() {
		const {x, y} = this.position;
		this.setPosition(x + this.deltaX, y + this.deltaY);
	}

	onCollision(other: ICollider, direction: {right: boolean, left: boolean, up: boolean, bottom: boolean}) {
		//console.log("The Ball collided with object at ", other.position, "direction: ", direction);
		if (direction.right || direction.left)
			this.deltaX = -this.deltaX;
		if (direction.up || direction.bottom)
			this.deltaY = -this.deltaY;
	}
}

export default Ball;