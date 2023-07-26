import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Spinner,
	Center,
	Button,
	Modal,
	VStack,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import TwoFA from "./TwoFA";
import { chatSocket, pongSocket, userSocket } from "../../sockets/sockets";

export default function AuthElement() {
	const [authTokenCalled, setAuthTokenCalled] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();

	const navigate = useNavigate();

	useEffect(() => {
		if (location && location.search.includes("code") && !authTokenCalled) {
			if (window.performance) {
				if (performance.navigation.type == 1) {
				  navigate('/login')
				  return;
				}
			  }
			const getAuthToken = async () => {
				try {
					const res = await axios.get(
						import.meta.env.VITE_BACKEND + "/auth/42" + location.search,
						{ withCredentials: true }
					);
					if (res.data.jwt) {
						sessionStorage.setItem("jwt", res.data.jwt);
						if (sessionStorage.getItem("jwt")) {
							chatSocket.disconnect();
							userSocket.disconnect();
							pongSocket.disconnect();
							userSocket.auth = { token: res.data.jwt };
							chatSocket.auth = { token: res.data.jwt };
							pongSocket.auth = { token: res.data.jwt };
							chatSocket.connect();
							userSocket.connect();
							pongSocket.connect();
							navigate("/home");
						}
					} 
					else if (res.data.status == 401 || res.data.status == 400) {
						const messages = res.data.response.message
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
							navigate("/login");
						}
						else {
							toast({
								title: res.data.response.message,
								status: "error",
								isClosable: true,
								position: "top",
							});
							navigate("/login");
						}
					}
					else {
						onOpen();
					}
				} catch (error) {
					toast({
						title: `Failde to connect with api`,
						status: "error",
						isClosable: true,
						position: "top",
					});
				}
			};
			getAuthToken();
			setAuthTokenCalled(true);
		}
	}, [authTokenCalled]);

	async function handleclick() {
		sessionStorage.removeItem("jwt");
		sessionStorage.removeItem("currentUser");
		navigate("/login");
	}
	return (
		<>
			<Center h="100vh">
				<VStack spacing={10}>
					<Spinner color="blue.500" size="xl" />
					<Button colorScheme="teal" onClick={handleclick}>
						Back to login page
					</Button>
				</VStack>
			</Center>
			<Modal onClose={onClose} isOpen={isOpen} isCentered>
				<TwoFA />
			</Modal>
		</>
	);
}
