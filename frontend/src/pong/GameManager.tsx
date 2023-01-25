import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import Ball from "./components/Ball";
import BallSprite from "./components/BallSprite"
import ICollider from './components/ICollider';
import Actor from "./components/Actor"
import Updater from "./components/Updater"

const FRAME_RATE = 1000/60;
const BALL_SPEED = 5;

class GameManager extends React.Component<any, any> {

	id: number = 0;

	// ball: Ball = new Ball({});
	// actors: Actor[] = [this.ball];
	// updater: Updater = new Updater({actors: this.actors});

	constructor(props: any) {
		super(props);
		this.state = {
			x: 100,
			y: 100,
		}
		this.onUpdate = this.onUpdate.bind(this);
		this.setPosition = this.setPosition.bind(this);
		this.getBallPosition = this.getBallPosition.bind(this);
	}

	getBallPosition() {
		return this.state;
	}

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
		});
		console.log('new position updated: ', newX, newY);
	}

	onUpdate() {
		const {x, y} = this.state;
		this.setPosition(x + BALL_SPEED, y + BALL_SPEED);
	}

	render() {
		return (
			<Stage width={window.innerWidth} height={window.innerHeight}>
				<Layer>
					<BallSprite getPosition={ this.getBallPosition }/>
				</Layer>
			</Stage>
		);
	}
}

export default GameManager;