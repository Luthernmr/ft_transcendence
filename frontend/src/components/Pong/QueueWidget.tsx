import React, { useState, useEffect, useRef } from 'react';
import { Button, Center, Box, Flex, Text } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';

interface QueueQueueWidgetProps {
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
				<Box as='button' bg='green.100' w='50%' h='100%' onClick={JoinQueue}>
					Join Queue
				</Box>
			</>
		)
	} else {
		return (
			<>
				<Flex direction='column'>
					<Text align='center'>In Queue...</Text>
					<br></br>
					<Button onClick={LeaveQueue}>LeaveQueue</Button>
				</Flex>
			</>
		)
	}
}

export default QueueWidget;