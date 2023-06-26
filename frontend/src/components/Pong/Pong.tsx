import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { useColorModeValue, Button, NumberIncrementStepperProps, useUpdateEffect } from '@chakra-ui/react';
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

interface PongRuntimeData {
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
  
  useEffect(() => {
    function Init(datas: PongInitData) {
      console.log("Initing...");
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
        }, { // LEFT
          x: Offset.x - WALL_WIDTH,
          y: Offset.y - WALL_HEIGHT,
          width: WALL_WIDTH,
          height: datas.height + 2 * WALL_HEIGHT
        }, { // RIGHT
          x: Offset.x + datas.width,
          y: Offset.y - WALL_HEIGHT,
          width: WALL_WIDTH,
          height: datas.height + 2 * WALL_HEIGHT
        }, { // BOTTOM
          x: Offset.x - WALL_WIDTH,
          y: Offset.y + datas.height,
          width: datas.width + 2 * WALL_WIDTH,
          height: WALL_HEIGHT
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
    function ChangeDeltas(values: PongRuntimeData) {
      ballDelta.current = values.ballDelta;
      setBall(Add(Offset, values.ballPosition));
    }

    pongSocket.on('onCollision', ChangeDeltas);

    return () => {
      pongSocket.off('onCollision', ChangeDeltas);
    }
  }, []);

  useEffect(() => {
    function MovePaddles(values: PaddleRuntimeData) {
      leftPaddle.current = {height: Offset.y + values.paddle1Height, delta: values.paddle1Delta };
      rightPaddle.current = {height: Offset.y + values.paddle2Height, delta: values.paddle2Delta };
    };

    pongSocket.on('onPaddleMove', MovePaddles);

    return () => {
      pongSocket.off('onPaddleMove', MovePaddles);
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat)
      return;
    
    let input = 0;

    if (e.code == 'ArrowUp') input = -1;
    else if (e.code == 'ArrowDown') input = 1;
    else return;

    pongSocket.emit('keydown', input);
  }

  const handleKeyUp = (e: KeyboardEvent) => {
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

  const StartRoom = () => {
    pongSocket.emit('start', (start: boolean) => {
      if (start === true)
        console.log("Game started");
    });
  }

  return (
    <div>
      <Button onClick={ StartRoom }>
        Start
      </Button>
      <Stage width={800} height={500}>
        <Layer>
          <Rect x={walls.current[0].x} y={walls.current[0].y} width={walls.current[0].width} height={walls.current[0].height} fill={useColorModeValue('red.500', 'red.300')}/>
          <Rect x={walls.current[1].x} y={walls.current[1].y} width={walls.current[1].width} height={walls.current[1].height} fill={useColorModeValue('red.500', 'red.300')}/>
          <Rect x={walls.current[2].x} y={walls.current[2].y} width={walls.current[2].width} height={walls.current[2].height} fill={useColorModeValue('red.500', 'red.300')}/>
          <Rect x={walls.current[3].x} y={walls.current[3].y} width={walls.current[3].width} height={walls.current[3].height} fill={useColorModeValue('red.500', 'red.300')}/>
          <Rect x={ball.x} y={ball.y} width={20} height={20} fill={useColorModeValue('red.500', 'red.300')} cornerRadius={10}/>
          <Rect x={Offset.x} y={leftPaddle.current.height} width={paddleDatas.current.width} height={paddleDatas.current.height} fill={useColorModeValue('red.500', 'red.300')} />
          <Rect x={walls.current[2].x - paddleDatas.current.width} y={rightPaddle.current.height} width={paddleDatas.current.width} height={paddleDatas.current.height} fill={useColorModeValue('red.500', 'red.300')}/>
        </Layer>
      </Stage>
    </div>
  )
}

export default Pong;
