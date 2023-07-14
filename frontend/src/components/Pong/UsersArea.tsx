import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Stack, Wrap, Text, WrapItem, Flex, Spacer, Box, Center, HStack, Circle, Square } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { OFFSET_X, OFFSET_Y, UserDatas } from './PongSettings';
import { Layout } from 'antd';

const BASE_SCORE_SIZE = 85;
const BASE_FONT_SIZE = 56;

interface UserAreaProps {
	width: number,
	height: number,
	size: number,
	mirror: boolean,
	scoreP1: number,
	scoreP2: number,
	user1Datas: UserDatas,
	user2Datas: UserDatas
}

function UserArea(props: UserAreaProps) {
	return (
		<>
			<Center w='100%' h='100%'>
				<Box w='80%' h='80%'>
					<Flex w='100%' direction='column' height='100%'>
						<Box width='100%'>
							<Center>
								<Stack spacing={{sm: 1, md: 2, lg: 3, xl: 5}}>
									<Avatar name={props.user1Datas.nickname} src={props.user1Datas.imgPdp} size={{sm: "sm", md: "md", lg: "lg", xl: "xl"}} />
									<Text as='b' align='center' fontSize={{ base: '12px', md: '10px', lg: '25px' }}>{props.user1Datas.nickname}</Text>
								</Stack>
							</Center>
						</Box>
						<Spacer />
						<Circle alignSelf='center' size={BASE_SCORE_SIZE * props.size} bg='black' color='white'>
							<Text fontSize={BASE_FONT_SIZE * props.size} align='center'>{props.scoreP1}</Text>
						</Circle>
						<Spacer />
						<Circle alignSelf='center' size={BASE_SCORE_SIZE * props.size} bg='black' color='white'>
							<Text fontSize={BASE_FONT_SIZE * props.size} align='center'>{props.scoreP2}</Text>
						</Circle>
						<Spacer />
						<Box width='100%'>
							<Center>
								<Stack spacing={{sm: 1, md: 2, lg: 3, xl: 5}}>
									<Text as='b' align='center' fontSize={{ base: '12px', md: '10px', lg: '25px' }}>{props.user2Datas.nickname}</Text>
									<Avatar name={props.user2Datas.nickname} src={props.user2Datas.imgPdp} size={{sm: "sm", md: "md", lg: "lg", xl: "xl"}} />
								</Stack>
							</Center>
						</Box>
					</Flex>
				</Box>
			</Center>
		</>
	)
}

export default UserArea;