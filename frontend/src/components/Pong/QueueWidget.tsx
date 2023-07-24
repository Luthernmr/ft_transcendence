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
				<Box bg='teal.300' w='70%' h='80%' borderRadius='25'>
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
				<Box bg='teal.300' w='70%' h='80%' borderRadius='25'>
					<Flex direction='column' w='100%' h='100%'>
						<Box h='33%'>
							<Center h='100%'>
								<Text as='b' fontSize={["md", "lg", "xl", "2xl"]} align='center'>{props.name}</Text>
							</Center>
						</Box>
						<Box h='33%'>
							<Center h='100%'>
								<Spinner size={['sm', 'sm', 'md', 'md']} alignSelf='center'/>
							</Center>
						</Box>
						<Box h='33%' w='100%'>
							<Center h='100%'>
								<Button bg='teal.300' size={['xm', 'xm', 'md', 'md']} minWidth={50} fontSize={["xs", "sm", "md", "lg"]} onClick={LeaveQueue}
										_hover={{
										bg: "rgba(255, 255, 255, 0.3)"
										}}>Leave</Button>
								</Center>
						</Box>
					</Flex>
				</Box>
			</>
		)
	}
}

export default QueueWidget;