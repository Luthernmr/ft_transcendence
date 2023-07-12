import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { Box, Button, Center, Flex, Spacer, Text } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import QueueWidget from './QueueWidget';
import MatchHistory from '../User/MatchHistory';

interface HomeScreenProps {
	pongQueue: boolean,
	gnopQueue: boolean,
}

function HomeScreen(props: HomeScreenProps) {
	const [joinedClassic, setJoinedClassic] = useState<boolean>(props.pongQueue);
	const [joinedCustom, setJoinedCustom] = useState<boolean>(props.gnopQueue);

	const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");

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
			<Flex direction='column' w='100%' h={600}>
				<Button onClick={() => pongSocket.emit("Watch")}>Watch</Button>
				<Box w='100%' h='15%'>
					<Center>
						<Text as='b' fontSize=';xl'>Play</Text>
					</Center>
				</Box>
				<Flex direction='row' w='100%' h='70%'>
					<Box w='100%'>
						<Flex direction='column' w='100%' h={['10%', '50%', '80%', '100%']}>
							<Center h='100%'>
								<QueueWidget name='PONG' joined={joinedClassic} joinQueue={() => JoinQueue(false)} leaveQueue={() => LeaveQueue(false)} />
							</Center>
						</Flex>
					</Box>
					<Spacer />
					<Box w='100%'>
						<Flex direction='column' w='100%' h={['10%', '50%', '80%', '100%']}>
							<Center h='100%'>
								<QueueWidget name='GNOP' joined={joinedCustom} joinQueue={() => JoinQueue(true)} leaveQueue={() => LeaveQueue(true)} />
							</Center>
						</Flex>
					</Box>
				</Flex>
				<Flex direction='column'>
					<Box h='15%'></Box>
					<Box w='100%' h={100}>
						<Center>
							<Text as='b' fontSize=';xl'>Recent Matches</Text>
						</Center>
					</Box>
					<Box w='100%' h='100%'>
						<MatchHistory user={currentUser} />
					</Box>
				</Flex>
			</Flex>
		</>
	)
}

export default HomeScreen;