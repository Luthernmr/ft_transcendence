import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';

interface QueueScreenProps {
	leaveQueue: Function
}

function QueueScreen(props: QueueScreenProps) {
	
	function LeaveQueue() {
		pongSocket.emit('leaveQueue');
		props.leaveQueue();
	}
	
	return (
		<>
			<h1>In Queue...</h1>
			<Button onClick={LeaveQueue}>LeaveQueue</Button>
		</>
	)
}

export default QueueScreen;