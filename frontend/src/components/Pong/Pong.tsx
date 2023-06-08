import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { useColorModeValue, Button, NumberIncrementStepperProps, useUpdateEffect } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { BsBalloon, BsController } from 'react-icons/bs';
import { RiContrastDropLine } from 'react-icons/ri';

const BALL_START_DX: number = 30;
const BALL_START_DY: number = 30;

interface Ball {
  x: number;
  y: number;
}

interface Delta {
  dX: number,
  dY: number,
}

interface Obstacle {
  x: number,
  y: number,
  width: number,
  height: number,
}

function Pong() {
  const requestRef = useRef(0);
  const previousTimeRef = useRef(Date.now());

  // Gameplay elements
  const [ball, setBall] = useState({x: 390, y: 290});
  const ballDelta = useRef({dX: 0, dY: 0});

  const walls: Obstacle[] = [{
    x: 80,
    y: 50,
    width: 10,
    height: 400
  },
  {
    x: 680,
    y: 50,
    width: 10,
    height: 400
  },
  {
    x: 80,
    y: 40,
    width: 610,
    height: 10,
  },
  {
    x: 80,
    y: 450,
    width: 610,
    height: 10,
  }]

  const update = () => {
    const time = Date.now();
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      setBall(ball => ({
        x: ball.x + ballDelta.current.dX * (deltaTime / 100),
        y: ball.y + ballDelta.current.dY * (deltaTime / 100),
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
    function ChangeDeltas(values: Delta & Ball) {
      ballDelta.current = { dX: values.dX, dY: values.dY };
      setBall({ x: values.x, y: values.y });
    }

    pongSocket.on('ChangeDir', ChangeDeltas);

    return () => {
      pongSocket.off('ChangeDir', ChangeDeltas);
    }
  }, []);

  const StartRoom = () => {
    pongSocket.emit('start');
    ballDelta.current = {dX: BALL_START_DX, dY: BALL_START_DY};
  }

  return (
    <div>
      <Button onClick={ StartRoom }>
        Start
      </Button>
      <Stage width={800} height={500}>
        <Layer>
          <Rect x={walls[0].x} y={walls[0].y} width={walls[0].width} height={walls[0].height} fill={useColorModeValue('red.500', 'red.300')}/>
          <Rect x={walls[1].x} y={walls[1].y} width={walls[1].width} height={walls[1].height} fill={useColorModeValue('red.500', 'red.300')}/>
          <Rect x={walls[2].x} y={walls[2].y} width={walls[2].width} height={walls[2].height} fill={useColorModeValue('red.500', 'red.300')}/>
          <Rect x={walls[3].x} y={walls[3].y} width={walls[3].width} height={walls[3].height} fill={useColorModeValue('red.500', 'red.300')}/>
          <Rect x={ball.x} y={ball.y} width={20} height={20} fill={useColorModeValue('red.500', 'red.300')} cornerRadius={10}/>
        </Layer>
      </Stage>
    </div>
  )
}

export default Pong;
