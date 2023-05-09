import React, { useEffect, useState } from 'react';
import {
	Box,
	VStack,
	FormControl,
	FormLabel,
	Input,
	Switch,
	Button,
	Image,
	HStack,
} from '@chakra-ui/react';
import axios from 'axios';

interface UserProfile {
	imgPdp: string;
	nickname: string;
	twoFactorAuthEnabled: boolean;
}


export default function UserProfileSettings() {


	const [profile, setProfile] = useState<UserProfile>({
		imgPdp: '',
		nickname: '',
		twoFactorAuthEnabled: false
	});
	
	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setProfile({ ...profile, nickname: event.target.value });
	};

	const handleAvatarChange = (event : any) => {
		setProfile({...profile, imgPdp: event.target.files[0]})
	}
	
	const SendModif = async (event : any) =>  {
		event.preventDefault();
		try {
		  const response = await axios.post('http://212.227.209.204:5000/api/settings', {
			"nickname" :  profile.nickname,
			"img" : profile.imgPdp
			
		}, { withCredentials: true });
		  	console.log(response.data);
		} catch (error) {
			console.log(error);
		}
		}
	return (
		<Box
			bg="white"
			borderRadius="lg"
			p={4}
			boxShadow="md"
			w="100%"
			maxW="500px"
		>
			<VStack spacing={4} align="stretch">
				<FormControl>
					<FormLabel>Avatar</FormLabel>
					<HStack spacing={4}>
						<Image
							borderRadius="full"
							boxSize="50px"
							src={profile.imgPdp}
							alt="User avatar"
						/>
						<input
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
							isChecked={profile.twoFactorAuthEnabled}
							colorScheme="teal"
						/>
					</HStack>
				</FormControl>
				<Button colorScheme="teal" type="submit" onClick={SendModif}>Enregistrer</Button>
			</VStack>
		</Box>
	);
};
