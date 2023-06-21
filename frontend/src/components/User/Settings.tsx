import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import { VStack, FormControl, FormLabel, HStack, Input, Switch, Button, Image, ButtonGroup, Editable, EditableInput, EditablePreview, Flex, IconButton, useEditableControls } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import QRCode from 'qrcode.react';
export interface Profile {
	imgPdp: string;
	nickname: string;
	twoFactorAuthEnabled: boolean;
}



export default function Settings() {

	const [secret, setSecret] = useState('');
	const otpAuthUrl = otpauthURL({ secret, label: 'My App', issuer: 'My Company' });
  
	useEffect(() => {
	  const generatedSecret = generateSecret({ length: 20 });
	  setSecret(generatedSecret.base32);
	});
  
  
	const [profile, setProfile] = useState<Profile>({
		imgPdp: '',
		nickname: '',
		twoFactorAuthEnabled: false
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
			const response = await axios.post(import.meta.env.VITE_BACKEND + '/api/settings', {
				"img": profile.imgPdp,
				"nickname": profile.nickname

			}, { withCredentials: true });
			console.log(response.data);
		} catch (error) {
			console.log(error);
		}
	}
	
	function handleCheck2FA() {
		
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
					<Switch
						onChange={handleCheck2FA}
						colorScheme="teal"
					/>
				</HStack>
				<Image src={secret}/>
			</FormControl>
			<Button colorScheme="teal" type="submit" onClick={SendModif}>Enregistrer</Button>
		</VStack>
	);
}
