import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';

const Paddle = (props: any) => <Rect {...props} fill="white" />;
const Ball = (props: any) => <Rect {...props} fill="white" />;

const Pong: React.FC = () => {
	const [paddleY, setPaddleY] = useState(200);
	const [ballPosition, setBallPosition] = useState({ x: 300, y: 200 });
	const [ballVelocity, setBallVelocity] = useState({ x: 2, y: 2 });
	const [score, setScore] = useState(0);

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'ArrowUp') {
			setPaddleY((prevY) => Math.max(0, prevY - 20));
		} else if (e.key === 'ArrowDown') {
			setPaddleY((prevY) => Math.min(300, prevY + 20));
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

			if (newX <= 10 && newY >= paddleY && newY <= paddleY + 100) {
				setBallVelocity({ x: -ballVelocity.x, y: ballVelocity.y });
				setScore(score + 1);
			} else if (newX <= 0) {
				setBallPosition({ x: 300, y: 200 });
				setBallVelocity({ x: 2, y: 2 });
				setScore(0);
			} else if (newX >= 590) {
				setBallVelocity({ x: -ballVelocity.x, y: ballVelocity.y });
			}

			if (newY <= 0 || newY >= 390) {
				setBallVelocity({ x: ballVelocity.x, y: -ballVelocity.y });
			}

			setBallPosition({ x: newX, y: newY });
		}, 10);

		return () => clearInterval(interval);
	}, [ballPosition, ballVelocity, paddleY, score]);

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
				style={{ backgroundColor: 'black', userSelect: 'none', touchAction: 'none' }}
			>
				<Layer>
					<Paddle x={0} y={paddleY} width={10} height={100} />
					<Ball x={ballPosition.x} y={ballPosition.y} width={10} height={10} />
					<Line
						points={[300, 0, 300, 400]}
						stroke="white"
						strokeWidth={2}
						dash={[5, 5]}
					/>
					<Text
						x={280}
						y={10}
						text={`Score: ${score}`}
						fontSize={18}
						fill="white"
					/>
				</Layer>
			</Stage>
		</div>
	);
};

export default Pong;
