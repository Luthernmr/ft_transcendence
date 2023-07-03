import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import {  OFFSET_X, OFFSET_Y, WALL_WIDTH, WALL_HEIGHT, MAX_WIN_WIDTH, MAX_WIN_HEIGHT, MIN_WIN_WIDTH, MIN_WIN_HEIGHT, WALL_PLACEHOLDER,
          Vector2, GameLayout, PongInitData, PongInitEntities, WatcherInitDatas,
          BallRuntimeData, PaddleRuntimeData, Obstacle,
          Shape, Paddle, Score, PongDisplay, PongState }
          from './PongSettings';
import HomeScreen from './HomeScreen';
import GameScreen from './GameScreen';
import QueueScreen from './QueueScreen';

function Pong() {
  const [pongState, setPongState] = useState<PongState>(PongState.Home);

  const display = useRef<PongDisplay>(PongDisplay.Reversed);
  const [size, setSize] = useState(1);

  const watching = useRef<boolean>(false);

  const playerNumber = useRef<1 | 2>(1);

  const [initDatas, setInitDatas] = useState<PongInitData>({
    width: 0,
    height: 0,
    ballHeight: 0,
    paddleHeight: 0,
    ballPosition:{x: 0, y: 0},
    paddlePos: 0,
    ballWidth: 0,
    paddleWidth: 0
  });
  
  useEffect(() => {
    function SetNum(num: 1 | 2) {
      playerNumber.current = num;
    }

    function Init(datas: PongInitData) {
      setInitDatas({
        ...datas
      });
      setPongState(PongState.Play);
		}

    function Watcher(datas: WatcherInitDatas) {
      watching.current = true;
      // SyncDatas(datas);

      // setBall(datas.ballPosition);
      // ballDelta.current = datas.ballDelta;
      // leftPaddle.current.pos = datas.paddle1Pos;
      // rightPaddle.current.pos = datas.paddle2Pos;
      // leftPaddle.current.delta = datas.paddle1Delta;
      // rightPaddle.current.delta = datas.paddle2Delta;

      // score.current = { scoreP1: datas.scoreP1, scoreP2: datas.scoreP2 };

      setPongState(PongState.Watch);
    }

    pongSocket.on('SetNum', SetNum);
    pongSocket.on('Init', Init);
    pongSocket.on('Watcher', Watcher);

    return () => {
      pongSocket.off('Watcher', Watcher);
    }
  }, []);

  const updateDimensions = () => {
    let rate = 1;

    if (window.innerWidth >= MAX_WIN_WIDTH && window.innerHeight >= MAX_WIN_HEIGHT) {
      rate = 1;
    } else if (window.innerWidth <= MIN_WIN_WIDTH || window.innerHeight <= MIN_WIN_HEIGHT) {
      rate = MIN_WIN_WIDTH / MAX_WIN_WIDTH;
    } else {
      rate = Math.min(window.innerWidth / MAX_WIN_WIDTH, window.innerHeight / MAX_WIN_HEIGHT);
    }

    setSize(rate);
  }

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  const JoinQueue = (custom: boolean) => {
    pongSocket.emit('queue', { custom: custom });

    setPongState(PongState.Queue);
    watching.current = false;
  }

  const RestartRequest = () => {
    pongSocket.emit('restart');
  }

  const WatchGame = () => {
    pongSocket.emit('watch');
  }

  if (pongState === PongState.Home) {
    return (
      //<GameScreen />
      <HomeScreen JoinPong={() => JoinQueue(false)} JoinGnop={() => JoinQueue(true)} WatchGame={WatchGame} />
      // <div>
      //   <Button onClick={ () => JoinQueue(false) }>
      //     Join PONG Queue
      //   </Button>
      //   <Button onClick={ () => JoinQueue(true) }>
      //     Join GNOP Queue
      //   </Button>
      //   <Button onClick={ WatchGame }>
      //     Watch Random Game
      //   </Button>
      // </div>
    )
  } else if (pongState === PongState.Queue) {
    return (
      <QueueScreen />
    )
  } else if (pongState === PongState.Play || pongState === PongState.Finished || pongState === PongState.Watch) {
    return (
      <GameScreen size={size} watcher={watching.current} playerNumber={playerNumber.current} initDatas={initDatas}/>
      // <div>
      //   <Button onClick= { RestartRequest }> Start again ? </Button>
      //   <Stage x={Offset.x} y = {Offset.y} width={500} height={700} scale={{x: size, y: size}}>
      //     <Layer>
      //       <Text fontSize={50} width={500} y={250} align='center' text={countdown.current.toString()} visible={countdown.current > 0} />
      //       <Text fontSize={50} x={5} y={version(225, layout.current.height - 50)} align='left' text={`${score.current.scoreP1}`} />
      //       <Text fontSize={50} x={5} y={version(layout.current.height - 50 - 225, layout.current.height - 50)} align='left' text={`${score.current.scoreP2}`} />
      //       <Text fontSize={30} width={400} y={200} align='center' text={`Player ${winner.current} won!`} visible={pongState.current === PongState.Finished}/>
      //       <Line points={[0, layout.current.height / 2, layout.current.width, layout.current.height / 2]} stroke='black' strokeWidth={1} dash={[10, 10]}/>
      //       <Rect x={walls.current[2].x} y={walls.current[2].y} width={walls.current[2].width} height={walls.current[2].height} fill='black'/>
      //       <Rect x={walls.current[3].x} y={walls.current[3].y} width={walls.current[3].width} height={walls.current[3].height} fill='black'/>
      //       <Rect x={version(ball.x, layout.current.width - ballShape.current.width)}
      //             y={version(ball.y, layout.current.height - ballShape.current.height)}
      //             width={ballShape.current.width}
      //             height={ballShape.current.height}
      //             fill='black'
      //             cornerRadius={ballShape.current.height / 2}/>
      //       <Rect x={version(leftPaddle.current.pos, layout.current.width - paddleDatas.current.width)}
      //             y={version(0, layout.current.height - paddleDatas.current.height)}
      //             width={paddleDatas.current.width}
      //             height={paddleDatas.current.height}
      //             fill='black' cornerRadius={10} />
      //       <Rect x={version(rightPaddle.current.pos, layout.current.width - paddleDatas.current.width)}
      //             y={version(layout.current.height - paddleDatas.current.height, layout.current.height - paddleDatas.current.height) }
      //             width={paddleDatas.current.width}
      //             height={paddleDatas.current.height}
      //             fill='black' cornerRadius={10}/>
      //     </Layer>
      //   </Stage>
      // </div>
      )
  }
}

export default Pong;
