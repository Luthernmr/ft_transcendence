import React, { useState, useEffect, useRef } from 'react';
import { Button, Center } from '@chakra-ui/react';
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
				<Button onClick={JoinQueue}>Join Queue</Button>
			</>
		)
	} else {
		return (
			<>
				<h1>In Queue...</h1>
				<Button onClick={LeaveQueue}>LeaveQueue</Button>
			</>
		)
	}
}

export default QueueWidget;