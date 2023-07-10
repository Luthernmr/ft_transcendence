import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Box, Button, Center, Flex, Spacer } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import QueueWidget from './QueueWidget';
import Matches from './Matches';

interface HomeScreenProps {
	pongQueue: boolean,
	gnopQueue: boolean,
	WatchGame: () => void;
}

function HomeScreen(props: HomeScreenProps) {
	const [joinedClassic, setJoinedClassic] = useState<boolean>(props.pongQueue);
	const [joinedCustom, setJoinedCustom] = useState<boolean>(props.gnopQueue);

	const JoinQueue = (custom: boolean) => {
		pongSocket.emit('queue', { custom: custom });
		if (custom === false) {
			setJoinedClassic(true);
			setJoinedCustom(false);
		}
		else {
			setJoinedCustom(true);
			setJoinedClassic(false);
		}
	  }
	
	const LeaveQueue = (custom: boolean) => {
		pongSocket.emit('leaveQueue');
		if (custom === false)
			setJoinedClassic(false);
		else
			setJoinedCustom(false);
	  }
	
	return (
		<>
			<Flex direction='column'>
				<Flex direction='row' basis='content'>
					<Box bg='blue.100'>
						<Flex direction='column'>
							<Text align='center'>PONG</Text>
							<QueueWidget joined={joinedClassic} joinQueue={() => JoinQueue(false)} leaveQueue={() => LeaveQueue(false)} />
						</Flex>
					</Box>
					<Box bg='red.100'>
						<Flex direction='column'>
							<Text align='center'>GNOP</Text>
							<QueueWidget joined={joinedCustom} joinQueue={() => JoinQueue(true)} leaveQueue={() => LeaveQueue(true)} />
						</Flex>
					</Box>
				</Flex>
				<Matches />
			</Flex>
			{/* <Button onClick={ props.JoinPong }>
				Join PONG Queue
			</Button>
			<Button onClick={ props.JoinGnop }>
				Join GNOP Queue
			</Button>
			<Button onClick={ props.WatchGame }>
				Watch Random Game
			</Button> */}
		</>
	)
}

export default HomeScreen;