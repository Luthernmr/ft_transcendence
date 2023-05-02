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
  
  interface FormValue {
	email: string;
	password: string;
  }
  

  export default function loginCard() {
	
	const [formValue, setFormValue] = useState<FormValue>({
		email: '',
		password: ''
	  });
	
	  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setFormValue({...formValue, [event.target.name]: event.target.value});
	  };
	
	  const handleSubmit = async () => {
		
		axios.post('http://212.227.209.204:5000/api/login',
			{
				"email" : formValue.email,
				"password" : formValue.password
			}
		);
		//console.log(response.data);
		
	  };
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
	);
  }

  