import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Stack, Wrap, Text, WrapItem, Flex, Spacer, Box, Center, HStack, Circle, Square, Grid, GridItem, Button } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { OFFSET_X, OFFSET_Y, UserDatas } from './PongSettings';

interface WatchersAreaProps {
	watchers: Array<UserDatas>,
	leaveWatch: Function
	isWatcher: boolean
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
			<Flex direction='column' w='100%' h='100%' minHeight={150}>
				<Box w='100%' h='40%' minHeight={10}>
					<Center w='100%' h='100%'>
						<Box w='80%' h='80%' bg='gray.200' borderRadius={30}>
							<Center w='100%' h='100%'>
								<Text as='b' fontSize={{sm: 10, md:14, lg: 17, xl: 20}} align='center'>Currently Watching</Text>
							</Center>
						</Box>
					</Center>
				</Box>
				<Box h='15%'/>
				<Center w='100%' h='80%'>
					<Grid
						w='70%'
						h='100%'
						templateRows={{base: 'repeat(3, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)'}}
						templateColumns={{base: 'repeat(5, 1fr)', sm: 'repeat(5, 1fr)', md: 'repeat(5, 1fr)', lg: 'repeat(5, 1fr)', xl: 'repeat(3, 1fr)'}}
						gap={4}>
						{avatars.map((a, i) => <GridItem key={i} rowSpan={1}><Avatar name={a?.nickname} src={a?.imgPdp} w='100%' h='100%'/></GridItem>)}
					</Grid>
				</Center>
				{ props.isWatcher &&
				<Flex direction='column'>
					<Box h='20%' minHeight={'10px'} />
					<Center>
						<Button w={{base: '20%', sm: '20%', md:'20%', lg: '30%', xl: '50%'}}
								fontSize={{sm: 10, md:14, lg: 17, xl: 20}}
								onClick={() => props.leaveWatch()}
								bg='red.100'
								>
							Leave
						</Button>
					</Center>
				</Flex>
				}
			</Flex>
		</>
	)
}

export default WatchersArea;