import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center, NumberIncrementStepperProps } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';

interface BallProps {
	x: number,
	y: number,
	width: number,
	height: number
}

function Ball({x, y, width, height} : BallProps) {
	return (
		<>
			<Rect x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill='black'
                  cornerRadius={height / 2}/>
		</>
	)
}

export default Ball;