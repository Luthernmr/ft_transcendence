import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { RiContrastDropLine } from 'react-icons/ri';

const OFFSET_X: number = 40;
const OFFSET_Y: number = 40;

const WALL_WIDTH: number = 10;
const WALL_HEIGHT: number = 10;

const RESP: number = 1;

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

interface GameLayout {
  width: number,
	height: number,
	ballHeight: number,
  paddleHeight: number,
}

interface PongInitData extends GameLayout, PongInitEntities {
	ballPosition: Vector2,
	paddlePos: number,
  playerNum: number
}

interface PongInitEntities {
  ballWidth: number,
  paddleWidth: number
}

interface WatcherInitDatas extends GameLayout, PongInitEntities, BallRuntimeData, PaddleRuntimeData, Score {

}

interface BallRuntimeData {
	ballPosition: Vector2,
	ballDelta: Vector2,
  ballWidth: number
}

interface PaddleRuntimeData {
	paddle1Pos: number,
	paddle1Delta: number,
	paddle2Pos: number,
	paddle2Delta: number
}

interface Obstacle {
  x: number,
  y: number,
  width: number,
  height: number,
}

interface Shape {
  width: number,
  height: number
}

interface Paddle {
  pos: number,
  delta: number,
}

interface Score {
	scoreP1: number,
	scoreP2: number
}

enum PongState {
  Out,
  Queue,
  Play,
  Finished,
  Watch
}

enum PongDisplay {
  Normal,
  Reversed
}


function Pong() {
  const requestRef = useRef(0);
  const previousTimeRef = useRef(Date.now());

  // Gameplay elements
  
  const Offset: Vector2 = {x: OFFSET_X, y: OFFSET_Y};
  const walls = useRef<Obstacle[]>([WALL_PLACEHOLDER, WALL_PLACEHOLDER, WALL_PLACEHOLDER, WALL_PLACEHOLDER]);
  
  const [ball, setBall] = useState<Vector2>({x: 200, y: 300});
  const ballDelta = useRef<Vector2>({x: 0, y: 0});
  const ballShape = useRef<Shape>({width: 20, height: 20});

  const paddleDatas = useRef<Shape>({width: 0, height: 0});

  const leftPaddle = useRef<Paddle>({ pos: 200, delta: 0 });
  const rightPaddle = useRef<Paddle>({ pos: 200, delta: 0 });
  
  const score = useRef<Score>({scoreP1: 0, scoreP2: 0});

  const pongState = useRef<PongState>(PongState.Out);

  const countdown = useRef<number>(0);

  const winner = useRef<number>(1);

  const display = useRef<PongDisplay>(PongDisplay.Reversed);
  const playerNum = useRef<number>(1);

  const layout = useRef<Shape>( {width: 0, height: 0} );

  function WallBuilder(width: number, height: number) {
    walls.current = [{ // UP
      x: - WALL_WIDTH,
      y: - WALL_HEIGHT,
      width: width + 2 * WALL_WIDTH,
      height: WALL_HEIGHT
    }, { // BOTTOM
      x: - WALL_WIDTH,
      y: height,
      width: width + 2 * WALL_WIDTH,
      height: WALL_HEIGHT
    }, { // RIGHT
      x: width,
      y: - WALL_HEIGHT,
      width: WALL_WIDTH,
      height: height + 2 * WALL_HEIGHT
    }, { // LEFT
      x: - WALL_WIDTH,
      y: - WALL_HEIGHT,
      width: WALL_WIDTH,
      height: height + 2 * WALL_HEIGHT
    }
  ];
  }

  function SyncDatas(datas: GameLayout & PongInitEntities) {
    WallBuilder(datas.width, datas.height);
    layout.current = { width: datas.width, height: datas.height };
    ballShape.current = { width: datas.ballWidth, height: datas.ballHeight };
    paddleDatas.current = {width: datas.paddleWidth, height: datas.paddleHeight};
  }

  useEffect(() => {
    function Init(datas: PongInitData) {
      console.log("Initing Pong");
      SyncDatas(datas);

      setBall(datas.ballPosition);
      ballDelta.current = {x: 0, y: 0};
      leftPaddle.current.pos = datas.paddlePos;
      rightPaddle.current.pos = datas.paddlePos;
    }

    pongSocket.on('Init', Init);

    function SetNum(num: number) {
      playerNum.current = num;
      if (num === 1)
        display.current = PongDisplay.Normal;
      else
        display.current = PongDisplay.Reversed;
    }

    pongSocket.on('SetNum', SetNum);

    return () => {
      pongSocket.off('Init', Init);
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

      leftPaddle.current.pos += leftPaddle.current.delta * deltaTime / 100;
      rightPaddle.current.pos += rightPaddle.current.delta * deltaTime / 100;
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
      setBall(values.ballPosition);
      ballShape.current.width = values.ballWidth;
    }

    pongSocket.on('BallDelta', BallDelta);

    function PaddleDelta(values: PaddleRuntimeData) {
      leftPaddle.current = { pos: values.paddle1Pos, delta: values.paddle1Delta };
      rightPaddle.current = { pos: values.paddle2Pos, delta: values.paddle2Delta };
    };

    pongSocket.on('PaddleDelta', PaddleDelta);

    function UpdateScore(values: Score) {
      score.current = values;
    }

    pongSocket.on('UpdateScore', UpdateScore);

    function EndGame(winnerNumber: number) {
      winner.current = winnerNumber;
      pongState.current = PongState.Finished;
    }

    pongSocket.on('End', EndGame);

    function Watcher(datas: WatcherInitDatas) {
      pongState.current = PongState.Watch;
      SyncDatas(datas);

      setBall(datas.ballPosition);
      ballDelta.current = datas.ballDelta;
      leftPaddle.current.pos = datas.paddle1Pos;
      rightPaddle.current.pos = datas.paddle2Pos;
      leftPaddle.current.delta = datas.paddle1Delta;
      rightPaddle.current.delta = datas.paddle2Delta;

      score.current = { scoreP1: datas.scoreP1, scoreP2: datas.scoreP2 };

      pongState.current = PongState.Watch;
    }

    pongSocket.on('Watcher', Watcher);

    return () => {
      pongSocket.off('StartGame', Start);
      pongSocket.off('BallDelta', BallDelta);
      pongSocket.off('PaddleDelta', PaddleDelta);
      pongSocket.off('UpdateScore', UpdateScore);
      pongSocket.off('End', EndGame);
      pongSocket.off('Watcher', Watcher);
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (pongState.current != PongState.Play && pongState.current != PongState.Finished)
      return;

    if (e.repeat)
      return;
    
    let input = 0;

    if (e.code == 'ArrowLeft') input = playerNum.current === 1 ? -1 : 1;
    else if (e.code == 'ArrowRight') input = playerNum.current === 1 ? 1 : -1;
    else return;

    pongSocket.emit('keydown', input);
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (pongState.current != PongState.Play && pongState.current != PongState.Finished)
      return;
    
    let input = 0;
    
    if (e.code == 'ArrowLeft') input = playerNum.current === 1 ? -1 : 1;
    else if (e.code == 'ArrowRight') input = playerNum.current === 1 ? 1 : -1;
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

  const JoinQueue = (custom: boolean) => {
    const userString = sessionStorage.getItem("currentUser");
    if (userString === null)
      return;

    pongSocket.emit('queue', { custom: custom });

    pongState.current = PongState.Queue;
  }

  const RestartRequest = () => {
    pongSocket.emit('restart');
  }

  const WatchGame = () => {
    pongSocket.emit('watch');
  }

  function version(value: number, mirror: number) : number {
    if (display.current === PongDisplay.Reversed) {
      return mirror - value;
    }
    return value;
  }

  if (pongState.current === PongState.Out) {
    return (
      <div>
        <Button onClick={ () => JoinQueue(false) }>
          Join PONG Queue
        </Button>
        <Button onClick={ () => JoinQueue(true) }>
          Join GNOP Queue
        </Button>
        <Button onClick={ WatchGame }>
          Watch Random Game
        </Button>
      </div>
    )
  } else if (pongState.current === PongState.Queue) {
    return (
      <div>
        <h1>In Queue...</h1>
      </div>
    )
  } else if (pongState.current === PongState.Play || pongState.current === PongState.Finished || pongState.current === PongState.Watch) {
    return (
      <div>
        <Button onClick= { RestartRequest }> Start again ? </Button>
        <Stage width={500} height={800}>
          <Layer>
            <Text fontSize={50} width={500} y={250} align='center' text={countdown.current.toString()} visible={countdown.current > 0} />
            <Text fontSize={50} x={Offset.x + 5} y={Offset.y + 250} align='left' text={playerNum.current === 1 ? `${score.current.scoreP1}` : `${score.current.scoreP2}`} />
            <Text fontSize={50} x={Offset.x + 5} y={layout.current.height - 250} align='left' text={playerNum.current === 1 ? `${score.current.scoreP2}` : `${score.current.scoreP1}`} />
            <Text fontSize={30} width={500} y={250} align='center' text={`Player ${winner.current} won!`} visible={pongState.current === PongState.Finished}/>
            <Line points={[Offset.x, Offset.y + layout.current.height / 2, Offset.x + layout.current.width, Offset.y + layout.current.height/2]} stroke='black' strokeWidth={1} dash={[10, 10]}/>
            <Rect x={Offset.x + walls.current[2].x} y={Offset.y + walls.current[2].y} width={walls.current[2].width} height={walls.current[2].height} fill='black'/>
            <Rect x={Offset.x + walls.current[3].x} y={Offset.y + walls.current[3].y} width={walls.current[3].width} height={walls.current[3].height} fill='black'/>
            <Rect x={Offset.x + version(ball.x, layout.current.width - ballShape.current.width)}
                  y={Offset.y + version(ball.y, layout.current.height - ballShape.current.height)}
                  width={ballShape.current.width}
                  height={ballShape.current.height}
                  fill='black'
                  cornerRadius={ballShape.current.height / 2}/>
            <Rect x={Offset.x + version(leftPaddle.current.pos, layout.current.width - paddleDatas.current.width)}
                  y={Offset.y + version(0, layout.current.height - paddleDatas.current.height)}
                  width={paddleDatas.current.width}
                  height={paddleDatas.current.height}
                  fill='black' cornerRadius={10} />
            <Rect x={Offset.x + version(rightPaddle.current.pos, layout.current.width - paddleDatas.current.width)}
                  y={Offset.y + version(layout.current.height - paddleDatas.current.height, layout.current.height - paddleDatas.current.height) }
                  width={paddleDatas.current.width}
                  height={paddleDatas.current.height}
                  fill='black' cornerRadius={10}/>
          </Layer>
        </Stage>
      </div>
      )
  }
}

export default Pong;
