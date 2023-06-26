import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { useColorModeValue, Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';

const OFFSET_X: number = 40;
const OFFSET_Y: number = 40;

const WALL_WIDTH: number = 10;
const WALL_HEIGHT: number = 10;

const WALL_PLACEHOLDER: Obstacle = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
}

interface Vector2 {
	x: number,
	y: number
}

interface PongInitData {
	width: number,
	height: number,
	ballRadius: number,
	ballStartPosition: Vector2,
	ballStartDelta: Vector2,
  paddleWidth: number;
  paddleHeight: number;
  paddleStartHeight: number
}

interface BallRuntimeData {
	ballPosition: Vector2,
	ballDelta: Vector2,
}

interface PaddleRuntimeData {
  paddle1Height: number,
  paddle1Delta: number,
  paddle2Height: number,
  paddle2Delta: number
}

interface Obstacle {
  x: number,
  y: number,
  width: number,
  height: number,
}

interface PaddleShape {
  width: number,
  height: number
}

interface Paddle {
  height: number,
  delta: number,
}

interface Score {
	scoreP1: number,
	scoreP2: number
}

enum PongState {
  Out,
  Queue,
  Play
}

function Add(first: Vector2, second: Vector2): Vector2 {
  return {x: first.x + second.x, y: first.y + second.y};
}

function Pong() {
  const requestRef = useRef(0);
  const previousTimeRef = useRef(Date.now());

  // Gameplay elements
  
  const Offset: Vector2 = {x: OFFSET_X, y: OFFSET_Y};
  const walls = useRef<Obstacle[]>([WALL_PLACEHOLDER, WALL_PLACEHOLDER, WALL_PLACEHOLDER, WALL_PLACEHOLDER]);
  
  const [ball, setBall] = useState<Vector2>({x: Offset.x + 390, y: Offset.y + 290});
  const ballDelta = useRef<Vector2>({x: 0, y: 0});

  const paddleDatas = useRef<PaddleShape>({width: 0, height: 0});

  const leftPaddle = useRef<Paddle>({ height: Offset.y + 200, delta: 0 });
  const rightPaddle = useRef<Paddle>({ height: Offset.y + 200, delta: 0 });
  
  const score = useRef<Score>({scoreP1: 0, scoreP2: 0});

  const pongState = useRef<PongState>(PongState.Out);

  const countdown = useRef<number>(0);

  useEffect(() => {
    function Init(datas: PongInitData) {
      console.log("Initing Pong");
      setBall(Add(Offset, datas.ballStartPosition));
      ballDelta.current = datas.ballStartDelta;
      
      paddleDatas.current = {width: datas.paddleWidth, height: datas.paddleHeight};
      leftPaddle.current.height = Offset.y + datas.paddleStartHeight;
      rightPaddle.current.height = Offset.y + datas.paddleStartHeight;

      walls.current = [{ // UP
          x: Offset.x - WALL_WIDTH,
          y: Offset.y - WALL_HEIGHT,
          width: datas.width + 2 * WALL_WIDTH,
          height: WALL_HEIGHT
        }, { // BOTTOM
          x: Offset.x - WALL_WIDTH,
          y: Offset.y + datas.height,
          width: datas.width + 2 * WALL_WIDTH,
          height: WALL_HEIGHT
        }, { // RIGHT
          x: Offset.x + datas.width,
          y: Offset.y - WALL_HEIGHT,
          width: WALL_WIDTH,
          height: datas.height + 2 * WALL_HEIGHT
        }, { // LEFT
          
          x: Offset.x - WALL_WIDTH,
          y: Offset.y - WALL_HEIGHT,
          width: WALL_WIDTH,
          height: datas.height + 2 * WALL_HEIGHT
        }
      ];
    }

    pongSocket.on('init', Init);

    return () => {
      pongSocket.off('init', Init);
    }
  }, []);

  const update = () => {
    const time = Date.now();
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      setBall(ball => ({
        x: ball.x + ballDelta.current.x * (deltaTime / 100),
        y: ball.y + ballDelta.current.y * (deltaTime / 100),
      }));

      leftPaddle.current.height += leftPaddle.current.delta * deltaTime / 100;
      rightPaddle.current.height += rightPaddle.current.delta * deltaTime / 100;
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    function Start(delay: number) {
      pongState.current = PongState.Play;
      countdown.current = delay;
      MakeCountdown();

      async function MakeCountdown() {
        while (countdown.current > 0) {
          await new Promise(r => setTimeout(r, 1000));
          countdown.current -= 1;
        }
      }
    }

    pongSocket.on('StartGame', Start);

    function BallDelta(values: BallRuntimeData) {
      ballDelta.current = values.ballDelta;
      setBall(Add(Offset, values.ballPosition));
    }

    pongSocket.on('BallDelta', BallDelta);

    function PaddleDelta(values: PaddleRuntimeData) {
      leftPaddle.current = {height: Offset.y + values.paddle1Height, delta: values.paddle1Delta };
      rightPaddle.current = {height: Offset.y + values.paddle2Height, delta: values.paddle2Delta };
    };

    pongSocket.on('PaddleDelta', PaddleDelta);

    function UpdateScore(values: Score) {
      score.current = values;
    }

    pongSocket.on('UpdateScore', UpdateScore);

    return () => {
      pongSocket.off('StartGame', Start);
      pongSocket.off('BallDelta', BallDelta);
      pongSocket.off('PaddleDelta', PaddleDelta);
      pongSocket.off('UpdateScore', UpdateScore);
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (pongState.current != PongState.Play)
      return;
    
    if (e.repeat)
      return;
    
    let input = 0;

    if (e.code == 'ArrowUp') input = -1;
    else if (e.code == 'ArrowDown') input = 1;
    else return;

    pongSocket.emit('keydown', input);
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (pongState.current != PongState.Play)
      return;
    
    let input = 0;
    
    if (e.code == 'ArrowUp') input = -1;
    else if (e.code == 'ArrowDown') input = 1;
    else return;
    
    pongSocket.emit('keyup', input);
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyDown);
    }
  }, []);

  const JoinQueue = () => {
    pongState.current = PongState.Queue;
    pongSocket.emit('queue');
  }

  if (pongState.current === PongState.Out) {
    return (
      <div>
        <Button onClick={ JoinQueue }>
          JoinQueue
        </Button>
      </div>
    )
  } else if (pongState.current === PongState.Queue) {
    return (
      <div>
        <h1>In Queue...</h1>
      </div>
    )
  } else if (pongState.current === PongState.Play) {
    return (
      <div>
        <Stage width={800} height={500}>
          <Layer>
            <Text fontSize={50} width={700} y={170} align='center' text={countdown.current.toString()} visible={countdown.current > 0} />
            <Text fontSize={50} width={700} y={80} align='center' text={`${score.current.scoreP1} | ${score.current.scoreP2}`} />
            <Rect x={walls.current[0].x} y={walls.current[0].y} width={walls.current[0].width} height={walls.current[0].height} fill='black'/>
            <Rect x={walls.current[1].x} y={walls.current[1].y} width={walls.current[1].width} height={walls.current[1].height} fill='black'/>
            <Rect x={ball.x} y={ball.y} width={20} height={20} fill='black' cornerRadius={10}/>
            <Rect x={Offset.x} y={leftPaddle.current.height} width={paddleDatas.current.width} height={paddleDatas.current.height} fill='black' />
            <Rect x={walls.current[2].x - paddleDatas.current.width} y={rightPaddle.current.height} width={paddleDatas.current.width} height={paddleDatas.current.height} fill='black'/>
          </Layer>
        </Stage>
      </div>
      )
  }
}

export default Pong;
