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
	AvatarBadge,
	Badge,
	css,
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
import { useToast } from '@chakra-ui/react'
import { count } from 'console';

export interface FriendRequest {
	id: number;
	senderNickname: string;
	senderPdp: string;
	type: string;
}


const PendingRequest = () => {

	const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

	const toast = useToast()
	useEffect(() => {
		userSocket.on('notifyRequest', () => {
			console.log('notify');
			userSocket.emit('getPendingRequest')
		})

		userSocket.on('pendingRequestsList', (data) => {
			console.log(data)
			setFriendRequests(data);
		})


		userSocket.on('requestAcccepted', () => {
			userSocket.emit('getPendingRequest')
		})
		userSocket.emit('getPendingRequest')

		userSocket.on('sendSuccess', () => {
			toast({
				title: `A request has been sent`,
				status: 'success',
				isClosable: true,
				position: 'top'
			})
			console.log('test');

		})
		userSocket.on('alreadyFriend', () => {
			toast({
				title: `You can't send more friend request`,
				status: 'error',
				isClosable: true,
				position: 'top'
			})
			console.log('test');

		})
	}, []);


	const handleAccept = async (id: number) => {
		userSocket.emit('acceptFriendRequest', { requestId: id })
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
										src={friendRequest.senderPdp}
										size='xs'
										name={friendRequest.senderNickname}
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

const BellButton = () => {
	const [notified, setNotified] = useState(false);

	const handleNotify = async () => {
		setNotified(false);
	}

	useEffect(() => {
		userSocket.on('notifyRequest', () => {
			console.log('notify');
			setNotified(true);
		})
	}, [notified])


	if (notified)
		return (
			<PopoverTrigger>

				<IconButton
				size="lg"
				variant="ghost"
				aria-label="open menu"
					icon={<>
						<FiBell color={'gray.750'} />
						<Box as={'span'} color={'white'} position={'absolute'} top={'10px'} right={'10px'} boxSize='0.7em'
							bgColor={'red'} borderRadius={'100%'} zIndex={9999} p={'1px'}>
						</Box>
					</>}
				/>
			</PopoverTrigger >

		)
	else
return (
	<PopoverTrigger>

		<IconButton
			size="lg"
			variant="ghost"
			aria-label="open menu"
			icon={<FiBell />}
			onClick={handleNotify}
		/>
	</PopoverTrigger>
)

}

export default function Notification() {

	return (
		<Popover>
			<BellButton />
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