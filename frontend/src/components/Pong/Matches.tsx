import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Spinner, Box, Center, Card } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';

function Matches() {
	return (
		<>
			<Box bg='green.100'>
				<Card>O 2 | 3 X</Card>
				<Card>O 2 | 3 X</Card>
				<Card>O 2 | 3 X</Card>
			</Box>
		</>
	)
}

export default Matches;