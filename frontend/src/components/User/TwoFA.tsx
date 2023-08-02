import {
	Button,
	FormLabel,
	HStack,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	PinInput,
	PinInputField,
	VStack,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatSocket, pongSocket, userSocket } from "../../sockets/sockets";

export default function TwoFA() {
	const [pinCode, setPinCode] = useState("");
	const { onClose } = useDisclosure();
	const navigate = useNavigate();
	const toast = useToast();

	async function sendCode(event :any) {
		event.preventDefault();
		try {

			const response = await axios.post(
				import.meta.env.VITE_BACKEND + "/api/2fa" + location.search,
				{
					twoFaCode: pinCode,
				},
				{ withCredentials: true }
			);
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
				else if (messages) {
					toast({
						title: response.data.response.message,
						status: "error",
						isClosable: true,
						position: "top",
					});
				}
			}
			else {
				sessionStorage.setItem("jwt", response.data.jwt);
				pongSocket.emit("register", { token: response.data.jwt });
				toast({
					title: `2fa Validate`,
					status: "success",
					isClosable: true,
					position: "top",
				});
				if (sessionStorage.getItem("jwt"))
				{
					chatSocket.disconnect();
					userSocket.disconnect();
					pongSocket.disconnect();
					userSocket.auth = { token: response.data.jwt };
					chatSocket.auth = { token: response.data.jwt };
					pongSocket.auth = { token: response.data.jwt };
					chatSocket.connect();
					pongSocket.connect();
					userSocket.connect();
					navigate("/Home");
				}
			}
			onClose();
		} catch (error) {
			toast({
				title: `invalid code`,
				status: "error",
				isClosable: true,
				position: "top",
			});
		}
	}

	return (
		<>
			<ModalOverlay />
			<ModalContent alignItems={"center"}>
				<ModalHeader>Init 2FA</ModalHeader>
				<ModalCloseButton />
				<ModalFooter>
					<VStack>
						<FormLabel>Verification code</FormLabel>
						<HStack>
							<PinInput onChange={(e) => setPinCode(e)}>
								<PinInputField />
								<PinInputField />
								<PinInputField />
								<PinInputField />
								<PinInputField />
								<PinInputField />
							</PinInput>
							<Button colorScheme="teal" onClick={sendCode}>
								Verify
							</Button>
						</HStack>
					</VStack>
				</ModalFooter>
			</ModalContent>
		</>
	);
}
