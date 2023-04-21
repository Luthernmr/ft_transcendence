import React, { useState } from 'react';
import {
	Box,
	VStack,
	FormControl,
	FormLabel,
	Input,
	Switch,
	Button,
	Image,
	useColorModeValue,
	HStack,
} from '@chakra-ui/react';

interface UserProfile {
	avatarUrl: string;
	name: string;
	twoFactorAuthEnabled: boolean;
}

const defaultProfile: UserProfile = {
	avatarUrl:
		'https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
	name: 'Bob The Dog',
	twoFactorAuthEnabled: false,
};

const UserProfileSettings: React.FC = () => {
	const [profile, setProfile] = useState<UserProfile>(defaultProfile);

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setProfile({ ...profile, name: event.target.value });
	};

	const handleTwoFactorAuthChange = () => {
		setProfile({
			...profile,
			twoFactorAuthEnabled: !profile.twoFactorAuthEnabled,
		});
	};

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setProfile({ ...profile, avatarUrl: e.target?.result as string });
			};
			reader.readAsDataURL(event.target.files[0]);
		}
	};

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
							src={profile.avatarUrl}
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
						value={profile.name}
						onChange={handleNameChange}
						placeholder="Entrez votre nom"
					/>
				</FormControl>
				<FormControl>
					<HStack justifyContent="space-between">
						<FormLabel>Vérification en deux étapes (2FA)</FormLabel>
						<Switch
							isChecked={profile.twoFactorAuthEnabled}
							onChange={handleTwoFactorAuthChange}
							colorScheme="teal"
						/>
					</HStack>
				</FormControl>
				<Button colorScheme="teal">Enregistrer</Button>
			</VStack>
		</Box>
	);
};

export default UserProfileSettings;
