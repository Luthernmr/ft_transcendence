import { Image, Button, FormLabel, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, PinInput, PinInputField, VStack, useDisclosure, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

export default function TwoFA() {
	const [pinCode, setPinCode] = useState("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const navigate = useNavigate();
	const toast = useToast()

	async function sendCode() {
		try {

			const resp2 = await axios.post(import.meta.env.VITE_BACKEND + '/api/2fa' + location.search, {
				"twoFACode": pinCode,
			}, { withCredentials: true });
			console.log(resp2);
			if (resp2) {
				navigate('/Home');
				console.log('token,normal', resp2.data.jwt);
				sessionStorage.setItem('jwt', resp2.data.jwt);
				toast({
					title: `2fa Validate`,
					status: 'success',
					isClosable: true,
					position: 'top'
				})
			}
			onClose()
		}
		catch (error) {
			toast({
				title: `invalid code`,
				status: 'error',
				isClosable: true,
				position: 'top'
			})
			console.log(error)
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