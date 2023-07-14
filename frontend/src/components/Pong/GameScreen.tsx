import React, { useState, useEffect, useRef } from 'react';
import { Spacer, Flex, Box, Button, Center, Text } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
// import GameArea from './GameArea';
import { Vector2, PongInitData, BallRuntimeData, PaddleRuntimeData,
	Shape, Paddle, Score, OFFSET_X, OFFSET_Y, GameState, UserDatas }
	from './PongSettings';
import UserArea from './UsersArea';
import GameStage from './GameStage'
import WatchersArea from './WatchersArea';

interface GameScreenProps {
	size: number,
	watcher: boolean,
	initDatas: PongInitData,
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
	const watchers = useRef<UserDatas[]>([]);

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
			watchers.current = props.initDatas.watchers;
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

		function AddWatcher(datas: UserDatas) {
			watchers.current.push(datas);
		}

		function RemoveWatcher(id: number) {
			const index = watchers.current.findIndex((w) => w.id === id);
			watchers.current.splice(index, 1);
		}

		pongSocket.on('StartGame', Start);
		pongSocket.on('BallDelta', BallDelta);
		pongSocket.on('PaddleDelta', PaddleDelta);
		pongSocket.on('UpdateScore', UpdateScore);
		pongSocket.on('End', EndGame);
		pongSocket.on('OpponentDisconnected', OpponentDisconnected);
		pongSocket.on('OpponentReconnected', OpponentReconnected);
		pongSocket.on('OpponentQuit', OpponentQuit);
		pongSocket.on('AddWatcher', AddWatcher);
		pongSocket.on('RemoveWatcher', RemoveWatcher);

		return () => {
			pongSocket.off('StartGame', Start);
			pongSocket.off('BallDelta', BallDelta);
			pongSocket.off('PaddleDelta', PaddleDelta);
			pongSocket.off('UpdateScore', UpdateScore);
			pongSocket.off('End', EndGame);
			pongSocket.off('OpponentDisconnected', OpponentDisconnected);
			pongSocket.off('OpponentReconnected', OpponentReconnected);
			pongSocket.off('OpponentQuit', OpponentQuit);
			pongSocket.off('AddWatcher', AddWatcher);
			pongSocket.off('RemoveWatcher', RemoveWatcher);
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
		<>
		<Box w='100%' h='15%'>
			<Center w='100%' h='80%'>
				<Text as='b' fontSize={{sm: 15, md:20, lg: 30, xl: 40}}>Welcome to {props.initDatas.custom ? "GNOP" : "PONG"}!</Text>
			</Center>
		</Box>
		<Flex direction={{sm: 'column', md:'column', lg: 'column', xl: 'row'}} width='100%' height={680 * props.size}>
			<Flex width='100%'>
				<Box w={{sm: '50%', md:'50%', lg: '50%', xl: '50%'}} h={680 * props.size} borderRadius={10}>
					<UserArea 	width={props.initDatas.width}
								height={680 * props.size}
								size={props.size}
								mirror={playerNumber.current === 1 ? false : true}
								scoreP1={playerNumber.current === 1 ? score.current.scoreP1 : score.current.scoreP2}
								scoreP2={playerNumber.current === 1 ? score.current.scoreP2 : score.current.scoreP1}
								user1Datas={playerNumber.current === 1 ? props.initDatas.user1Datas : props.initDatas.user2Datas}
								user2Datas={playerNumber.current === 1 ? props.initDatas.user2Datas : props.initDatas.user1Datas}
								/>
				</Box>
				{/* <Box w={1060 * props.size * 0.5} h={680 * props.size} bg='gray.100' borderRadius={10}> */}
				<Box w='100%' h={680 * props.size} bg='gray.100' borderRadius={10}>
					<Center w='100%' h='100%'>
						<Box w='70%' h='89%'>
						<GameStage
									initDatas={props.initDatas}
									countdown={countdown.current}
									winner={winner.current}
									playerNumber={playerNumber.current}
									opponentAlive={opponentAlive}
									requestRestart={requestRestart}
									quit={quit}
									gameState={gameState}
									size={props.size}
									ball={Object.assign({}, ball, ballShape.current)}
									paddleP1={paddleP1}
									paddleP2={paddleP2}
									paddleShape={paddleShape.current}
									watcher={props.watcher}
									/>
						</Box>
					</Center>
				</Box>
			</Flex>
			<Box w={{sm: '100%', md:'100%', lg: '100%', xl: '40%'}}>
				{props.watcher && <Button onClick={() => pongSocket.emit("LeaveWatch")}>Leave Watch</Button>}
				<WatchersArea watchers={watchers.current}/>
			</Box>
		</Flex>
		</>
	)
}

export default GameScreen;