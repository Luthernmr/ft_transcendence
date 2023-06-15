import React, { useState, useEffect, useRef } from 'react';
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
  const paddleSpeed = 12;

  const [player1, setPlayer1] = useState<Paddle>({ x: 20, y: 200 });
  const [player2, setPlayer2] = useState<Paddle>({ x: 760, y: 200 });
  const [ball, setBall] = useState<Ball>({ x: 390, y: 290, speedX: 3, speedY: 3 });
  const [score, setScore] = useState({ player1: 0, player2: 0 });

  const player1Ref = useRef(player1);
  const player2Ref = useRef(player2);
  const ballRef = useRef(ball);
  const scoreRef = useRef(score);

  useEffect(() => {
    player1Ref.current = player1;
    player2Ref.current = player2;
    ballRef.current = ball;
    scoreRef.current = score;
  }, [player1, player2, ball, score]);

  const backgroundColor = useColorModeValue('white', 'gray.800');
  const paddleColor = useColorModeValue('blue.500', 'blue.300');
  const ballColor = useColorModeValue('red.500', 'red.300');
  const textColor = useColorModeValue('black', 'white');

  const movePaddle = (direction: string, player: 'player1' | 'player2') => {
    const change = direction === 'up' ? -paddleSpeed : paddleSpeed;
    const newPaddlePosition =
      player === 'player1'
        ? { ...player1Ref.current, y: Math.max(Math.min(player1Ref.current.y + change, 500 - paddleHeight), 0) }
        : { ...player2Ref.current, y: Math.max(Math.min(player2Ref.current.y + change, 500 - paddleHeight), 0) };

    if (player === 'player1') {
      setPlayer1(newPaddlePosition);
    } else {
      setPlayer2(newPaddlePosition);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'ArrowUp') {
      movePaddle('up', 'player1');
    } else if (e.code === 'ArrowDown') {
      movePaddle('down', 'player1');
    }
  };

  const updateBallPosition = () => {
    const newX = ballRef.current.x + ballRef.current.speedX;
    const newY = ballRef.current.y + ballRef.current.speedY;

    // Basic AI for player2 (opponent)
    if (ballRef.current.speedX > 0) {
      const aiPaddleY = ballRef.current.y - paddleHeight / 2;
      const aiPaddleDirection = aiPaddleY > player2Ref.current.y ? 'down' : 'up';
      movePaddle(aiPaddleDirection, 'player2');
    }

    if (
      (newX <= player1Ref.current.x + paddleWidth && newY >= player1Ref.current.y && newY <= player1Ref.current.y + paddleHeight) ||
      (newX >= player2Ref.current.x - ballSize && newY >= player2Ref.current.y && newY <= player2Ref.current.y + paddleHeight)
    ) {
      setBall({ ...ballRef.current, x: newX, y: newY, speedX: -ballRef.current.speedX });
    } else if (newX <= 0 || newX >= 800 - ballSize) {
      // Update the score when either player scores
      if (newX <= 0) {
        setScore({ ...scoreRef.current, player2: scoreRef.current.player2 + 1 });
      } else {
        setScore({ ...scoreRef.current, player1: scoreRef.current.player1 + 1 });
      }
      // Reset ball position and speed when either player scores
      setBall({ x: 390, y: 290, speedX: 3, speedY: 3 });
    } else if (newY <= 0 || newY >= 500 - ballSize) {
      setBall({ ...ballRef.current, x: newX, y: newY, speedY: -ballRef.current.speedY });
    } else {
      setBall({ ...ballRef.current, x: newX, y: newY });
    }
  };

  useEffect(() => {
    const intervalId = setInterval(updateBallPosition, 1000 / 60); // 60 FPS
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <Stage width={800} height={500} style={{ backgroundColor }}>
      <Layer >
        <Rect x={player1.x} y={player1.y} width={paddleWidth} height={paddleHeight} fill={paddleColor} cornerRadius={10}/>
        <Rect x={player2.x} y={player2.y} width={paddleWidth} height={paddleHeight} fill={paddleColor} cornerRadius={10}/>
        <Rect x={ball.x} y={ball.y} width={ballSize} height={ballSize} fill={ballColor} cornerRadius={10}/>
        <Text x={360} y={10} text={`${score.player1} - ${score.player2}`} fontSize={30} fill={textColor} />
        <Line points={[400, 0, 400, 500]} stroke={textColor} strokeWidth={2} dash={[4, 4]} />
      </Layer>
    </Stage>
  );
};

export default Pong;
