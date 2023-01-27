import React, { useEffect, useRef, useState } from "react";
import ICollider from './ICollider'
import IBound from "./IBound";

function getBounds(col: ICollider) {
	let left = col.position.x - col.width / 2;
	let right = col.position.x + col.width / 2;
	let up = col.position.y - col.height / 2;
	let bottom = col.position.y + col.height / 2;

	return {left: left, right: right, up: up, bottom: bottom};
}

abstract class Actor implements ICollider {
	
	oldPosition: {x: number, y: number};
	position: {x: number, y: number};
	width: number;
	height: number;

	constructor() {
		this.setPosition = this.setPosition.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onCollision = this.onCollision.bind(this);
		this.oldPosition = {x: 0, y: 0};
		this.position = {x: 0, y: 0};
		this.width = 50;
		this.height = 50;
	}

	abstract onUpdate(): void;
	abstract onCollision(other: ICollider, direction: {right: boolean, left: boolean, up: boolean, bottom: boolean}): void;

	getPosition() {
		let {x, y} = this.position;
		return {x, y};
	}

	setPosition(newX: number, newY: number) {
		this.oldPosition = this.position;
		this.position = {x: newX, y: newY};
		//console.log('Position updated: ', newX, newY);
	}

	collide(other: ICollider) {
		let crossX = false;
		let crossY = false;

		let myBounds = getBounds(this);
		let otherBounds = getBounds(other);
		let oldBounds = getBounds({position: this.oldPosition, width: this.width, height: this.height})

		let direction = {right: false, left: false, up: false, bottom: false};

		if (this.position.x <= other.position.x && myBounds.right >= otherBounds.left) {
			crossX = true;
			if (oldBounds.right < otherBounds.left)
				direction.right = true;
		} else if (this.position.x > other.position.x && myBounds.left <= otherBounds.right){
			crossX = true;
			if (oldBounds.left > otherBounds.right)
				direction.left = true;
		}

		if (this.position.y <= other.position.y && myBounds.bottom >= otherBounds.up) {
			crossY = true;
			if (oldBounds.bottom < otherBounds.up)
				direction.up = true;
		} else if (this.position.y > other.position.y && myBounds.up <= otherBounds.bottom) {
			crossY = true;
			if (oldBounds.up > otherBounds.bottom)
				direction.bottom = true;
		}

		if (crossX && crossY)
			this.onCollision(other, direction);

		return crossX && crossY;
	}
}

export default Actor;