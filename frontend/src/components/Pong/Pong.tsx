import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { useColorModeValue, Button, NumberIncrementStepperProps, useUpdateEffect } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { BsBalloon, BsController } from 'react-icons/bs';
import { RiContrastDropLine } from 'react-icons/ri';

const BALL_START_DX: number = 10;
const BALL_START_DY: number = 10;

interface Ball {
  x: number;
  y: number;
}

interface Delta {
  dX: number,
  dY: number,
}

function StartRoom() {
  pongSocket.emit('start');
}

function Pong() {
  const requestRef = useRef(0);
  const previousTimeRef = useRef(Date.now());

  // Gameplay elements
  const [ball, setBall] = useState({x: 390, y: 290});
  const ballDelta = useRef({dX: 0, dY: 0});

  const update = () => {
    const time = Date.now();
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      setBall(ball => ({
        ...ball,
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
    function ChangeDeltas(values: Delta) {
      ballDelta.current = values;
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
          <Rect x={ball.x} y={ball.y} width={20} height={20} fill={useColorModeValue('red.500', 'red.300')} cornerRadius={10}/>
        </Layer>
      </Stage>
    </div>
  )
}

export default Pong;
