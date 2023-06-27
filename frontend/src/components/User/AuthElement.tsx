import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Center, Button, FormLabel, HStack, Modal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, PinInput, PinInputField, VStack, useDisclosure } from '@chakra-ui/react'
import TwoFA from "./TwoFA";

export default function AuthElement() {
	const [authTokenCalled, setAuthTokenCalled] = useState(false);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const navigate = useNavigate();

	useEffect(() => {

		if (location && location.search.includes('code') && !authTokenCalled) {
			const getAuthToken = async () => {
				try {
					const res = await axios.get(import.meta.env.VITE_BACKEND + '/auth/42' + location.search, { withCredentials: true });
					console.log("res token", res.data);
					if (res.data.jwt) {
						
						sessionStorage.setItem('jwt', res.data.jwt);
						if (sessionStorage.getItem('jwt'))
							navigate('/home');
					}
					else
						onOpen()


				}
				catch (error) {
					console.log("already", error);
				}
			};
			getAuthToken();
			setAuthTokenCalled(true); // Mettre à jour l'état pour indiquer que getAuthToken a été appelée
		}
	}, [authTokenCalled]); // Inclure authTokenCalled dans les dépendances du useEffect

	return (
		<>
			<Center h='100vh'>
				<Spinner color='blue.500' size='xl' />
			</Center>

			<Modal onClose={onClose} isOpen={isOpen} isCentered>
				<TwoFA />
			</Modal>
		</>
	)
}
