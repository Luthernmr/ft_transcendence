import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Spinner } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';

function LoadScreen() {
	return (
		<>
			<Spinner />
		</>
	)
}

export default LoadScreen;