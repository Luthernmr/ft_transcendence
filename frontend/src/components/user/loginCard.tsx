import {
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
  } from '@chakra-ui/react';
  import axios from 'axios';
import { FormEventHandler } from 'react';
  import {  useState, ChangeEvent, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';

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
		setFormValue({...formValue, [event.target.name]: event.target.value});
	  };
	  const navigate = useNavigate();

	 	const handleSubmit = async (event : any) =>  {
		event.preventDefault();
		try {
		  const response = await axios.post('http://212.227.209.204:5000/api/login', {
			"email" : formValue.email,
			"password" : formValue.password
		
		  }, { withCredentials: true });
		  console.log(response.data);
		  localStorage.setItem('token', response.data.token);
		  navigate('/Chat');
		} catch (error) {
			console.log(error);
		}
	};
	return (
	<>
	{ !localStorage.getItem('token') && (
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
				<Input type="email" name="email"  placeholder="enter an email" value={formValue.email} onChange={handleChange}/>
			  </FormControl>
			  <FormControl id="password">
				<FormLabel>Password</FormLabel>
				<Input type="password" name="password"  placeholder="enter an password" value={formValue.password} onChange={handleChange} />
			  </FormControl>
			  <Stack spacing={10}>
				<Button bg={'blue.400'} color={'white'}  _hover={{bg: 'blue.500'}} type="submit">
				  Login 👋
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
	  </form>
  )}
  {localStorage.getItem('token') && <div>Vous êtes connecté !</div>}
	</>
	)
  }

  