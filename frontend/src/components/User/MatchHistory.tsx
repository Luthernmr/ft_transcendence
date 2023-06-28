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
	useEffect(() => {
		try {
			const getUser = async () => {
				const resp = await axios.get(import.meta.env.VITE_BACKEND + '/user/matchHistory/' + props.user.id, {
					withCredentials: true,
				})
				console.log('history : ' ,resp.data);
				setMatchHistorys(resp.data.matchHistory)
			}
			getUser();
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
									<Text fontSize={'4xl'} color={'white'}>{matchHistory.scoreUser1} - 9</Text>
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