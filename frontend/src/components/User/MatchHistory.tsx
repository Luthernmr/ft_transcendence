import { Card, CardHeader, CardBody, CardFooter, Heading, Stack, Text, Box, Avatar, Flex, HStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { User } from '../Social/AllUserItem';
import axios from 'axios';

export interface MatchHistory {
	id: number,
	user1: string,
	user2: string,
	scoreUser1: string,
	scoreUser2: string
}

export default function MatchHistory(props :any) {
	const [matchHistorys, setMatchHistorys] = useState<MatchHistory[]>([])
	console.log('ici:',props.user)
	useEffect(() => {
		try {
			const getHistory = async () => {
				try {
					console.log('before getHIsto')
					const resp = await axios.get(import.meta.env.VITE_BACKEND + '/user/history/7' , {
						withCredentials: true,
					})
					console.log('history : ', resp);
					setMatchHistorys(resp.data.matchHistory)
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
	}, [])

	function handleBg(issue: any) {
		console.log('issue', issue)
		if (issue.size)
			return ('#68b7a1')
		return ('red.400')
	}

	function handleIssue(issue: any) {
		console.log('issue', issue)
		if (issue.size)
			return ('WIN')
		return ('LOOSE')
	}

	return (
		<>
			<Stack spacing='1'>
				{matchHistorys.map((matchHistory) => (
					<Card key={matchHistory.id} size={'sm'} bg={handleBg({})}>
						<CardBody >
							<Flex justifyContent={'space-around'} alignItems={'center'}>
								<HStack spacing={'2'} >
									<Avatar name='Adversaire' src='https://bit.ly/kent-c-dodds' size='xl' />
									<Text fontWeight={'hairline'} fontSize={'2xl'} color={'white'}>VS</Text>
									<Avatar name='Adversaire' src='https://bit.ly/code-beast' size='xl' />
								</HStack>
								<Flex flexDirection={'column'} alignItems={'center'}>
									<Text fontWeight={'thin'} fontSize={'2xl'} color={'yellow.300'}>{handleIssue( 0 )}</Text>
									<Text fontSize={'4xl'} color={'white'}>- 9</Text>
								</Flex>
								<Text fontWeight={'hairline'} fontSize={'2xl'} color={'white'}> +15 XP</Text>
							</Flex>
						</CardBody>
					</Card>
				))}
			</Stack>
		</>
	)
}