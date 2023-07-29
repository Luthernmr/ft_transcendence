import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Stack, Wrap, Text, WrapItem, Flex, Spacer, Box, Center, HStack, Circle, Square, Show, Hide, AvatarBadge} from '@chakra-ui/react';
import { pongSocket } from '../../sockets/sockets';
import { OFFSET_X, OFFSET_Y, UserDatas } from './PongSettings';
import { Layout } from 'antd';

const BASE_SCORE_SIZE = 85;
const BASE_FONT_SIZE = 56;

interface UserAreaProps {
	width: number,
	height: number,
	mirror: boolean,
	scoreP1: number,
	scoreP2: number,
	user1Datas: UserDatas,
	user2Datas: UserDatas,
}

const avatarBreakpoints = {
	md: "md",
	lg: "lg",
	xl: "xl"
}

const nicknameBreakpoints = {
	sm: '13px',
	md: '15px',
	lg: '25px'
}

const scoreCirclesBreakpoints = [
	'10px',
	'50px',
	'40px',
	'60px',
	'70px',
	'90px'
]

const scoreTextBreakpoints = [
	'10px',
	'25px',
	'30px', 
	'40px',
	'55px',
	'60px'
]

const nickAvatarSpacingBreakpoints = {
	sm: 1,
	md: 2,
	lg: 3,
	xl: 5
}

function StringMaxLength(s: string, n: number) : string {
	if (s.length <= n)
		return s;
	
	const stringCut=s.slice(0, n - 2) + ".";
	console.log("cut " + s + " to " + stringCut);
	return stringCut;
}

function UserArea(props: UserAreaProps) {
	return (
		<>
			<Center w='100%' h='100%'>
				<Box w='80%' h='100%'>
					<Flex w='100%' h='100%' direction='column' height='100%' minWidth='20px' maxWidth='200'>
						<Box width='100%' h='100%'>
							<Center h='100%'>
								<Stack spacing={nickAvatarSpacingBreakpoints}>
									<Hide below='md'>
										<Center>
											<Avatar border={10} name={props.user1Datas.nickname} src={props.user1Datas.imgPdp} size={avatarBreakpoints} />
										</Center>
									</Hide>
									<Text as='b' align='center' fontSize={nicknameBreakpoints}>{StringMaxLength(props.user1Datas.nickname, 10)}</Text>
								</Stack>
							</Center>
						</Box>
						<Circle alignSelf='center' size={scoreCirclesBreakpoints} bg='black' color='white'>
							<Text fontSize={scoreTextBreakpoints} align='center'>{props.scoreP1}</Text>
						</Circle>
						<Box h='10%' minHeight='5px' />
						<Circle alignSelf='center' size={scoreCirclesBreakpoints} bg='black' color='white'>
							<Text fontSize={scoreTextBreakpoints} align='center'>{props.scoreP2}</Text>
						</Circle>
						<Box width='100%' h='100%'>
							<Center h='100%'>
									<Stack spacing={nickAvatarSpacingBreakpoints}>
										<Text as='b' align='center' fontSize={nicknameBreakpoints}>{StringMaxLength(props.user2Datas.nickname, 10)}</Text>
										<Hide below='md'>
											<Center>
												<Avatar name={props.user2Datas.nickname} src={props.user2Datas.imgPdp} size={avatarBreakpoints} />
											</Center>
										</Hide>
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