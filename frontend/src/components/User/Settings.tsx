import { Avatar, VStack, FormControl, FormLabel, HStack, Input, Switch, Button, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, PinInput, PinInputField, useToast, CircularProgress, CircularProgressLabel, Flex, Heading } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export interface Profile {
	imgPdp: string;
	nickname: string;
	isTwoFA: boolean;
}

export default function Settings(props: any) {

	var formData = new FormData();
	const [profile, setProfile] = useState<Profile>({
		imgPdp: props.user.imgPdp,
		nickname: '',
		isTwoFA: false
	});

	const [profilePreview, setPreview] = useState(props.user.imgPdp);

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setProfile({ ...profile, nickname: event.target.value });
	};


	const handleAvatarChange = async (event: any) => {
		formData.append("file", event.currentTarget.files[0]);
	}

	const SendModif = async (event: any) => {
		event.preventDefault();
		try {
			await axios.post(import.meta.env.VITE_BACKEND + '/user/avatar', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				withCredentials: true
			})
		} catch (error) {
			//console.log(error);
		}

		try {
			await axios.post(import.meta.env.VITE_BACKEND + '/user/settings', {
				"nickname": profile.nickname,

			}, { withCredentials: true });

		} catch (error) {

		}
		window.location.reload();
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
			sessionStorage.setItem('currentUser', JSON.stringify(res.data.user))
		}
		getUser();
		if (profile.isTwoFA)
			setIsChecked(true);

	}, [profile.isTwoFA, isChecked]);
	async function handleCheck2FA() {
		if (profile.isTwoFA) {
			const resp = await axios.post(import.meta.env.VITE_BACKEND + '/api/turn-off' + location.search, {
				"twoFACode": pinCode
			}, { withCredentials: true });
			setIsChecked(false);
		}
		else {
			const resp: any = await axios.get(import.meta.env.VITE_BACKEND + '/api/generate' + location.search, { withCredentials: true, responseType: "blob" });
			const qrUrl = URL.createObjectURL(resp.data);
			setQrcode(qrUrl);
			onOpen();
		}
	}

	const toast = useToast()

	async function sendCode() {
		try {
			const resp = await axios.post(
				import.meta.env.VITE_BACKEND + "/api/turn-on" + location.search,
				{
					twoFACode: pinCode,
				},
				{ withCredentials: true }
			);
			//console.log(resp.data.status);
			if (resp.data.status == 401) throw new Error("test");
			setIsChecked(true);
			toast({
				title: `2FA is now activate please log in again`,
				status: "success",
				isClosable: true,
				position: "top",
			});
			await axios.get(import.meta.env.VITE_BACKEND + "/api/logout", {
				withCredentials: true,
			});
			sessionStorage.removeItem("jwt");
			sessionStorage.removeItem("currentUser");
			onClose();
			navigate("/login");
		}
		catch (error) {
			toast({
				title: `invalid code`,
				status: "error",
				isClosable: true,
				position: "top",
			});
			//console.log(error)
		}
	}

	return (
		<VStack spacing={4} align="stretch">
			<FormControl>
				<FormLabel>Avatar</FormLabel>
				<HStack spacing={4}>
				<Flex alignItems={'center'} flexDirection={'row'}>
					<VStack>
						<CircularProgress value={props?.user?.ratioToNextLevel} size={"3em"} color='green.400' thickness={'3px'}>
							<CircularProgressLabel><Avatar
								name={props.user?.nickname}
								size="xl"
								src={profilePreview}>
							</Avatar></CircularProgressLabel>
						</CircularProgress>
					</VStack>
					<Flex flexDirection={'column'}>
						<Heading> lvl {props?.user?.level}</Heading>
					</Flex>
				</Flex>
					

					<input
						type="file"
						id="avatar"
						name="avatar"
						accept="image/*"
						placeholder="test"
						onChange={(event) => handleAvatarChange(event)}
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