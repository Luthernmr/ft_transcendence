import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { Box, Button, Center, Flex, Spacer, Text } from '@chakra-ui/react';
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
		<Flex       borderRadius={"md"}
      bg={"white"}
      padding={"15px"}
      height="100%"
      flex={"1"}
      direction="column">
			<Flex direction='column' w='100%' h={600}>
				<Box w='100%' h='15%'>
					<Center>
						<Box w='90%' h='80%'>
							<Center><Text as='b' fontSize=';xl'>Play</Text></Center>
						</Box>
					</Center>
				</Box>
				<Flex direction='row' w='100%' h='70%'>
					<Box w='100%'>
						<Flex direction='column' w={[100, 280, 360, 530]} h={['10%', '50%', '80%', '100%']}>
							<Center h='100%'>
								<QueueWidget name='PONG' joined={joinedClassic} joinQueue={() => JoinQueue(false)} leaveQueue={() => LeaveQueue(false)} />
							</Center>
						</Flex>
					</Box>
					<Spacer />
					<Box w='100%'>
						<Flex direction='column' w={[100, 280, 360, 530]} h={['10%', '50%', '80%', '100%']}>
							<Center h='100%'>
								<QueueWidget name='GNOP' joined={joinedCustom} joinQueue={() => JoinQueue(true)} leaveQueue={() => LeaveQueue(true)} />
							</Center>
						</Flex>
					</Box>
				</Flex>
				{/* <Matches /> */}
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
			</Flex>
		</>
	)
}

export default HomeScreen;