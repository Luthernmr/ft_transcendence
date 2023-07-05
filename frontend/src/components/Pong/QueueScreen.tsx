import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { QueueState } from './PongSettings';

interface QueueScreenProps {
	state: QueueState;
}

function QueueScreen(props: QueueScreenProps) {
	if (props.state === QueueState.Joined) {
		return (
			<h1>In Queue...</h1>
		)
	} else if (props.state === QueueState.AlreadyIn) {
		return (
			<h1>You are already in queue !</h1>
		)
	}
}

export default QueueScreen;