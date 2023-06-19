import { IconButton, Box, Text, List, ListItem, Flex, Avatar, AvatarBadge, Badge, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, Icon, HStack } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, ChatIcon, DeleteIcon, DragHandleIcon, ViewIcon } from '@chakra-ui/icons'
import { useState, useEffect } from "react";
import { userSocket } from "../../sockets/sockets";
import { User } from "./AllUserItem";



export interface Friend {
	id: number;
	nickname: string;
	imgPdp: string;
	isOnline: boolean;
}

export default function AllfriendItem() {

	const [friends, setFriends] = useState<Friend[]>([]);

	useEffect(() => {
		userSocket.on('friendsList', (data) => {
			console.log('friendlist', data);
			setFriends(data)
		})
		userSocket.on('requestAcccepted', () => {
			userSocket.emit('getFriends');
		})
		userSocket.emit('getFriends');

		userSocket.on('reload', () => {
			userSocket.emit('getFriends');
		})
	}, []);

	function deleteFriend(e: any, id: number) {
		e.preventDefault()
		userSocket.emit("deleteFriend", { friendId: id })
		console.log('deleteFriend');
	}


	return (
		<List>
			{friends.map((friend) => (
				<Popover key={friend.id}>
					<Box >
						<ListItem  >
							<PopoverTrigger>
								<Flex alignItems={'center'} _hover={{ bg: 'gray.200', }} padding={'2'} w={'100%'} borderRadius={'8'}>
									<Avatar
										name={friend.nickname}
										size="sm"
										src={friend.imgPdp}>
										{friend.isOnline &&
											<AvatarBadge boxSize='1em' bg='green.500' />
										}
										{!friend.isOnline &&
											<AvatarBadge borderColor='papayawhip' bg='tomato' boxSize='1em' />
										}
									</Avatar>
									<Box ml='2'>
										<Text fontSize='sm' fontWeight='bold'>
											{friend.nickname}
											{friend.isOnline &&
												<Badge ml='1' colorScheme='purple'>
													inGame
												</Badge>
											}
											{!friend.isOnline &&
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
						<PopoverContent >
							<PopoverArrow />
							<PopoverHeader>{friend.nickname}</PopoverHeader>
							<PopoverCloseButton />
							<PopoverBody >
								<HStack>

									<IconButton
										colorScheme='blue'
										variant={'ghost'}
										aria-label='Call Segun'
										size='lg'
										icon={<ChatIcon />}
									/>
									<IconButton
										colorScheme='blue'
										variant={'ghost'}
										aria-label='Call Segun'
										size='lg'
										icon={<ViewIcon />}
									/>
									<IconButton
										onClick={(e) => deleteFriend(e, friend.id)}
										colorScheme='blue'
										variant={'ghost'}
										aria-label='Call Segun'
										size='lg'
										icon={<DeleteIcon />}
									/>
								</HStack>
							</PopoverBody>
						</PopoverContent>
				</Popover>
			))}
		</List>
	)
}