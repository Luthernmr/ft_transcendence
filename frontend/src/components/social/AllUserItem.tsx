import { IconButton, Box, Text, List, ListItem, Flex, Avatar, AvatarBadge, Badge, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, DragHandleIcon } from '@chakra-ui/icons'
import { useState, useEffect } from "react";
import { userSocket } from "../../sockets/sockets";

interface User {
	id: number;
	nickname: string;
	imgPdp: string;
}

interface FriendRequest {
	id: number;
}

export default function AllUserItem() {

	const [users, setUsers] = useState<User[]>([]);


	useEffect(() => {
		const getAllUser = async () => {
			const res = await axios.get(import.meta.env.VITE_BACKEND + '/user/all', { withCredentials: true });
			setUsers(res.data.users);
		}
		getAllUser();
	}, []);

	function sendFriendRequest(e : any, id : number){
		e.preventDefault()
		var current : User = JSON.parse(localStorage.getItem('currentUser')!)
		userSocket.emit("friendRequest", {userSenderId :  current.id ,userReceiveId: id})
		console.log('test');
	}

	return (
		<List spacing={3}>
			{users.map((user) => (
				<Popover key={user.id}>
					<Box >
						<ListItem>
							<Flex alignItems={'center'} justifyContent={'space-between'}>
								<Avatar
									size="sm"
									src={user.imgPdp}>
									<AvatarBadge boxSize='1em' bg='green.500' />
									<AvatarBadge borderColor='papayawhip' bg='tomato' boxSize='1em' />
								</Avatar>
								<Box ml='2'>
									<Text fontSize='sm' fontWeight='bold'>
										{user.nickname}
										<Badge ml='1' fontSize='xs' colorScheme='green'>
											ingame
										</Badge>
									</Text>
									<Text fontSize='xs'>Student</Text>
								</Box>
								<PopoverTrigger>
									<IconButton
										variant='outline'
										colorScheme='blue'
										aria-label='Send email'
										icon={<DragHandleIcon />}
									/>
								</PopoverTrigger>
							</Flex>
						</ListItem>
					</Box>
					<Portal>
						<PopoverContent>
							<PopoverArrow />
							<PopoverHeader>{user.nickname}</PopoverHeader>
							<PopoverCloseButton />
							<PopoverBody>
								<IconButton
								onClick={(e) => sendFriendRequest(e, user.id)}
									variant='outline'
									colorScheme='blue'
									aria-label='addFriend'
									icon={<AddIcon />}
								/>
							</PopoverBody>
						</PopoverContent>
					</Portal>
				</Popover>
			))}
		</List>
	)
}