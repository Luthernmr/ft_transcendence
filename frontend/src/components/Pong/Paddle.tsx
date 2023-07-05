import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';

interface PaddleProps {
	x: number,
	y: number,
	width: number,
	height: number
}

function Paddle({x, y, width, height}: PaddleProps) {
	return (
		<>
			<Rect x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill='black'
				  cornerRadius={10} />
		</>
	)
}

export default Paddle;