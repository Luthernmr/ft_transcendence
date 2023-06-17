import {
	Button,
	Flex,
	Heading,
	Image,
	Stack,
	Text,
	useBreakpointValue,
  } from '@chakra-ui/react';

import { Link as RouteLink} from "react-router-dom";

  
  export default function Home() {
	return (
	  <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
		<Flex p={8} flex={1} align={'center'} justify={'center'}>
		  <Stack spacing={6} w={'full'} maxW={'lg'}>
			<Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
			  <Text
				as={'span'}
				position={'relative'}
				_after={{
				  content: "''",
				  width: 'full',
				  height: useBreakpointValue({ base: '20%', md: '30%' }),
				  position: 'absolute',
				  bottom: 1,
				  left: 0,
				  bg: 'blue.400',
				  zIndex: -1,
				}}>
				Bievenue
			  </Text>
			  <br />{' '}
			  <Text color={'blue.400'} as={'span'}>
				Sur notre Pong
			  </Text>{' '}
			</Heading>
			<Text fontSize={{ base: 'md', lg: 'lg' }} color={'gray.500'}>
			 projet etudiant
			</Text>
			<Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
			  <Button
			  	as={RouteLink} to="/register"
				rounded={'full'}
				bg={'blue.400'}
				color={'white'}
				_hover={{
				  bg: 'blue.500',
				}}>
				s'inscrire
			  </Button>
			  <Button as={RouteLink} to="/login" rounded={'full'}>se connecter</Button>
			</Stack>
		  </Stack>
		</Flex>
		<Flex flex={1}>
		  <Image
			alt={'Login Image'}
			objectFit={'cover'}
			src={
			  'https://mcdn.wallpapersafari.com/medium/64/28/3ibj0E.jpg'
			}
		  />
		</Flex>
	  </Stack>
	);
  }