import ICollider from "./ICollider";

class Wall implements ICollider {

	position: {x: number, y: number};
	width: number;
	height: number;

	constructor(x: number, y: number, width: number, height: number) {
		this.position = {x, y};
		this.width = width;
		this.height = height;
		console.log("new wall generated at position ", x, y, "with width and height ", width, height);
	}
}

export default Wall;