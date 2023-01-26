import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import { getPositionOfLineAndCharacter } from 'typescript';
import Ball from "./components/Ball";
import BallSprite from "./components/BallSprite"
import Wall from "./components/Wall";
import WallSprite from "./components/WallSprite";

const FRAME_RATE = 1000/60;
const WIN_WIDTH = window.innerWidth;
const WIN_HEIGHT = window.innerHeight;

class GameManager extends React.Component<any, any> {

	id: number = 0;

	ball: Ball = new Ball(300, 200);
	walls: Wall[] = [
		new Wall(500, 100, 800, 20),
		new Wall(500, 500, 800, 20),
		new Wall(900, 300, 20, 400),
		new Wall(100, 300, 20, 400),
		new Wall(600, 300, 20, 200),
		new Wall(300, 350, 200, 20),
	]

	constructor(props: any) {
		super(props);
		this.state = {
			tick: false,
		}
		this.update = this.update.bind(this);
		this.getBallPosition = this.getBallPosition.bind(this);
		this.checkBallCollision = this.checkBallCollision.bind(this);
	}

	componentDidMount() {
		this.launchMovement();
	}

	componentWillUnmount() {
		clearInterval(this.id);
	}

	launchMovement = () => {
		this.id = window.setInterval(this.update, FRAME_RATE);
	}

	update() {
		this.ball.onUpdate();
		this.checkBallCollision();
		this.setState({
			tick: true,
		})
	}

	checkBallCollision() {
		const ball = this.ball;
		this.walls.forEach(function (value) {
			ball.collide(value);
		})
	}

	getBallPosition() {
		return this.ball.getPosition();
	}

	render() {
		return (
			<Stage width={window.innerWidth} height={window.innerHeight}>
				<Layer>
					<BallSprite getPosition={ this.getBallPosition }/>
					<WallSprite position={ this.walls[0].position } width={ this.walls[0].width } height={this.walls[0].height} />
					<WallSprite position={ this.walls[1].position } width={ this.walls[1].width } height={this.walls[1].height} />
					<WallSprite position={ this.walls[2].position } width={ this.walls[2].width } height={this.walls[2].height} />
					<WallSprite position={ this.walls[3].position } width={ this.walls[3].width } height={this.walls[3].height} />
					<WallSprite position={ this.walls[4].position } width={ this.walls[4].width } height={this.walls[4].height} />
					<WallSprite position={ this.walls[5].position } width={ this.walls[5].width } height={this.walls[5].height} />
				</Layer>
			</Stage>
		);
	}
}

export default GameManager;