import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { useColorModeValue, Button, NumberIncrementStepperProps, useUpdateEffect } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { BsBalloon, BsController } from 'react-icons/bs';
import { RiContrastDropLine } from 'react-icons/ri';

const BALL_START_DX: number = 30;
const BALL_START_DY: number = 30;

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
	ballStartDelta: Vector2
}

interface PongRuntimeData {
	ballPosition: Vector2,
	ballDelta: Vector2,
}

interface Obstacle {
  x: number,
  y: number,
  width: number,
  height: number,
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
  
  useEffect(() => {
    function Init(datas: PongInitData) {
      console.log("Initing...");
      setBall(Add(Offset, datas.ballStartPosition));
      ballDelta.current = datas.ballStartDelta;

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
        }, { // BOTTOM
          x: Offset.x + datas.width,
          y: Offset.y - WALL_HEIGHT,
          width: WALL_WIDTH,
          height: datas.height + 2 * WALL_HEIGHT
        }, { // RIGHT
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

    pongSocket.on('ChangeDir', ChangeDeltas);

    return () => {
      pongSocket.off('ChangeDir', ChangeDeltas);
    }
  }, []);

  const StartRoom = () => {
    pongSocket.emit('start', (start: boolean) => {
      if (start === true)
        console.log("Game started");
    });
    //ballDelta.current = {x: BALL_START_DX, y: BALL_START_DY};
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
        </Layer>
      </Stage>
    </div>
  )
}

export default Pong;
