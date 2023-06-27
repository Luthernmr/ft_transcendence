import { IconButton, Box, Text, Link , List, ListItem, Flex, Avatar, AvatarBadge, Badge, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, HStack, Icon } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, ChatIcon, ChevronRightIcon, DragHandleIcon, NotAllowedIcon, SmallAddIcon } from '@chakra-ui/icons'
import { useState, useEffect } from "react";
import { userSocket } from "../../sockets/sockets";
import { Link as RouteLink, useNavigate } from "react-router-dom";


export interface User {
	id: number;
	nickname: string;
	imgPdp: string;
	isOnline: boolean;
}

export default function AllUserItem() {

	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		userSocket.on('userList', (data) => {
			console.log('userList', data);
			setUsers(data)
		})
		userSocket.emit('getAllUsers')

	}, []);

	function sendFriendRequest(e: any, id: number) {
		e.preventDefault()
		userSocket.emit("friendRequest", { userReceiveId: id })
		console.log('test');
	}

	function blockUser(e: any, id: number) {
		e.preventDefault()
		userSocket.emit("blockUser", { userBlockedId: id })
		console.log('test');
	}


	return (
		<List>
			{users.map((user) => (
				<Popover key={user.id}>
					<Box >
						<ListItem  >
							<PopoverTrigger>
								<Flex alignItems={'center'} _hover={{ bg: 'gray.200', cursor: 'pointer' }} padding={'2'} w={'100%'} borderRadius={'8'}>
									<Avatar
										name={user.nickname}
										size="sm"
										src={user.imgPdp}>
										{user.isOnline &&
											<AvatarBadge boxSize='1em' bg='green.500' />
										}
										{!user.isOnline &&
											<AvatarBadge borderColor='papayawhip' bg='tomato' boxSize='1em' />
										}
									</Avatar>
									<Box ml='2'>
										<Text fontSize='sm' fontWeight='bold'>
											{user.nickname}
											{user.isOnline &&
												<Badge ml='1' colorScheme='purple'>
													inGame
												</Badge>
											}
											{!user.isOnline &&
												<Badge ml='1' colorScheme='red'>
													offline
												</Badge>
											}
										</Text>
										<Text fontSize='xs'>Student</Text>
									</Box>
								</Flex>

							</PopoverTrigger>
						</ListItem>
					</Box>
					<Portal>
						<PopoverContent>
							<PopoverArrow />
							<PopoverHeader>
								<Link  as={RouteLink} to={'/profile/' + user.id}>
									Visit profile of 
									{user.nickname}
									<ChevronRightIcon />
								</Link>
							</PopoverHeader>
							<PopoverCloseButton />
							<PopoverBody>
								<HStack>

									<Button colorScheme="teal">
										<IconButton
											onClick={(e) => sendFriendRequest(e, user.id)}
											variant='ghost'
											colorScheme='white'
											aria-label='addFriend'
											icon={<AddIcon />}
										/>
										Add to friends
									</Button>

									<Button colorScheme="gray">
										<IconButton
											onClick={(e) => blockUser(e, user.id)}
											variant='ghost'
											colorScheme='white'
											aria-label='addFriend'
											icon={<NotAllowedIcon />}
										/>
									</Button>
								</HStack>

							</PopoverBody>
						</PopoverContent>
					</Portal>
				</Popover>
			))}
		</List>
	)
}