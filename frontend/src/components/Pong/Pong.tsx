import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { useColorModeValue, Button, NumberIncrementStepperProps, useUpdateEffect } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { BsBalloon, BsController } from 'react-icons/bs';
import { RiContrastDropLine } from 'react-icons/ri';

interface Ball {
  x: number;
  y: number;
  dX: number;
  dY: number;
}

function SendMessageToBack() {
  pongSocket.emit('requestMoveBall');
}

function Pong() {
  //const [time, setTime] = useState(Date.now());
  //const time = useRef(Date.now());
  const requestRef = useRef(0);
  const previousTimeRef = useRef(Date.now());

  // Gameplay elements
  const [ball, setBall] = useState({x: 390, y: 290, dX: 10, dY: 10});

  const update = () => {
    const time = Date.now();
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      setBall(ball => ({
        ...ball,
        x: ball.x + ball.dX * (deltaTime / 100),
        y: ball.y + ball.dY * (deltaTime / 100),
      }));
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // useEffect(() => {
  //   function MoveBall(values: Ball) {
  //     setBall(values);
  //   }

  //   pongSocket.on('moveBall', MoveBall);

  //   return () => {
  //     pongSocket.off('moveBall', MoveBall);
  //   }
  // }, []);

  return (
    <div>
      <Button onClick={ SendMessageToBack }>
      Move Ball Right
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
