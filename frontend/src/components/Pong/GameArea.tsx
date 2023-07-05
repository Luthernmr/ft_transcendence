import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import GameFrame from './GameFrame';
import Ball from './Ball'
import { version } from 'os';
import { OFFSET_X, OFFSET_Y, Shape, Vector2 } from './PongSettings';
import Paddle from './Paddle';

interface GameAreaProps {
	width: number,
	height: number,
	size: number,
	mirror: boolean,
	ball: Vector2 & Shape,
	paddleP1: number,
	paddleP2: number,
	paddleShape: Shape
}

function GameArea({width, height, size, mirror, ball, paddleP1, paddleP2, paddleShape}: GameAreaProps) {	
	if (mirror) {
		return (
		<>
			<GameFrame width={width} height={height}/>
			<Ball	x={width - ball.x - ball.width}
					y={height - ball.y - ball.height}
					width={ball.width} height={ball.height} />
			<Paddle x={width - paddleP1 - paddleShape.width}
					y={height - paddleShape.height}
					width={paddleShape.width} height={paddleShape.height}/>
			<Paddle x={width - paddleP2 - paddleShape.width}
					y={0}
					width={paddleShape.width} height={paddleShape.height}/>
	</>)
	} else return (
		<>
			<GameFrame width={width} height={height}/>
			<Ball 	x={ball.x}
					y={ball.y}
					width={ball.width} height={ball.height} />
			<Paddle x={paddleP1}
					y={0}
					width={paddleShape.width} height={paddleShape.height}/>
			<Paddle x={paddleP2}
					y={height - paddleShape.height}
					width={paddleShape.width} height={paddleShape.height}/>
		</>
	)
}

export default GameArea;