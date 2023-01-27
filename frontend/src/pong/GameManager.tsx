import React, { KeyboardEvent } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import { getPositionOfLineAndCharacter } from 'typescript';
import Ball from "./components/Ball";
import BallSprite from "./components/BallSprite"
import Wall from "./components/Wall";
import WallSprite from "./components/WallSprite";
import Paddle from "./components/Paddle";
import PaddleSprite from "./components/PaddleSprite";

const FRAME_RATE = 1000/60;
const WIN_WIDTH = window.innerWidth;
const WIN_HEIGHT = window.innerHeight;

const KEY_UP = "z";
const KEY_DOWN = "s";

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
	paddle: Paddle = new Paddle();

	constructor(props: any) {
		super(props);
		this.state = {
			tick: false,
		}
		this.update = this.update.bind(this);
		this.getBallPosition = this.getBallPosition.bind(this);
		this.checkBallCollision = this.checkBallCollision.bind(this);
		this.onKeyPressed = this.onKeyPressed.bind(this);
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
		ball.collide(this.paddle);
	}

	getBallPosition() {
		return this.ball.getPosition();
	}

	onKeyPressed(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === KEY_UP || event.key === KEY_DOWN)
			this.paddle.onKeyPressed(event.key);
		console.log(event.key);
	}

	render() {
		return (
			<div tabIndex={0} onKeyDown={this.onKeyPressed}>
				<Stage width={window.innerWidth} height={window.innerHeight}>
					<Layer>
						<BallSprite getPosition={ this.getBallPosition } />
						<PaddleSprite paddle={ this.paddle } />
						<WallSprite wall={ this.walls[0] } />
						<WallSprite wall={ this.walls[1] } />
						<WallSprite wall={ this.walls[2] } />
						<WallSprite wall={ this.walls[3] } />
						<WallSprite wall={ this.walls[4] } />
						<WallSprite wall={ this.walls[5] } />
					</Layer>
				</Stage>
			</div>
		);
	}
}

export default GameManager;