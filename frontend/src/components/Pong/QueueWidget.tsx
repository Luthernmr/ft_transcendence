import React, { useState, useEffect, useRef } from 'react';
import { Button, Center, Box, Flex, Text, Spinner,VStack  } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';

interface QueueQueueWidgetProps {
	name: string,
	joinQueue: Function,
	leaveQueue: Function,
	joined: boolean
}

function QueueWidget(props: QueueQueueWidgetProps) {
	
	function JoinQueue() {
		props.joinQueue();
	}

	function LeaveQueue() {
		props.leaveQueue();
	}
	
	if (props.joined === false) {
		return (
			<>
				<Box bg='teal.300' w='70%' h='100%' borderRadius='25' minWidth={50} minHeight={100}>
					<Box as='button' bg="rgba(76, 175, 80, 0.1)" w='100%' h='100%' borderRadius='25'
						_hover={{
						bg: "rgba(255, 255, 255, 0.3)"
						}} onClick={JoinQueue}>
						<Text as='b' fontSize={["md", "lg", "xl", "2xl"]} align='center'>{props.name}</Text>
						<Text fontSize={["xs", "sm", "md", "lg"]}>Join Queue</Text>
					</Box>
				</Box>
			</>
		)
	} else {
		return (
			<>
				<Box bg='teal.300' w='70%' h='100%' borderRadius='25' minWidth={50} minHeight={100}>
					<VStack h='100%' spacing={[2, 2, 5, 5]}>
						<Box h='33%'>
							<Center h='100%'>
							<Text as='b' fontSize={["md", "lg", "xl", "2xl"]} align='center'>{props.name}</Text>
							</Center>
						</Box>
						<Spinner size={['sm', 'sm', 'md', 'md']} alignSelf='center'/>
						<Button bg='teal.300' size={['xm', 'xm', 'md', 'md']} minWidth={50} fontSize={["xs", "sm", "md", "lg"]} onClick={LeaveQueue}
								_hover={{
								bg: "rgba(255, 255, 255, 0.3)"
								}}>Leave</Button>
					</VStack>
				</Box>
			</>
		)
	}
}

export default QueueWidget;