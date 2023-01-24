import React, { useEffect, useRef, useState } from "react";
import { Circle } from "react-konva";

const FRAME_RATE = 1000/60;
const BALL_SPEED = 10;

class Ball extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			x: 100,
			y: 100,
		}
		this.update = this.update.bind(this);
		this.setPosition = this.setPosition.bind(this);
	}

	componentDidMount() {
		this.launchMovement();
	}

	componentWillUnmount() {
		clearInterval(this.id);
	}

	launchMovement = () => {
		this.id = setInterval(this.update, FRAME_RATE);
	}

	update() {
		const {x, y} = this.state;
		this.setPosition({newX: x + BALL_SPEED, newY: y + BALL_SPEED});
	}

	setPosition({newX, newY}) {
		this.setState( {
			x: newX,
			y: newY,
		})
		console.log('new position updated: ', newX, newY);
	}

	render() {
		let {x, y} = this.state;
		return (
			<Circle
				radius={10}
				fill="green"
				x={x}
				y={y}
			/>
		);
	}
}

export default Ball;