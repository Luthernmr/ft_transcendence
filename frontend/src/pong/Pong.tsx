import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';

const Paddle = (props: any) => <Rect {...props} fill="dodgerblue" shadowBlur={10} />;
const Ball = (props: any) => <Rect {...props} fill="lime" shadowBlur={5} />;

const Pong: React.FC = () => {
	const [playerPaddleY, setPlayerPaddleY] = useState(200);
	const [aiPaddleY, setAiPaddleY] = useState(200);
	const [ballPosition, setBallPosition] = useState({ x: 300, y: 200 });
	const [ballVelocity, setBallVelocity] = useState({ x: 2, y: 2 });
	const [score, setScore] = useState({ player: 0, ai: 0 });

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp') {
			setPlayerPaddleY((prevY) => Math.max(0, prevY - 20));
		} else if (e.key === 'ArrowDown') {
			setPlayerPaddleY((prevY) => Math.min(300, prevY + 20));
		}
	};

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			const newX = ballPosition.x + ballVelocity.x;
			const newY = ballPosition.y + ballVelocity.y;

			// Update AI paddle position with some inaccuracy
			setAiPaddleY((prevY) => {
				const targetY = ballPosition.y - 50 + (Math.random() * 40 - 20);
				return prevY + (targetY - prevY) * 0.1;
			});

			// Collision with player paddle
			if (newX <= 10 && newY >= playerPaddleY && newY <= playerPaddleY + 100) {
				const deltaY = newY - (playerPaddleY + 50);
				setBallVelocity({ x: -ballVelocity.x, y: ballVelocity.y + deltaY * 0.1 });
			} else if (newX <= 0) {
				setScore({ ...score, ai: score.ai + 1 });
				setTimeout(() => {
					setBallPosition({ x: 300, y: 200 });
					setBallVelocity({ x: 2, y: 2 });
				}, 1000);
				return;
			}

			// Collision with AI paddle
			if (newX >= 580 && newY >= aiPaddleY && newY <= aiPaddleY + 100) {
				const deltaY = newY - (aiPaddleY + 50);
				setBallVelocity({ x: -ballVelocity.x, y: ballVelocity.y + deltaY * 0.1 });
			} else if (newX >= 590) {
				setScore({ ...score, player: score.player + 1 });
				setTimeout(() => {
					setBallPosition({ x: 300, y: 200 });
					setBallVelocity({ x: -2, y: 2 });
				}, 1000);
				return;
			}

			if (newY <= 0 || newY >= 390) {
				setBallVelocity({ x: ballVelocity.x, y: -ballVelocity.y });
			}
			setBallPosition({ x: newX, y: newY });
		}, 10);
		return () => clearInterval(interval);
	}, [ballPosition, ballVelocity, playerPaddleY, aiPaddleY, score]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}
		>
			<Stage
				width={600}
				height={400}
				style={{
					backgroundColor: 'navy',
					userSelect: 'none',
					touchAction: 'none',
				}}
			>
				<Layer>
					<Paddle x={0} y={playerPaddleY} width={10} height={100} />
					<Paddle x={590} y={aiPaddleY} width={10} height={100} />
					<Ball x={ballPosition.x} y={ballPosition.y} width={10} height={10} />
					<Line
						points={[300, 0, 300, 400]}
						stroke="white"
						strokeWidth={2}
						dash={[5, 5]}
						shadowBlur={3}
					/>
					<Text
						x={250}
						y={10}
						text={`Player: ${score.player}`}
						fontSize={18}
						fill="white"
						shadowBlur={3}
					/>
					<Text
						x={330}
						y={10}
						text={`AI: ${score.ai}`}
						fontSize={18}
						fill="white"
						shadowBlur={3}
					/>
				</Layer>
			</Stage>
			{(score.player === 3 || score.ai === 3) && (
				<div
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						color: 'white',
						fontSize: '24px',
					}}
				>
					{score.player === 3 ? 'Player Wins!' : 'AI Wins!'}
				</div>
			)}
		</div>
	);
};
export default Pong;