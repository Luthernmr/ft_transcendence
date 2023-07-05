import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, ButtonGroup, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import GameArea from './GameArea';
import { Vector2, PongInitData, BallRuntimeData, PaddleRuntimeData,
	Shape, Paddle, Score, OFFSET_X, OFFSET_Y, GameState }
	from './PongSettings';
import UserArea from './UsersArea';

interface GameScreenProps {
	size: number,
	watcher: boolean
	initDatas: PongInitData;
	leaveGame: Function
}

function GameScreen(props : GameScreenProps) {
	//Ball
	const [ball, setBall] = useState<Vector2>({x: 200, y: 300});
	const ballDelta = useRef<Vector2>({x: 0, y: 0});
	const ballShape = useRef<Shape>({width: 20, height: 20});
	
	//Paddles
	const playerNumber = useRef<number>(1);
	const [paddleP1, setPaddleP1] = useState<Paddle>({ pos: 200, delta: 0 });
	const [paddleP2, setPaddleP2] = useState<Paddle>({ pos: 200, delta: 0 });
	const paddleShape = useRef<Shape>({width: 0, height: 0});

	//Game
	const [gameState, setGameState] = useState<GameState>(GameState.Playing);
	const score = useRef<Score>({scoreP1: 0, scoreP2: 0});
	const winner = useRef<number>(0);
	const countdown = useRef<number>(0);
	const [opponentAlive, setOpponentAlive] = useState<boolean>(true);

	//Time
	const requestRef = useRef(0);
 	const previousTimeRef = useRef(Date.now());

	useEffect(() => {
		function InitDatas(datas: PongInitData) {
			playerNumber.current = datas.playerNumber;
			ballShape.current = { width: datas.ballWidth, height: datas.ballHeight };
			paddleShape.current = {width: datas.paddleWidth, height: datas.paddleHeight};
			ballDelta.current = datas.ballDelta;
			score.current = { scoreP1: datas.scoreP1, scoreP2: datas.scoreP2 };
			winner.current = datas.winner;
			setPaddleP1({
				pos: datas.paddle1Pos,
				delta: datas.paddle1Delta
			})
			setPaddleP2({
				pos: datas.paddle2Pos,
				delta: datas.paddle2Delta
			})
			setBall(datas.ballPosition);
			setGameState(datas.gameState);
		}

		InitDatas(props.initDatas);

		pongSocket.emit('clientReady');
	}, []);

	const Update = () => {
		const time = Date.now();
		if (previousTimeRef.current != undefined) {
		  const deltaTime = time - previousTimeRef.current;
		  setBall(ball => ({
			x: ball.x + ballDelta.current.x * (deltaTime / 100),
			y: ball.y + ballDelta.current.y * (deltaTime / 100),
		  }));
	
		  setPaddleP1(paddleP1 => ({
				...paddleP1,
				pos: paddleP1.pos + paddleP1.delta * deltaTime / 100
		  }))

		  setPaddleP2(paddleP2 => ({
				...paddleP2,
				pos: paddleP2.pos + paddleP2.delta * deltaTime / 100
		  }))
		}
	
		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(Update);
	}

	useEffect(() => {
	requestRef.current = requestAnimationFrame(Update);
	return () => cancelAnimationFrame(requestRef.current);
	}, []);

	useEffect(() => {
		function Start(delay: number) {
			setGameState(GameState.Playing);
			winner.current = 0;
			countdown.current = delay;
			MakeCountdown();

			async function MakeCountdown() {
				while (countdown.current > 0) {
					await new Promise(r => setTimeout(r, 1000));
					countdown.current -= 1;
				}
			}
		}

		function BallDelta(values: BallRuntimeData) {
			ballDelta.current = values.ballDelta;
			setBall(values.ballPosition);
			ballShape.current.width = values.ballWidth;
		}

		function PaddleDelta(values: PaddleRuntimeData) {
			setPaddleP1({pos: values.paddle1Pos, delta: values.paddle1Delta});
			setPaddleP2({pos: values.paddle2Pos, delta: values.paddle2Delta});
		}

		function UpdateScore(values: Score) {
			score.current = values;
		}

		function EndGame(winnerNumber: number) {
			setGameState(GameState.Finished);
			winner.current = winnerNumber;
		}

		function OpponentDisconnected() {
			setOpponentAlive(false);
		}

		function OpponentReconnected() {
			setOpponentAlive(true);
		}

		function OpponentQuit() {
			props.leaveGame();
		}

		pongSocket.on('StartGame', Start);
		pongSocket.on('BallDelta', BallDelta);
		pongSocket.on('PaddleDelta', PaddleDelta);
		pongSocket.on('UpdateScore', UpdateScore);
		pongSocket.on('End', EndGame);
		pongSocket.on('OpponentDisconnected', OpponentDisconnected);
		pongSocket.on('OpponentReconnected', OpponentReconnected);
		pongSocket.on('OpponentQuit', OpponentQuit);

		return () => {
			pongSocket.off('StartGame', Start);
			pongSocket.off('BallDelta', BallDelta);
			pongSocket.off('PaddleDelta', PaddleDelta);
			pongSocket.off('UpdateScore', UpdateScore);
			pongSocket.off('End', EndGame);
			pongSocket.off('OpponentDisconnected', OpponentDisconnected);
			pongSocket.off('OpponentReconnected', OpponentReconnected);
			pongSocket.off('OpponentQuit', OpponentQuit);
		}
	}, [])

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.repeat)
		  return;
		
		let input = 0;
	
		if (e.code == 'ArrowLeft') input = playerNumber.current === 1 ? -1 : 1;
		else if (e.code == 'ArrowRight') input = playerNumber.current === 1 ? 1 : -1;
		else return;
	
		pongSocket.emit('keydown', input);
	}

	const handleKeyUp = (e: KeyboardEvent) => {
		let input = 0;
		
		if (e.code == 'ArrowLeft') input = playerNumber.current === 1 ? -1 : 1;
		else if (e.code == 'ArrowRight') input = playerNumber.current === 1 ? 1 : -1;
		else return;
		
		pongSocket.emit('keyup', input);
	}

	useEffect(() => {
		if (props.watcher)
			return;

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
		  window.removeEventListener('keydown', handleKeyDown);
		  window.removeEventListener('keyup', handleKeyDown);
		}
	}, []);

	function requestRestart() {
		pongSocket.emit('requestRestart');
	}

	function quit() {
		if (!props.watcher)
			pongSocket.emit('quit');
		props.leaveGame();
	}

	return(
		<div style={{
			display: "flex",
			flexDirection: "row",
			width: 1060 * props.size,
			height: 700 * props.size
		}} >
			<div style={{
						width: '50%',
						backgroundColor: 'lightgray'
						}}>
				<Stage x={OFFSET_X * props.size} y={OFFSET_Y * props.size} width={500} height={700} scale={{x: props.size, y: props.size}}>
					<Layer>
						<Text text={countdown.current.toString()} fontSize={50} width={450} y={400} align='center' visible={countdown.current > 0} />
						<Text text={`Player ${winner.current} won!`} fontSize={30} width={450} y={180} align='center' visible={winner.current != 0}/>
						<Text text="Restart" fontSize={25} onClick={requestRestart} width={450} y={400} align='center' visible={gameState === GameState.Finished && props.watcher == false}/>
						<Text text="Quit" fontSize={25} onClick={quit} width={450} y={450} align='center' visible={gameState === GameState.Finished}/>
						<Text text="Opponent Disconnected !" fontSize={30} width={450} y={110} align='center' color='red' visible={opponentAlive === false && props.watcher == false}/>
						<GameArea 	width={props.initDatas.width}
									height={props.initDatas.height}
									size={props.size}
									mirror={playerNumber.current === 1 ? false : true}
									ball={Object.assign({}, ball, ballShape.current)}
									paddleP1={paddleP1.pos}
									paddleP2={paddleP2.pos}
									paddleShape={paddleShape.current}
									/>
					</Layer>
				</Stage>
			</div>
			<div style={{
						width: '50%',
						backgroundColor: 'lightyellow'
						}}>
				<Stage x={OFFSET_X * props.size} y={OFFSET_Y * props.size} width={500} height={700} scale={{x: props.size, y: props.size}}>
					<Layer>
						<UserArea 	width={props.initDatas.width}
									height={props.initDatas.height}	
									size={props.size}
									mirror={playerNumber.current === 1 ? false : true}
									scoreP1={score.current.scoreP1}
									scoreP2={score.current.scoreP2}
									/>
					</Layer>
				</Stage>
			</div>
		</div>
	)
}

export default GameScreen;