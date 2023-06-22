import {
	Image,
	Flex,
	Box,
	FormControl,
	FormLabel,
	Input,
	Stack,
	Link,
	Button,
	Heading,
	Text,
	useColorModeValue,
	useToast,
	HStack,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	PinInput,
	PinInputField,
	VStack,
	useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { FormEventHandler } from 'react';
import { useState, ChangeEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import TwoFA from './TwoFA';
interface FormValue {
	email: string;
	password: string;
}

interface OnlineResponse {
	online: boolean;
}

export default function loginCard() {

	const [formValue, setFormValue] = useState<FormValue>({
		email: '',
		password: ''
	});

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setFormValue({ ...formValue, [event.target.name]: event.target.value });
	};
	const navigate = useNavigate();
	const toast = useToast()

	const handleSubmit = async (event: any) => {
		event.preventDefault();
		try {
			const response = await axios.post(import.meta.env.VITE_BACKEND + '/api/login', {
				"email": formValue.email,
				"password": formValue.password
			}, { withCredentials: true });
			if (response.data.token) {
				navigate('/Home');
				console.log('token,normal', response.data.token);
				sessionStorage.setItem('jwt', response.data.token);
			}
			if (!response.data) {
				onOpen()
			}
			console.log(response.data.status)
			if (response.data.status == 401 || response.data.status == 400) {
				toast({
					title: `invalid login , do you have an account ?`,
					status: 'error',
					isClosable: true,
					position: 'top'
				})
			}



		} catch (error) {

			toast({
				title: `Empty information`,
				status: 'error',
				isClosable: true,
				position: 'top'
			})
			console.log(error);
		}
	};

	const connectAPI = async (event: any) => {
		window.location.href = import.meta.env.VITE_42AUTH;
	}
	const [pinCode, setPinCode] = useState("");

	const { isOpen, onOpen, onClose } = useDisclosure();

	

	return (
		<form onSubmit={handleSubmit}>
			<Flex
				minH={'100vh'}
				align={'center'}
				justify={'center'}
				bg={useColorModeValue('gray.50', 'gray.800')}>
				<Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
					<Stack align={'center'}>
						<Heading fontSize={'4xl'}>Welcome Back</Heading>
					</Stack>
					<Box
						rounded={'lg'}
						bg={useColorModeValue('white', 'gray.700')}
						boxShadow={'lg'}
						p={8}>
						<Stack spacing={4}>
							<FormControl id="email">
								<FormLabel>Email address</FormLabel>
								<Input type="email" name="email" placeholder="enter an email" value={formValue.email} onChange={handleChange} />
							</FormControl>
							<FormControl id="password">
								<FormLabel>Password</FormLabel>
								<Input type="password" name="password" placeholder="enter an password" value={formValue.password} onChange={handleChange} />
							</FormControl>
							<Stack spacing={10}>
								<Button bg={'blue.400'} color={'white'} _hover={{ bg: 'blue.500' }} type="submit">
									Login 👋
								</Button>
								<Button bg={'#00babb'} color={'white'} _hover={{ bg: 'blue.500' }} onClick={connectAPI}>
									<Image boxSize='30px' src="./src/assets/42_Logo.svg"></Image>
								</Button>
								<Text>
									T'as pas encore de compte mon reuf ? {' '}
									<Link color='teal.500' href='/Register'>
										J'arrive l'equipe.
									</Link>
								</Text>
							</Stack>
						</Stack>
					</Box>
				</Stack>
			</Flex>
		<Modal onClose={onClose} isOpen={isOpen} isCentered>
			<TwoFA />
		</Modal>
			
		</form>

	)
}

