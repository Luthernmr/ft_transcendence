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
	Modal,
	useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import TwoFA from "./TwoFA";
import { chatSocket, pongSocket, userSocket } from "../../sockets/sockets";
interface FormValue {
	email: string;
	password: string;
}

export default function loginCard() {
	const [formValue, setFormValue] = useState<FormValue>({
		email: "",
		password: "",
	});

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setFormValue({ ...formValue, [event.target.name]: event.target.value });
	};
	const navigate = useNavigate();
	const toast = useToast();

	const { isOpen, onOpen, onClose } = useDisclosure();
	const handleSubmit = async (event: any) => {
		event.preventDefault();
		try {
			const response = await axios.post(
				import.meta.env.VITE_BACKEND + "/api/login",
				{
					email: formValue.email,
					password: formValue.password,
				},
				{ withCredentials: true }
			);
			if (response.data.token) {
				sessionStorage.setItem("jwt", response.data.token);
				if (sessionStorage.getItem("jwt")) {
					chatSocket.disconnect();
					userSocket.disconnect();
					pongSocket.disconnect();
					userSocket.auth = { token: response.data.token };
					chatSocket.auth = { token: response.data.token };
					pongSocket.auth = { token: response.data.token };
					chatSocket.connect();
					userSocket.connect();
					pongSocket.connect();
					navigate("/home");
				}
			}
			if (!response.data) {
				onOpen();
			}
			console.log(response)
			if (response.data.status == 401 || response.data.status == 400) {
				const messages = response.data.response.message
				if (!(typeof messages == "string")) {
					messages.map((validationError: any) => {
						const { target, value, property, constraints } = validationError;
						toast({
							title: `${property}: ${Object.values(constraints).join(', ')}`,
							status: "error",
							isClosable: true,
							position: "top",
						});
					})
				}
				else {
					console.log('prout')
					toast({
						title: response.data.response.message,
						status: "error",
						isClosable: true,
						position: "top",
					});
				}
			}
		} catch (error) {
			toast({
				title: `Empty informationyy`,
				status: "error",
				isClosable: true,
				position: "top",
			});
		}
	};

	const connectAPI = async () => {
		window.location.href = import.meta.env.VITE_42AUTH;
	};

	return (
		<form onSubmit={handleSubmit}>
			<Flex
				minH={"100vh"}
				align={"center"}
				justify={"center"}
				bg={useColorModeValue("gray.50", "gray.800")}
			>
				<Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
					<Stack align={"center"}>
						<Heading fontSize={"4xl"}>Welcome Back</Heading>
					</Stack>
					<Box
						rounded={"lg"}
						bg={useColorModeValue("white", "gray.700")}
						boxShadow={"lg"}
						p={8}
					>
						<Stack spacing={4}>
							<FormControl id="email">
								<FormLabel>Email address</FormLabel>
								<Input
									type="email"
									name="email"
									placeholder="enter an email"
									value={formValue.email}
									onChange={handleChange}
								/>
							</FormControl>
							<FormControl id="password">
								<FormLabel>Password</FormLabel>
								<Input
									type="password"
									name="password"
									placeholder="enter an password"
									value={formValue.password}
									onChange={handleChange}
								/>
							</FormControl>
							<Stack spacing={4}>
								<Button
									bg={"blue.400"}
									color={"white"}
									_hover={{ bg: "blue.500" }}
									type="submit"
								>
									Login 👋
								</Button>
								<Button
									bg={"#00babb"}
									color={"white"}
									_hover={{ bg: "blue.500" }}
									onClick={connectAPI}
								>
									<Image boxSize="30px" src="./src/assets/42_Logo.svg"></Image>
								</Button>
								<Text>
									You don't have an account my rockstar ?{" "}
									<Link color="teal.500" href="/Register">
										Register !
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
	);
}
