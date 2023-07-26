import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { Box, Button, Center, Divider, Flex, Spacer, Text, useToast } from '@chakra-ui/react';
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

	const toast = useToast();

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

	const WatchGame = () => {
		pongSocket.emit("Watch", (response: {status: string}) => {
			if (response.status === "NONE") {
				toast({
					title: 'No game to watch',
					description: "There is no game currently running.",
					status: "error",
					duration: 3000,
					isClosable: true
				})
			}
		});
	}
	
	return (
		<>
			<Flex direction='column' w='100%' h='100%'>
				
				<Box w='100%' h={['10%', '10%', '20%', '20%']}>
					<Center w='100%' h='100%'>
						<Text as='b' fontSize='2xl'>Play</Text>
					</Center>
				</Box>
				<Flex direction='row' w='100%' h={['10%', '30%', '80%', '100%']} minHeight={100} maxHeight={400}>
					<Box w='100%' minWidth={50}>
						<Center w='100%' h='100%'>
							<QueueWidget name='PONG' joined={joinedClassic} joinQueue={() => JoinQueue(false)} leaveQueue={() => LeaveQueue(false)} />
						</Center>
					</Box>
					<Divider orientation='vertical' />
					<Box w='100%' minWidth={50}>
						<Center w='100%' h='100%'>
							<QueueWidget name='GNOP' joined={joinedCustom} joinQueue={() => JoinQueue(true)} leaveQueue={() => LeaveQueue(true)} />
						</Center>
					</Box>
				</Flex>
				<Box w='100%' h='100%' minHeight={7} maxHeight={100}>
					<Center w='100%' h='100%'>
						<Box w='85%' h='100%' bg='teal.300' borderRadius='25'>
							<Box as='button'
							bg="rgba(76, 175, 80, 0.1)" w='100%' h='100%' borderRadius='25'
							_hover={{
							bg: "rgba(255, 255, 255, 0.3)"
							}} fontSize={'xl'} onClick={WatchGame}>
								<Text fontSize={["md", "lg", "xl", "2xl"]} align='center'>Watch a game</Text>
							</Box>
						</Box>
					</Center>
				</Box>
				<Box w='100%' h='100%' minHeight={5} maxHeight={50} />
				<Box w='100%' h='100%' maxHeight={300}>
						<Box w='100%' h='20%' borderRadius={10} bg='gray.100' >
							<Center w='100%' h='100%'>
								<Text as='b' fontSize='2xl'>Recent Matches</Text>
							</Center>
						</Box>
						<Box w='100%' h='80%'>
							<MatchHistory user={currentUser} />
						</Box>
				</Box>
			</Flex>
		</>
	)
}

export default HomeScreen;