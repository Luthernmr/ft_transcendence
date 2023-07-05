import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import {  MAX_WIN_WIDTH, MAX_WIN_HEIGHT, MIN_WIN_WIDTH, MIN_WIN_HEIGHT, PongInitData, WatcherInitDatas,
          PongDisplay, PongState }
          from './PongSettings';
import HomeScreen from './HomeScreen';
import GameScreen from './GameScreen';
import QueueScreen from './QueueScreen';

function Pong() {
  const [pongState, setPongState] = useState<PongState>(PongState.Home);
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
    updateDimensions();
  }, [])

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

  const WatchGame = () => {
    pongSocket.emit('watch');
  }

  if (pongState === PongState.Home) {
    return (
      <HomeScreen JoinPong={() => JoinQueue(false)} JoinGnop={() => JoinQueue(true)} WatchGame={WatchGame} />
    )
  } else if (pongState === PongState.Queue) {
    return (
      <QueueScreen />
    )
  } else if (pongState === PongState.Play || pongState === PongState.Finished || pongState === PongState.Watch) {
    return (
      <GameScreen size={size} watcher={watching.current} playerNumber={playerNumber.current} initDatas={initDatas}/>
      )
  }
}

export default Pong;
