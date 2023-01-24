import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import Ball from "./components/Ball";

const FRAME_RATE = 1000;

function GameManager() {
	return (
			<Stage width={window.innerWidth} height={window.innerHeight}>
			  <Layer>
				<Ball />
			  </Layer>
			</Stage>
		  );
}

export default GameManager;