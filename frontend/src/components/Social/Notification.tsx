import {
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverHeader,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	PopoverCloseButton,
	PopoverAnchor,
	Button,
	Portal,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	IconButton,
	Box,
	Avatar,
	Tag,
	TagLabel,
	Text,
	Flex,
	Stack,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import {
	FiSettings,
	FiMenu,
	FiBell,
	FiChevronDown,
	FiMessageSquare,
} from 'react-icons/fi';
import { userSocket } from '../../sockets/sockets';
import axios from 'axios';

interface FriendRequest {
	id: number;
	senderNickname: string;
	type: string;
}

const PendingRequest = () => {
	const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);


	useEffect(() => {
		const getAllFriends = async () => {
			const res = await axios.get(import.meta.env.VITE_BACKEND + '/social/allRequest', { withCredentials: true });
			setFriendRequests(res.data);
			console.log("here", res.data);
		}
		getAllFriends();
	}, []);

	const handleAccept = async (id : number) => {
		userSocket.emit('acceptFriendRequest', {requestId : id})
	}

	return (
		<Box>
			<Tabs variant='soft-rounded' colorScheme='blue'>
				<TabList>
					<Tab>Friends Request</Tab>
					<Tab>New Message</Tab>
				</TabList>
				<TabPanels>
					<TabPanel >
						{friendRequests.map((friendRequest) => (
								<Flex key={friendRequest.id} flexDirection={'column'} >
									<Flex direction='row' align='center' p={3}>
										<Avatar
											src='https://bit.ly/sage-adebayo'
											size='xs'
											name='Segun Adebayo'
											ml={-1}
											mr={2}
										/>
										<Text><Text as='b'>{friendRequest.senderNickname}</Text> send you a {friendRequest.type} Request </Text>
									</Flex>
									<Stack spacing={2} direction='row' align='center'>
										<Button colorScheme='twitter' size='sm' onClick={() => handleAccept(friendRequest.id)} >Accepter</Button>
										<Button colorScheme='gray' size='sm'>Rejeter</Button>
									</Stack>
								</Flex>
						))}

					</TabPanel>
					<TabPanel>
						<p>two!</p>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Box>
	)
}
export default function Notification() {

	userSocket.on('pendingRequest', () => {
		console.log('receiv send');
	})

	return (
		<Popover>
			<PopoverTrigger>
				<IconButton
					size="lg"
					variant="ghost"
					aria-label="open menu"
					icon={<FiBell />}
				/>
			</PopoverTrigger>
			<Portal>
				<PopoverContent>
					<PopoverArrow />
					<PopoverCloseButton />
					<PopoverBody>
						<PendingRequest />
					</PopoverBody>
				</PopoverContent>
			</Portal>
		</Popover>
	)
}