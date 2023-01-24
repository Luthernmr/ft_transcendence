import React, { useEffect, useRef } from "react";
import './PongStyles.css'

const docStyle = document.documentElement.style;
const SPEED = 5;
const FRAME_RATE = 75;

export default function GameManager() {
	let ballPositionX = 0;
	let ballPositionY = 0;

	const shouldRun = useRef(true);
	useEffect(() => {
		if (shouldRun.current)
		{
			shouldRun.current = false;
			setInterval(update, FRAME_RATE);
		}
	}, []);

	const update = () => {
		console.log("Updating physics");
		docStyle.setProperty("--ballPositionX", ballPositionX);
		docStyle.setProperty("--ballPositionY", ballPositionY);
		ballPositionX += SPEED;
		ballPositionY += SPEED;
		//docStyle.setProperty("--nextBallPositionX", ballPositionX);
		//docStyle.setProperty("--nextBallPositionY", ballPositionY);
	}

	return (
		<div className="BallPosition">
			<div className="Ball"/>
		</div>
	);
}