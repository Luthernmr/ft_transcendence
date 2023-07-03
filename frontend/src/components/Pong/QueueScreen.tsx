import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import { Button, Center } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';

function QueueScreen() {
	return (
        <h1>In Queue...</h1>
	)
}

export default QueueScreen;