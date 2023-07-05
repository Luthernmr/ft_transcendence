import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import {  MAX_WIN_WIDTH, MAX_WIN_HEIGHT, MIN_WIN_WIDTH, MIN_WIN_HEIGHT, PongInitData, WatcherInitDatas,
          PongDisplay, PongState, QueueState }
          from './PongSettings';
import HomeScreen from './HomeScreen';
import GameScreen from './GameScreen';
import QueueScreen from './QueueScreen';
import { Socket } from 'socket.io-client';

function Pong() {
  const [pongState, setPongState] = useState<PongState>(PongState.Home);
  const [queueState, setQueueState] = useState<QueueState>(QueueState.Joined);
  const [size, setSize] = useState(1);

  const watching = useRef<boolean>(false);

  const [initDatas, setInitDatas] = useState<PongInitData>({
    width: 0,
    height: 0,
    ballHeight: 0,
    ballWidth: 0,
    paddleHeight: 0,
    paddleWidth: 0,
    ballPosition:{x: 0, y: 0},
    ballDelta: {x: 0, y: 0},
    paddle1Pos: 0,
    paddle1Delta: 0,
    paddle2Pos: 0,
    paddle2Delta: 0,
    countdown: 0,
    scoreP1: 0,
    scoreP2: 0,
    playerNumber: 1
  });
  
  useEffect(() => {
    updateDimensions();
    pongSocket.emit('requestGameState');
  }, [])

  useEffect(() => {

    function Init(datas: PongInitData) {
      setInitDatas({
        ...datas
      });
      setPongState(PongState.Play);
		}

    function Watcher(datas: WatcherInitDatas) {
      watching.current = true;

      setPongState(PongState.Watch);
    }

    function GameState(datas: any) {
      setPongState(datas.pongState);

      if (datas.pongState === PongState.Play) {
        setInitDatas(datas.payload);
      }
    }

    function Queue(datas: QueueState) {
      setPongState(PongState.Queue);
      setQueueState(datas);
    }

    function StartSecondary() {
      setPongState(PongState.AlreadyConnected);
    }

    pongSocket.on('Init', Init);
    pongSocket.on('Watcher', Watcher);
    pongSocket.on('gamestate', GameState);
    pongSocket.on('Queue', Queue);
    pongSocket.on('StartSecondary', StartSecondary);

    return () => {
      pongSocket.off('Init', Init);
      pongSocket.off('Watcher', Watcher);
      pongSocket.off('gamestate', GameState);
      pongSocket.off('Queue', Queue);
      pongSocket.off('StartSecondary', StartSecondary);
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
      <QueueScreen state={ queueState } />
    )
  } else if (pongState === PongState.Play || pongState === PongState.Watch) {
    return (
      <GameScreen size={size} watcher={watching.current} initDatas={initDatas}/>
      )
  } else if (pongState === PongState.AlreadyConnected) {
    return (
      <h1>Currently Playing !</h1>
    )
  }
}

export default Pong;
