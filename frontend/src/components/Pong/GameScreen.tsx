import React, { useState, useEffect, useRef } from 'react';
import { Spacer, Flex, Box, Button, Center, Text, Divider } from '@chakra-ui/react';
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
	const P1Alive = useRef<boolean>(true);
	const P2Alive = useRef<boolean>(true);
	const watchers = useRef<UserDatas[]>([]);
	const [startingPlayer, setStartingPlayer] = useState<number>(1);

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
			countdown.current = props.initDatas.countdown;
			P1Alive.current = props.initDatas.P2alive;
			P2Alive.current = props.initDatas.P1alive;
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

		function PlayerDisconnected(p: number) {
			if (p === 1)
				P1Alive.current = false;
			else
				P2Alive.current = false;
		}

		function PlayerReconnected(p: number) {
			if (p === 1)
			P1Alive.current = true;
		else
			P2Alive.current = true;
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

		function SetStartingPlayer(num: number) {
			setStartingPlayer(num);
		}

		function Countdown(seconds: number) {
			countdown.current = seconds;
		}

		pongSocket.on('StartGame', Start);
		pongSocket.on('BallDelta', BallDelta);
		pongSocket.on('PaddleDelta', PaddleDelta);
		pongSocket.on('UpdateScore', UpdateScore);
		pongSocket.on('End', EndGame);
		pongSocket.on('PlayerDisconnected', PlayerDisconnected);
		pongSocket.on('PlayerReconnected', PlayerReconnected);
		pongSocket.on('OpponentQuit', OpponentQuit);
		pongSocket.on('AddWatcher', AddWatcher);
		pongSocket.on('RemoveWatcher', RemoveWatcher);
		pongSocket.on('SetStartingPlayer', SetStartingPlayer);
		pongSocket.on('Countdown', Countdown);

		return () => {
			pongSocket.off('StartGame', Start);
			pongSocket.off('BallDelta', BallDelta);
			pongSocket.off('PaddleDelta', PaddleDelta);
			pongSocket.off('UpdateScore', UpdateScore);
			pongSocket.off('End', EndGame);
			pongSocket.off('PlayerDisconnected', PlayerDisconnected);
			pongSocket.off('PlayerReconnected', PlayerReconnected);
			pongSocket.off('OpponentQuit', OpponentQuit);
			pongSocket.off('AddWatcher', AddWatcher);
			pongSocket.off('RemoveWatcher', RemoveWatcher);
			pongSocket.off('SetStartingPlayer', SetStartingPlayer);
			pongSocket.off('Countdown', Countdown);
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
		<Box w='100%' h={['10%', '10%', '20%', '20%']} minHeight={50}>
			<Center w='100%' h='100%'>
				<Box w='80%' h='70%' border='2px' borderColor='gray.100' borderRadius={20}>
					<Center w='100%' h='100%'><Text as='b' fontSize={{sm: 15, md:22, lg: 30, xl: 40}}>Welcome to {props.initDatas.custom ? "GNOP" : "PONG"}!</Text>
					</Center>
				</Box>
			</Center>
		</Box>
		<Flex direction={{base: 'column', sm: 'column', md:'column', lg: 'column', xl: 'row'}} width='100%' height={680 * props.size}>
			<Flex width='100%'>
				<Box w={{base: '50%', sm: '50%', md:'50%', lg: '50%', xl: '50%'}} h={680 * props.size} borderRadius={10}>
					<UserArea 	width={props.initDatas.width}
								height={680 * props.size}
								mirror={playerNumber.current === 1 ? false : true}
								scoreP1={playerNumber.current === 1 ? score.current.scoreP1 : score.current.scoreP2}
								scoreP2={playerNumber.current === 1 ? score.current.scoreP2 : score.current.scoreP1}
								user1Datas={playerNumber.current === 1 ? props.initDatas.user1Datas : props.initDatas.user2Datas}
								user2Datas={playerNumber.current === 1 ? props.initDatas.user2Datas : props.initDatas.user1Datas}
								/>
				</Box>
				{/* <Box w={1060 * props.size * 0.5} h={680 * props.size} bg='gray.100' borderRadius={10}> */}
				<Box w={'100%'} h={680 * props.size} bg='gray.100' borderRadius={10}>
					<Center w='100%' h='100%'>
						<Box>
						<GameStage
									initDatas={props.initDatas}
									countdown={countdown.current}
									winner={winner.current}
									playerNumber={playerNumber.current}
									P1Alive={P1Alive.current}
									P2Alive={P2Alive.current}
									requestRestart={requestRestart}
									quit={quit}
									gameState={gameState}
									size={props.size}
									ball={Object.assign({}, ball, ballShape.current)}
									paddleP1={paddleP1}
									paddleP2={paddleP2}
									paddleShape={paddleShape.current}
									watcher={props.watcher}
									startingPlayer={startingPlayer}
									/>
						</Box>
					</Center>
				</Box>
			</Flex>
			<Flex direction='column' w={{base: '100%', sm: '100%', md:'100%', lg: '100%', xl: '40%'}}>
				<Box w='100%' h={{base:'10px', sm: '10px', md:'20px', lg: '20px', xl: '0px'}}></Box>
				<WatchersArea watchers={watchers.current} isWatcher={props.watcher} leaveWatch={() => pongSocket.emit("LeaveWatch")}/>
			</Flex>
		</Flex>
		</>
	)
}

export default GameScreen;