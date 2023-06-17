import { VStack, FormControl, FormLabel, HStack, Input, Switch, Button, Image } from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";

export interface Profile {
	imgPdp: string;
	nickname: string;
	twoFactorAuthEnabled: boolean;
}


export default function Settings() {
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
	return(
	
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
		);
	}