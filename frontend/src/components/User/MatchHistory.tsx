import { Card, CardBody, Heading, Stack, Text, Avatar, Flex, HStack, Center } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link as RouteLink } from "react-router-dom";

import { User } from '../Social/AllUserItem';
import axios from 'axios';

export interface MatchHistory {
	id: number,
	opponent: User,
	winner: boolean,
	myScore: number,
	opponentScore: number,
	customMode : boolean
}

export default function MatchHistory(props: any) {
	const [winCount, setWinCount] = useState(0)
	const [looseCount, setLooseCount] = useState(0)
	const [matchCount, setMatchCount] = useState(0)


	useEffect (() => {
		setMatchCount(matchHistorys.length)
	})
	function handleBg(issue: any) {
		if (issue)
			return ('#68b7a1')
		return ('red.400')
	}

	function handleIssue(issue: any) {
		if (issue)
		{
			setWinCount(winCount + 1)
			return ('WIN')
		}
		setLooseCount(looseCount + 1)
		return ('LOOSE')
	}

	if (matchHistorys.length) {
		return (
			<>
				<Stack spacing='1'>
					{matchHistorys.map((matchHistory) => (
						<Card key={matchHistory.id} size={'sm'} bg={handleBg(matchHistory?.winner)}>
							<CardBody >
								<Flex justifyContent={'space-around'} alignItems={'center'}>
									<HStack spacing={'2'} >
										<Avatar name={props?.user?.nickname} src={props?.user?.imgPdp} size='xl' />
										<Text fontWeight={'hairline'} fontSize={'2xl'} color={'white'}>VS</Text>
										<Avatar _hover={{ opacity: '50%' }} as={RouteLink} to={'/profile/' + matchHistory?.opponent?.id} name={matchHistory?.opponent?.nickname} src={matchHistory?.opponent?.imgPdp} size='xl' />
									</HStack>
									<Flex flexDirection={'column'} alignItems={'center'}>
										<Text fontWeight={'thin'} fontSize={'2xl'} color={'yellow.300'}>{handleIssue(matchHistory?.winner)}</Text>
										<Text fontSize={'4xl'} color={'white'}>{matchHistory?.myScore} - {matchHistory?.opponentScore} </Text>
									</Flex>
									{matchHistory?.customMode &&
									<Text fontWeight={'hairline'} fontSize={'2xl'} color={'white'}>GNOP GAME</Text>
									}
									{!matchHistory?.customMode &&
									<Text fontWeight={'hairline'} fontSize={'2xl'} color={'white'}>NORMAL GAME</Text>
									}
								</Flex>
							</CardBody>
						</Card>
					))}
				</Stack>
			</>
		)
	}
	else
		return (
			<Center>
				<Heading color={'gray.500'}>This user has not yet played a game</Heading>
			</Center>
		)
}