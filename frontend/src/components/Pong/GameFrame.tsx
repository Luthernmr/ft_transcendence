import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center, layout } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { Obstacle, WALL_PLACEHOLDER, WALL_HEIGHT, WALL_WIDTH } from './PongSettings';

const WALL_COLOR = 'black'

interface GameFrameProps {
	width: number,
	height: number
}

function GameFrame({ width, height } : GameFrameProps) {
	const walls = useRef<Obstacle[]>([WALL_PLACEHOLDER, WALL_PLACEHOLDER, WALL_PLACEHOLDER, WALL_PLACEHOLDER]);
	
	useEffect(() => {
    //console.log("Updating walls");
    walls.current = [
      {
        // UP
        x: -WALL_WIDTH,
        y: -WALL_HEIGHT,
        width: width + 2 * WALL_WIDTH,
        height: WALL_HEIGHT,
      },
      {
        // BOTTOM
        x: -WALL_WIDTH,
        y: height,
        width: width + 2 * WALL_WIDTH,
        height: WALL_HEIGHT,
      },
      {
        // RIGHT
        x: width,
        y: -WALL_HEIGHT,
        width: WALL_WIDTH,
        height: height + 2 * WALL_HEIGHT,
      },
      {
        // LEFT
        x: -WALL_WIDTH,
        y: -WALL_HEIGHT,
        width: WALL_WIDTH,
        height: height + 2 * WALL_HEIGHT,
      },
    ];
  }, [width])

	return (
		<>
            <Rect x={walls.current[2].x} y={walls.current[2].y} width={walls.current[2].width} height={walls.current[2].height} fill={WALL_COLOR}/>
            <Rect x={walls.current[3].x} y={walls.current[3].y} width={walls.current[3].width} height={walls.current[3].height} fill={WALL_COLOR}/>
			<Line points={[0, height / 2, width, height / 2]} stroke='black' strokeWidth={1} dash={[10, 10]}/>
		</>
	)
}

export default GameFrame;