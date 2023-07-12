import {
  Box,
  Text,
  List,
  ListItem,
  Flex,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { userSocket } from "../../sockets/sockets";
import { Link as RouteLink } from "react-router-dom";
import DeleteFriendButton from "./DeleteFriendButton";
import UserCard from "./UserCard";
import PongInviteButton from "./PongInviteButton";

export interface Friend {
  id: number;
  nickname: string;
  imgPdp: string;
  isOnline: boolean;
}

export default function AllfriendItem() {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    userSocket.on("friendsList", (data) => {
      setFriends(data);
    });
    userSocket.on("requestAcccepted", () => {
      userSocket.emit("getFriends");
    });
    userSocket.emit("getFriends");

    userSocket.on("reload", () => {
      userSocket.emit("getFriends");
    });
  }, []);

		userSocket.on('reload', () => {
			userSocket.emit('getFriends');
		})
	}, []);




	return (
		<List>
			{friends.map((friend) => (
				<Popover key={friend.id}>
					<Box >
						<ListItem  >
							<PopoverTrigger>
								<Box >
									<UserCard as={'Button'} user={friend} />
								</Box>
							</PopoverTrigger>
						</ListItem>
					</Box>
					<PopoverContent >
						<PopoverArrow />
						<PopoverHeader>
							<Button w={'100%'} as={RouteLink} to={'/profile/' + friend.id} alignItems={'center'} _hover={{ bg: 'gray.200' }} p={2} borderRadius={5}>
								<Text>
									Visit<Text as='b' color="teal"> {friend.nickname}</Text> profile
								</Text>
								<ChevronRightIcon />
							</Button>
						</PopoverHeader>
						<PopoverCloseButton />
						<PopoverBody >
							<Flex justifyContent={'space-between'}>
								<PongInviteButton user={friend} />
								<DeleteFriendButton friend={friend} />
							</Flex>
						</PopoverBody>
					</PopoverContent>
				</Popover>
			))}
		</List>
	)
}
