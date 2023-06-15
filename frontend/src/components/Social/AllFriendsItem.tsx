import { IconButton, Box, Text, List, ListItem, Flex, Avatar, AvatarBadge, Badge, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon, DragHandleIcon } from '@chakra-ui/icons'
import { useState, useEffect } from "react";
import { userSocket } from "../../sockets/sockets";


interface Friend {
	id: number;
	nickname: string;
	imgPdp: string;
}

export default function AllfriendItem() {

	const [friends, setFriends] = useState<Friend[]>([]);

	useEffect(() => {
		userSocket.on('friendsList',(data) => {
			console.log('friendlist', data);
			setFriends(data)
		})
		userSocket.on('requestAcccepted', () => {
			userSocket.emit('getFriends');
		})
		userSocket.emit('getFriends');
	}, []);

	return (
		<List>
			{friends.map((friend) => (
				<Popover key={friend.id}>
					<Box >
						<ListItem  >
								<PopoverTrigger>
							<Flex alignItems={'center'} _hover={{bg: 'gray.200', }} padding={'2'} w={'100%'} borderRadius={'8'}>
								<Avatar
									size="sm"
									src={friend.imgPdp}>
									<AvatarBadge boxSize='1em' bg='green.500' />
									<AvatarBadge borderColor='papayawhip' bg='tomato' boxSize='1em' />
								</Avatar>
								<Box ml='2'>
									<Text fontSize='sm' fontWeight='bold'>
										{friend.nickname}
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
							<PopoverHeader>{friend.nickname}</PopoverHeader>
							<PopoverCloseButton />
							<PopoverBody>
							</PopoverBody>
						</PopoverContent>
					</Portal>
				</Popover>
			))}
		</List>
	)
}