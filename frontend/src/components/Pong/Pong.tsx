import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { useColorModeValue, Button } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { BsBalloon } from 'react-icons/bs';

interface Ball {
  x: number;
  y: number;
}

function SendMessageToBack() {
  pongSocket.emit('requestMoveBall');
}

function Pong() {
  const [ball, setBall] = useState({x: 390, y: 290});

  useEffect(() => {
    function MoveBall(values: Ball) {
      setBall(values);
    }

    pongSocket.on('moveBall', MoveBall);

    return () => {
      pongSocket.off('moveBall', MoveBall);
    }
  }, []);

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
