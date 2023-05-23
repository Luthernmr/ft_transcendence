import { Box, Flex, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
export default function Home() {


	return (
		<Flex width="100%">
			
		<Box
		bg="white"
		borderRadius="lg"
		p={4}
		boxShadow="md"
		w="100%"
		maxW="500px">
			<Text>prout</Text>
		</Box>
		</Flex>
	)
}