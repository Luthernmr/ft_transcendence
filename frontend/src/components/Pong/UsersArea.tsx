import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Stack, Wrap, Text, WrapItem, Flex, Spacer, Box, Center, HStack, Circle, Square } from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { OFFSET_X, OFFSET_Y, UserDatas } from './PongSettings';
import { Layout } from 'antd';

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
								<HStack spacing='10%'>
									<Avatar name={props.user1Datas.nickname} src={props.user1Datas.imgPdp} size={["xm", "md", "lg", "xl"]} />
									<Text as='b' fontSize={{ base: '12px', md: '10px', lg: '25px' }}>{props.user1Datas.nickname}</Text>
								</HStack>
							</Center>
						</Box>
						<Spacer />
						<Circle size='xm' bg='black' color='white'>
							<Text fontSize={{ base: '23px', md: '20px', lg: '56px' }} align='center'>{props.scoreP1}</Text>
						</Circle>
						<Spacer />
						<Circle size='xm' bg='black' color='white'>
							<Text fontSize={{ base: '23px', md: '20px', lg: '56px' }} align='center'>{props.scoreP2}</Text>
						</Circle>
						<Spacer />
						<Box width='100%'>
							<Center>
								<HStack spacing='10%'>
									<Avatar name={props.user2Datas.nickname} src={props.user2Datas.imgPdp} size={["xm", "md", "lg", "xl"]} />
									<Text as='b' fontSize={{ base: '12px', md: '10px', lg: '25px' }}>{props.user2Datas.nickname}</Text>
								</HStack>
							</Center>
						</Box>
					</Flex>
				</Box>
			</Center>
		</>
	)
}

export default UserArea;