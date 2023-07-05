import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center, NumberIncrementStepperProps, propNames } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { OFFSET_X, OFFSET_Y } from './PongSettings';

interface UserAreaProps {
	width: number,
	height: number,
	size: number,
	mirror: boolean,
	scoreP1: number,
	scoreP2: number
}

function UserArea({width, height, size, mirror, scoreP1, scoreP2}: UserAreaProps) {
	if (mirror) {
		return (
			<>
				<Text fontSize={50} x={5} y={200} align='left' text={`${scoreP1}`} />
				<Text fontSize={50} x={5} y={height - 250} align='left' text={`${scoreP2}`} />
			</>
		)
	} else {
		return (
			<>
				<Text fontSize={50} x={5} y={height - 250} align='left' text={`${scoreP1}`} />
				<Text fontSize={50} x={5} y={200} align='left' text={`${scoreP2}`} />
			</>
		)
	}
}

export default UserArea;