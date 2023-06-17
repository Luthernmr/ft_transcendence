import { Card, CardHeader, CardBody, CardFooter, Heading, Stack, Text, Box, Avatar, Flex, HStack } from '@chakra-ui/react'

export default function MatchHistory() {
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
			{[1, 1, 0, 1, 0, 1].map((size) => (
				<Card key={size} size={'sm'} bg={handleBg({ size })}>
					<CardBody >
						<Flex justifyContent={'space-around'} alignItems={'center'}>
							<HStack spacing={'2'} >
								<Avatar name='Adversaire' src='https://bit.ly/kent-c-dodds' size='xl' />
								<Text fontWeight={'hairline'} fontSize={'2xl'} color={'white' }>VS</Text>
								<Avatar name='Adversaire' src='https://bit.ly/code-beast' size='xl' />
							</HStack>
							<Flex flexDirection={'column'}  alignItems={'center'}>
								<Text fontWeight={'thin'} fontSize={'2xl'} color={'yellow.300'}>{handleIssue({size})}</Text>
							<Text fontSize={'4xl'} color={'white' }>11 - 9</Text>
							</Flex>
							<Text fontWeight={'hairline'} fontSize={'2xl'} color={'white' }> +15 XP</Text>
						</Flex>
					</CardBody>
				</Card>
			))}
		</Stack>
		</>
	)
}