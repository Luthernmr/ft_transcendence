import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import { VStack, FormControl, FormLabel, HStack, Input, Switch, Button, Image, ButtonGroup, Editable, EditableInput, EditablePreview, Flex, IconButton, useEditableControls, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, PinInput, PinInputField, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export interface Profile {
	imgPdp: string;
	nickname: string;
	isTwoFA:  boolean;
}



export default function Settings() {

	const [profile, setProfile] = useState<Profile>({
		imgPdp: '',
		nickname: '',
		isTwoFA: false
	});

	const [profilePreview, setPreview] = useState('');

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setProfile({ ...profile, nickname: event.target.value });
	};

	const handleAvatarChange = (event: any) => {
		setProfile({ ...profile, imgPdp: event.target.files[0] })
		setPreview(URL.createObjectURL(event.target.files[0]))
		console.log("here :" + event.target.files[0]);
	}

	const SendModif = async (event: any) => {
		event.preventDefault();
		try {
			const response = await axios.post(import.meta.env.VITE_BACKEND + '/user/settings', {
				"img": profile.imgPdp,
				"nickname": profile.nickname

			}, { withCredentials: true });
			console.log(response.data);
		} catch (error) {
			console.log(error);
		}
	}

	const [isChecked, setIsChecked] = useState(false);
	const [qrCode, setQrcode] = useState("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [pinCode, setPinCode] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		const getUser = async () => {
			const res = await axios.get(import.meta.env.VITE_BACKEND + '/api/user', { withCredentials: true });
			setProfile(res.data.user);
			console.log(res.data.user)
			sessionStorage.setItem('currentUser', JSON.stringify(res.data.user))
		}
		getUser();
		if (profile.isTwoFA)
			setIsChecked(true);
			
		console.log('isTwoFa', profile.isTwoFA, isChecked)
		
		
	}, [profile.isTwoFA, isChecked]);
	async function handleCheck2FA() {
		if (profile.isTwoFA) {
			const resp = await axios.post(import.meta.env.VITE_BACKEND + '/api/turn-off' + location.search, {
				"twoFACode": pinCode
			}, { withCredentials: true });
			console.log('0')
			setIsChecked(false);
		}
		else  {
			console.log('ischeck',isChecked, profile.isTwoFA)
			const resp: any = await axios.get(import.meta.env.VITE_BACKEND + '/api/generate' + location.search, { withCredentials: true, responseType: "blob" });
			console.log(resp)
			const qrUrl = URL.createObjectURL(resp.data);
			setQrcode(qrUrl);
			onOpen();
		}
	}

	const toast = useToast()

	async function sendCode() {
		try {
			const resp = await axios.post(import.meta.env.VITE_BACKEND + '/api/turn-on' + location.search, {
				"twoFACode": pinCode
			}, { withCredentials: true });
			console.log(resp.data.status);
			if (resp.data.status == 401)
				throw new Error('test');
			console.log('1')
			setIsChecked(true);
			toast({
				title: `2FA is now activate please log in again`,
				status: 'success',
				isClosable: true,
				position: 'top'
			})
			const resp2 = await axios.get(
				import.meta.env.VITE_BACKEND + "/api/logout",
				{ withCredentials: true }
			  );
			  console.log(resp2.data);
			  sessionStorage.removeItem("jwt");
			  sessionStorage.removeItem("currentUser");
			  console.log("jwwwr", sessionStorage.getItem("jwt"));

			onClose()
			navigate('/login');
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
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Avatar</FormLabel>
        <HStack spacing={4}>
          <Image
            borderRadius="full"
            boxSize="50px"
            src={profilePreview}
            alt="User avatar"
          />
          <Input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </HStack>
      </FormControl>
      <FormControl>
        <FormLabel>Nom</FormLabel>
        <Input
          type="text"
          value={profile.nickname}
          onChange={handleNameChange}
          placeholder="Entrez votre nom"
        />
      </FormControl>
      <FormControl>
        <HStack justifyContent="space-between">
          <FormLabel>Vérification en deux étapes (2FA)</FormLabel>
          {(
            <Switch
			isChecked={isChecked}
              onChange={handleCheck2FA}
              colorScheme="teal"
              defaultChecked
            />
          )}
        </HStack>
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
          <ModalOverlay />
          <ModalContent alignItems={"center"}>
            <ModalHeader>Init 2FA</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Image src={qrCode} />
            </ModalBody>
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
        </Modal>
      </FormControl>
      <Button colorScheme="teal" type="submit" onClick={SendModif}>
        Enregistrer
      </Button>
    </VStack>
  );
}
