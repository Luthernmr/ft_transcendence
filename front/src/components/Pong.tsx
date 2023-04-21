import React, { useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { useColorModeValue } from '@chakra-ui/react';

interface Paddle {
  x: number;
  y: number;
}

interface Ball {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
}

const Pong: React.FC = () => {
  const paddleHeight = 100;
  const paddleWidth = 20;
  const ballSize = 20;
  const paddleSpeed = 6;

  const [player1, setPlayer1] = useState<Paddle>({ x: 20, y: 200 });
  const [player2, setPlayer2] = useState<Paddle>({ x: 760, y: 200 });
  const [ball, setBall] = useState<Ball>({ x: 390, y: 290, speedX: 3, speedY: 3 });
  const [score, setScore] = useState({ player1: 0, player2: 0 });

  const backgroundColor = useColorModeValue('white', 'gray.800');
  const paddleColor = useColorModeValue('blue.500', 'blue.300');
  const ballColor = useColorModeValue('red.500', 'red.300');
  const textColor = useColorModeValue('black', 'white');

  const movePaddle = useCallback(
    (direction: string, player: 'player1' | 'player2') => {
      const change = direction === 'up' ? -paddleSpeed : paddleSpeed;
      const newPaddlePosition =
        player === 'player1'
          ? { ...player1, y: Math.max(Math.min(player1.y + change, 500 - paddleHeight), 0) }
          : { ...player2, y: Math.max(Math.min(player2.y + change, 500 - paddleHeight), 0) };

      if (player === 'player1') {
        setPlayer1(newPaddlePosition);
      } else {
        setPlayer2(newPaddlePosition);
      }
    },
    [player1, player2]
  );

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp') {
        movePaddle('up', 'player1');
      } else if (e.code === 'ArrowDown') {
        movePaddle('down', 'player1');
      }
    },
    [movePaddle]
  );

  const updateBallPosition = useCallback(() => {
    const newX = ball.x + ball.speedX;
    const newY = ball.y + ball.speedY;

    // Basic AI for player2 (opponent)
    if (ball.speedX > 0) {
      const aiPaddleY = ball.y - paddleHeight / 2;
      const aiPaddleDirection = aiPaddleY > player2.y ? 'down' : 'up';
      movePaddle(aiPaddleDirection, 'player2');
    }

    if (
      (newX <= player1.x + paddleWidth && newY >= player1.y && newY <= player1.y + paddleHeight) ||
      (newX >= player2.x - ballSize && newY >= player2.y && newY <= player2.y + paddleHeight)
    ) {
      setBall({ ...ball, x: newX, y: newY, speedX: -ball.speedX });
    } else if (newX <= 0 || newX >= 800 - ballSize) {
      // Update the score when either player scores
      if (newX <= 0) {
        setScore({ ...score, player2: score.player2 + 1 });
      } else {
        setScore({ ...score, player1: score.player1 + 1 });
      }
      // Reset ball position and speed when either player scores
      setBall({ x: 390, y: 290, speedX: 3, speedY: 3 });
    } else if (newY <= 0 || newY >= 500 - ballSize) {
      setBall({ ...ball, x: newX, y: newY, speedY: -ball.speedY });
    } else {
      setBall({ ...ball, x: newX, y: newY });
    }
  }, [ball, player1.x, player1.y, player2.x, player2.y, paddleWidth, paddleHeight, ballSize, movePaddle, score]);

  useEffect(() => {
    const intervalId = setInterval(updateBallPosition, 1000 / 60); // 60 FPS
    return () => clearInterval(intervalId);
  }, [updateBallPosition]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <Stage width={800} height={500} style={{ backgroundColor }}>
      <Layer>
        <Rect x={player1.x} y={player1.y} width={paddleWidth} height={paddleHeight} fill={paddleColor} />
        <Rect x={player2.x} y={player2.y} width={paddleWidth} height={paddleHeight} fill={paddleColor} />
        <Rect x={ball.x} y={ball.y} width={ballSize} height={ballSize} fill={ballColor} />
        <Text x={360} y={10} text={`${score.player1} - ${score.player2}`} fontSize={30} fill={textColor} />
        <Line points={[400, 0, 400, 500]} stroke={textColor} strokeWidth={2} dash={[4, 4]} />
      </Layer>
    </Stage>
  );
};

export default Pong;
