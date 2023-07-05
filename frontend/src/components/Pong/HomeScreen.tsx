import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';

interface HomeScreenProps {
	JoinPong: () => void;
	JoinGnop: () => void;
	WatchGame: () => void;
}

function HomeScreen(props: HomeScreenProps) {
	return (
		<>
			<Button onClick={ props.JoinPong }>
				Join PONG Queue
			</Button>
			<Button onClick={ props.JoinGnop }>
				Join GNOP Queue
			</Button>
			<Button onClick={ props.WatchGame }>
				Watch Random Game
			</Button>
		</>
	)
}

export default HomeScreen;