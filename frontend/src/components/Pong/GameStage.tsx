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
	P1Alive: boolean,
	P2Alive: boolean,
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
	startingPlayer: number
}

function GameStage(props: GameStageProps) {	
	const [hoverRestart, setHoverRestart] = useState<boolean>(false);
	const [hoverQuit, setHoverQuit] = useState<boolean>(false);
	const [restartRequested, setRestartRequested] = useState<boolean>(false);
	
	useEffect(() => {
		setRestartRequested(false);
	}, [props.winner]);

	return (
		<>
			<Stage 	x={WALL_WIDTH * props.size}
					width={(WALL_WIDTH * 2 + props.initDatas.width) * props.size}
					height={props.initDatas.height * props.size}
					scale={{x: props.size, y: props.size}}>
				<Layer>
					<Rect width={props.initDatas.width} height={props.initDatas.height / 2} fill='black' opacity={props.startingPlayer === props.playerNumber ? 0 : 0.1} />
					<Rect y={props.initDatas.height / 2} width={props.initDatas.width} height={props.initDatas.height / 2} fill='black' opacity={props.startingPlayer != props.playerNumber ? 0 : 0.1} />
					<Text 	text={props.countdown.toString()}
							fontSize={50}
							width={450}
							y={400}
							align='center'
							visible={props.countdown > 0}
							/>
					<Text 	text={`${props.winner === 1 ? props.initDatas.user1Datas.nickname : props.initDatas.user2Datas.nickname} won! 🎉`}
							fontSize={30}
							width={450}
							y={180}
							align='center'
							visible={props.winner != 0}
							/>
					<Text 	text="Restart"
							fontSize={25}
							opacity={restartRequested ? 0.2 : (hoverRestart ? 0.5 : 1)}
							onClick={() => {
								setRestartRequested(true);
								props.requestRestart();
							}}
							width={450}
							y={380}
							align='center'
							lineJoin= 'round'
							visible={props.gameState === GameState.Finished && props.watcher == false}
							onMouseEnter={e => {
								if (restartRequested)
									return;
								const stage = e.target.getStage();
								if (stage === null)
									return;
								const container = stage.container();
								container.style.cursor = "pointer";
								setHoverRestart(true);
							}}
							onMouseLeave={e => {
								const stage = e.target.getStage();
								if (stage === null)
									return;
								const container = stage.container();
								container.style.cursor = "default";
								setHoverRestart(false);
							}}
							/>
					<Text 	text="Quit"
							fontSize={25}
							fill={hoverQuit ? 'gray' : 'black'}
							onClick={() => props.quit()}
							width={450}
							y={430}
							align='center'
							visible={props.gameState === GameState.Finished && props.watcher == false}
							onMouseEnter={e => {
								const stage = e.target.getStage();
								if (stage === null)
									return;
								const container = stage.container();
								container.style.cursor = "pointer";
								setHoverQuit(true);
							}}
							onMouseLeave={e => {
								const stage = e.target.getStage();
								if (stage === null)
									return;
								const container = stage.container();
								container.style.cursor = "default";
								setHoverQuit(false);
							}}
							/>
					<Text 	fill='red'
							text={(props.playerNumber === 1 ? props.initDatas.user1Datas.nickname : props.initDatas.user2Datas.nickname) + " disconnected !"}
							fontSize={30}
							width={450}
							y={80}
							align='center'
							visible={(props.playerNumber === 1 ? props.P2Alive === false : props.P1Alive === false)}
							/>
					<Text 	fill='red'
							text={(props.playerNumber === 1 ? props.initDatas.user2Datas.nickname : props.initDatas.user1Datas.nickname) + " disconnected !"}
							fontSize={30}
							width={450}
							y={500}
							align='center'
							color='red'
							visible={(props.playerNumber === 1 ? props.P1Alive === false : props.P2Alive === false)}
							/>
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