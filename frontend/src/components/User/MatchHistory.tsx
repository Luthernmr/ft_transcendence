import { Card, CardHeader, CardBody, CardFooter, Heading, Stack, Text, Box, Avatar, Flex, HStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { User } from '../Social/AllUserItem';
import axios from 'axios';

export interface MatchHistory {
	id: number,
	user1: number,
	user2: number,
	winnerID: number,
	scoreUser1: number,
	scoreUser2: number
}

export default function MatchHistory(props :any) {
	const [matchHistorys, setMatchHistorys] = useState<MatchHistory>()
	useEffect(() => {
		try {
			const getHistory = async () => {
				try {
					console.log('before getHIsto')
					const resp = await axios.get(import.meta.env.VITE_BACKEND + '/user/history/' + props?.user?.id , {
						withCredentials: true,
					})
					setMatchHistorys(resp.data.history)
				} catch(error)
				{
					console.log('error', error);
				}
			}
			getHistory()
		}
		catch (error) {
			console.log(error)
		}
	}, [props?.user?.id])
	
	useEffect(() => {
		console.log('id', props?.user?.id);
		console.log('historyss winner id:', matchHistorys?.winnerID);
	}, [matchHistorys]);
	
	function handleBg(issue: any) {
		console.log('issue', issue)
		if (issue)
			return ('#68b7a1')
		return ('red.400')
	}

	function handleIssue(issue: any) {
		console.log('issue', issue)
		if (issue)
			return ('WIN')
		return ('LOOSE')
	}

	return (
		<>
			<Stack spacing='1'>
					<Card size={'sm'} bg={handleBg(props?.user?.id == matchHistorys?.winnerID)}>
						<Text>--- {matchHistorys?.winnerID} , {props?.user?.id}</Text>
						<CardBody >
							<Flex justifyContent={'space-around'} alignItems={'center'}>
								<HStack spacing={'2'} >
									<Avatar name='Adversaire' src='https://bit.ly/kent-c-dodds' size='xl' />
									<Text fontWeight={'hairline'} fontSize={'2xl'} color={'white'}>VS</Text>
									<Avatar name='Adversaire' src='https://bit.ly/code-beast' size='xl' />
								</HStack>
								<Flex flexDirection={'column'} alignItems={'center'}>
									<Text fontWeight={'thin'} fontSize={'2xl'} color={'yellow.300'}>{handleIssue(props?.user?.id == matchHistorys?.winnerId )}</Text>
									<Text fontSize={'4xl'} color={'white'}>{matchHistorys?.scoreUser1} - {matchHistorys?.scoreUser2} </Text>
								</Flex>
								<Text fontWeight={'hairline'} fontSize={'2xl'} color={'white'}>+15 XP</Text>
							</Flex>
						</CardBody>
					</Card>
			</Stack>
		</>
	)
}