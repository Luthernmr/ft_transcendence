import {
	Flex,
	Box,
	FormControl,
	FormLabel,
	Input,
	Checkbox,
	Stack,
	Link,
	Button,
	Heading,
	Text,
	useColorModeValue,
} from '@chakra-ui/react';
import axios from 'axios';
import { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormValue {
	email: string;
	nickname: string;
	password: string;
}

export default function registerCard() {

	const [formValue, setFormValue] = useState<FormValue>({
		email: '',
		nickname: '',
		password: ''
	});

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setFormValue({ ...formValue, [event.target.name]: event.target.value });
	};
	const navigate = useNavigate();
	const handleSubmit = async () => {
		try {
			const res = await axios.post(import.meta.env.VITE_BACKEND + '/api/register',
				{
					"nickname": formValue.nickname,
					"email": formValue.email,
					"password": formValue.password
				}
			);
			navigate('/login');
		}
		catch (error) {
			console.log('error', error)
		}

	};
	return (
		<Flex
			minH={'100vh'}
			align={'center'}
			justify={'center'}
			bg={useColorModeValue('gray.50', 'gray.800')}>
			<Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
				<Stack align={'center'}>
					<Heading fontSize={'4xl'}>Create Account </Heading>
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
						<FormControl id="pseudo">
							<FormLabel>Nickname</FormLabel>
							<Input type="nickname" name="nickname" placeholder="enter an nickname" value={formValue.nickname} onChange={handleChange} />
						</FormControl>
						<FormControl id="password">
							<FormLabel>Password</FormLabel>
							<Input type="password" name="password" placeholder="enter an password" value={formValue.password} onChange={handleChange} />
						</FormControl>
						<Stack spacing={10}>
							<Button bg={'blue.400'} color={'white'} _hover={{ bg: 'blue.500' }} onClick={handleSubmit}>
								Register 👋
							</Button>
							<Text>
								J'ai deja un compte sale fou ! {' '}
								<Link color='teal.500' href='/Login'>
									J'arrive l'equipe.
								</Link>
							</Text>
						</Stack>
					</Stack>
				</Box>
			</Stack>
		</Flex>
	);
}