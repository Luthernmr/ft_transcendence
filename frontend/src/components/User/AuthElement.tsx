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
} from "@chakra-ui/react";
import TwoFA from "./TwoFA";
import { chatSocket, pongSocket, userSocket } from "../../sockets/sockets";


export default function AuthElement() {
	const [authTokenCalled, setAuthTokenCalled] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const navigate = useNavigate();

	useEffect(() => {
		if (location && location.search.includes("code") && !authTokenCalled) {
			const getAuthToken = async () => {
				try {
					const res = await axios.get(
						import.meta.env.VITE_BACKEND + "/auth/42" + location.search,
						{ withCredentials: true }
					);
					if (res.data.jwt) {
						sessionStorage.setItem("jwt", res.data.jwt);
						userSocket.auth = {token : res.data.jwt};
						chatSocket.auth = {token : res.data.jwt};
						userSocket.disconnect().connect();
						chatSocket.disconnect().connect();
						navigate("/home");
						pongSocket.emit("register", { token: res.data.jwt });
					} else onOpen();
				} catch (error) {
          //console.log("already", error);
        }
			};
			getAuthToken();
			setAuthTokenCalled(true); // Mettre à jour l'état pour indiquer que getAuthToken a été appelée
		}
	}, [authTokenCalled]); // Inclure authTokenCalled dans les dépendances du useEffect

	async function handleclick() {
    const response = await axios.get(
      import.meta.env.VITE_BACKEND + "/api/logout",
      { withCredentials: true }
    );
    //console.log(response.data);
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
