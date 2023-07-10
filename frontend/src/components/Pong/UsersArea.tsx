import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Stack, Wrap, Text, WrapItem, Flex, Spacer, Box } from '@chakra-ui/react';
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
			<Flex direction='column' height='100%'>
				<Flex width='100%'>
					<Avatar name={props.user1Datas.nickname} src={props.user1Datas.imgPdp} size={["sm", "md", "lg", "xl"]} />
					<Text align='center'>{props.user1Datas.nickname}</Text>
				</Flex>
				<Spacer />
				<Text fontSize={{ base: '24px', md: '40px', lg: '56px' }} align='left'>{props.scoreP1}</Text>
				<Spacer />
				<Text fontSize={{ base: '24px', md: '40px', lg: '56px' }} align='left'>{props.scoreP2}</Text>
				<Spacer />
					<Flex width='100%'>
					<Avatar name={props.user2Datas.nickname} src={props.user2Datas.imgPdp} size={["sm", "md", "lg", "xl"]} />
					<Text align='center'>{props.user2Datas.nickname}</Text>
				</Flex>
			</Flex>
		</>
	)
}

export default UserArea;