import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import './Pong.css';

type Position = {
  x: number;
  y: number;
};

const Pong: React.FC = () => {
  const [ball, setBall] = useState<Position>({ x: 300, y: 200 });
  const [ballSpeed, setBallSpeed] = useState<Position>({ x: 5, y: 3 });
  const [paddle1, setPaddle1] = useState(200);
  const [paddle2, setPaddle2] = useState(200);
  const [score, setScore] = useState([0, 0]);
  const stageRef = useRef<any>(null);

  const moveBall = () => {
    const newX = ball.x + ballSpeed.x;
    const newY = ball.y + ballSpeed.y;
    setBall({ x: newX, y: newY });
  };

  const checkCollision = () => {
    if (ball.y <= 0 || ball.y >= 400) {
      setBallSpeed({ x: ballSpeed.x, y: -ballSpeed.y });
    }
    if (ball.x <= 20 && (ball.y >= paddle1 - 20 && ball.y <= paddle1 + 50)) {
      setBallSpeed({ x: -ballSpeed.x, y: ballSpeed.y });
    }
    if (ball.x >= 580 && (ball.y >= paddle2 - 20 && ball.y <= paddle2 + 50)) {
      setBallSpeed({ x: -ballSpeed.x, y: ballSpeed.y });
    }
  };

  const checkScore = () => {
    if (ball.x < 0) {
      setScore([score[0], score[1] + 1]);
      setBall({ x: 300, y: 200 });
    }
    if (ball.x > 600) {
      setScore([score[0] + 1, score[1]]);
      setBall({ x: 300, y: 200 });
    }
  };

  const movePaddles = () => {
    stageRef.current.getStage().addEventListener('mousemove', (e: any) => {
      setPaddle1(e.y - 25);
      setPaddle2(e.y - 25);
    });
  };

  useEffect(() => {
    movePaddles();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      moveBall();
      checkCollision();
      checkScore();
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [ball, ballSpeed, paddle1, paddle2]);

  return (
    <div className="Pong">
      <Stage width={600} height={400} ref={stageRef}>
        <Layer>
          <Rect x={10} y={paddle1} width={10} height={50} fill="white" />
          <Rect x={580} y={paddle2} width={10} height={50} fill="white" />
          <Rect x={ball.x} y={ball.y} width={10} height={10} fill="white" />
        </Layer>
      </Stage>
      <div className="score">
        {score[0]} - {score[1]}
      </div>
    </div>
  );
};

export default Pong;
