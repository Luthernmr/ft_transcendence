import { IconButton, Box, Text, Link, List, ListItem, Flex, Avatar, AvatarBadge, Badge, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, HStack, Icon } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, ChatIcon, ChevronRightIcon, DragHandleIcon, NotAllowedIcon, SmallAddIcon } from '@chakra-ui/icons'
import { useState, useEffect } from "react";
import { userSocket } from "../../sockets/sockets";
import { Link as RouteLink, useNavigate } from "react-router-dom";
import BlockUserButton from "./BlockUserButton";
import AddFriendButton from "./AddFriendButton";
import PongInviteButton from "./PongInviteButton";
import UserCard from "./UserCard";

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
			setUsers(data)
		})
		userSocket.on('reloadLists', () => {
			userSocket.emit('getAllUsers')
			userSocket.emit('getFriends')
		})
		userSocket.emit('getAllUsers')

	}, []);

	if (users)
		return (
			<List>
				{users.map((user) => (
					<Popover key={user.id} isLazy>
						<Box >
							<ListItem  >
								<PopoverTrigger>
									<Box>
										<UserCard user={user} />
									</Box>
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
										<PongInviteButton user={user} />
									</Flex>
								</PopoverBody>
							</PopoverContent>
						</Portal>
					</Popover>
				))}
			</List>
		)
}