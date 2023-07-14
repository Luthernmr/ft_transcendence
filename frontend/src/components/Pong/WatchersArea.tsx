import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Stack, Wrap, Text, WrapItem, Flex, Spacer, Box, Center, HStack, Circle, Square, Grid, GridItem } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { OFFSET_X, OFFSET_Y, UserDatas } from './PongSettings';

interface WatchersAreaProps {
	watchers: Array<UserDatas>
}

function WatchersArea(props: WatchersAreaProps) {
	const avatars : Array<UserDatas | undefined> = [];

	for (let i = 0; i < 15; i++) {
		avatars.push(undefined);
	}

	const max = Math.min(15, props.watchers.length);

	for (let i = 0; i < max; i++) {
		avatars[i] = props.watchers[i];
	}
	
	return (
		<>
			<Flex direction='column' w='100%' h='100%'>
				<Box w='100%' h='40%'>
					<Center w='100%' h='100%'>
						<Text as='b' fontSize='xl' align='center'>Currently Watching</Text>
					</Center>
				</Box>
				<Center w='100%' h='80%'>
					<Grid
						w='70%'
						h='100%'
						templateRows={{sm: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)'}}
						templateColumns={{sm: 'repeat(5, 1fr)', md: 'repeat(5, 1fr)', lg: 'repeat(5, 1fr)', xl: 'repeat(3, 1fr)'}}
						gap={4}>
						{avatars.map((a, i) => <GridItem key={i} rowSpan={1}><Avatar name={a?.nickname} src={a?.imgPdp} w='100%' h='100%'/></GridItem>)}
					</Grid>
				</Center>
			</Flex>
		</>
	)
}

export default WatchersArea;