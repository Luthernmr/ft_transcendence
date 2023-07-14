import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { pongSocket } from '../../sockets/sockets';
import { Vector2, PongInitData, BallRuntimeData, PaddleRuntimeData,
	Shape, Paddle, Score, OFFSET_X, OFFSET_Y, GameState, UserDatas, WALL_WIDTH }
	from './PongSettings';
import GameArea from './GameArea';

interface GameStageProps {
	countdown: number,
	winner: number,
	playerNumber: number,
	opponentAlive: boolean,
	requestRestart: Function,
	quit: Function,
	gameState: GameState,
	paddleP1: Paddle,
	paddleP2: Paddle
	paddleShape: Shape,
	ball: Vector2 & Shape,
	initDatas: PongInitData,
	size: number,
	watcher: boolean,
}

function GameStage(props: GameStageProps) {	
	return (
		<>
			{/* <Stage x={OFFSET_X * props.size} y={OFFSET_Y * props.size} width={650 * props.size} height={600} scale={{x: props.size, y: props.size}}> */}
			<Stage x={WALL_WIDTH * props.size} width={650 * props.size} height={600} scale={{x: props.size, y: props.size}}>
				<Layer>
					<Text text={props.countdown.toString()} fontSize={50} width={450} y={400} align='center' visible={props.countdown > 0} />
					<Text text={`${props.winner === 1 ? props.initDatas.user1Datas.nickname : props.initDatas.user2Datas.nickname} won!`} fontSize={30} width={450} y={180} align='center' visible={props.winner != 0}/>
					<Text text="Restart" fontSize={25} onClick={() => props.requestRestart()} width={450} y={400} align='center' visible={props.gameState === GameState.Finished && props.watcher == false}/>
					<Text text="Quit" fontSize={25} onClick={() => props.quit()} width={450} y={450} align='center' visible={props.gameState === GameState.Finished && props.watcher == false}/>
					<Text text={(props.playerNumber === 1 ? props.initDatas.user1Datas.nickname : props.initDatas.user2Datas.nickname) + " disconnected !"} fontSize={30} width={450} y={110} align='center' color='red' visible={props.opponentAlive === false && props.watcher == false}/>
					<GameArea 	width={props.initDatas.width}
								height={props.initDatas.height}
								size={props.size}
								mirror={props.playerNumber === 1 ? false : true}
								ball={props.ball}
								paddleP1={props.paddleP1.pos}
								paddleP2={props.paddleP2.pos}
								paddleShape={props.paddleShape}
								/>
				</Layer>
			</Stage>
		</>
	)
}

export default GameStage;