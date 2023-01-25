import React, { useEffect, useRef, useState } from "react";
import ICollider from './ICollider'

const FRAME_RATE = 1000/60;

abstract class Actor extends React.Component implements ICollider {
	width: number = 0;
	height: number = 0;
	position: {x: number, y: number} = {x: 0, y: 0};

	id: number = 0;

	constructor(props: any) {
		super(props);
		this.state = {
			x: 100,
			y: 100,
		}
		this.setPosition = this.setPosition.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onCollision = this.onCollision.bind(this);
		this.onRendering = this.onRendering.bind(this);
	}

	abstract onUpdate(): void;
	abstract onCollision(other: ICollider): void;
	abstract onRendering(): any;

	componentDidMount() {
		this.launchMovement();
	}

	componentWillUnmount() {
		clearInterval(this.id);
	}

	launchMovement = () => {
		this.id = window.setInterval(this.onUpdate, FRAME_RATE);
	}

	setPosition(newX: number, newY: number) {
		this.setState( {
			x: newX,
			y: newY,
		})
		console.log('new position updated: ', newX, newY);
	}

	collide(other: ICollider) {
		let alignX = false;
		let alignY = false;

		let leftBound = this.position.x - this.width / 2;
		let rightBound = this.position.x + this.width / 2;
		let upperBound = this.position.y - this.height / 2;
		let bottomBound = this.position.y + this.height / 2;

		if (leftBound < other.position.x && other.position.x < rightBound)
			alignX = true;

		if (upperBound < other.position.y && other.position.y < bottomBound)
			alignY = true;

		if (alignX && alignY)
			this.onCollision(other);

		return alignX && alignY;
	}

	render() {
		return this.onRendering();
	}
}

export default Actor;