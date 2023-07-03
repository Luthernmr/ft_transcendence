import { IconButton, Box, Text, Link, List, ListItem, Flex, Avatar, AvatarBadge, Badge, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, HStack, Icon } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, ChatIcon, ChevronRightIcon, DragHandleIcon, NotAllowedIcon, SmallAddIcon } from '@chakra-ui/icons'
import { useState, useEffect } from "react";
import { userSocket } from "../../sockets/sockets";
import { Link as RouteLink, useNavigate } from "react-router-dom";
import BlockUserButton from "./BlockUserButton";
import AddFriendButton from "./AddFriendButton";

export interface User {
	id: number;
	nickname: string;
	imgPdp: string;
	isOnline: boolean;
	isTwoFa: boolean;
	level: number,
	experience: number,
	ratioToNextLevel: number
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
								<Button w={'100%'} as={RouteLink} to={'/profile/' + user.id} alignItems={'center'} _hover={{ bg: 'gray.200' }} p={2} borderRadius={5}>
									<Text>
										Visit<Text as='b' color="teal"> {user.nickname}</Text> profile
									</Text>
									<ChevronRightIcon />
								</Button>
							</PopoverHeader>
							<PopoverCloseButton />
							<PopoverBody>
								<Flex justifyContent={'space-between'}>
									<AddFriendButton user={user} />
									<BlockUserButton user={user} />
								</Flex>
							</PopoverBody>
						</PopoverContent>
					</Portal>
				</Popover>
			))}
		</List>
	)
}