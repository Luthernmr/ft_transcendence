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
	Portal,
	Badge,
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
	isPlaying : boolean;
}

export default function AllfriendItem() {
	const [friends, setFriends] = useState<Friend[]>([]);

	useEffect(() => {
		userSocket.on("friendsList", (data) => {
			console.log('cc')
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




	if (friends)
		return (
			<List>
				{friends.map((friend) => (
					<Popover key={friend.id} isLazy>
						<Box>
							<ListItem>
								<PopoverTrigger>
									<Box>
										<UserCard user={friend} />
									</Box>
								</PopoverTrigger>
							</ListItem>
						</Box>
						<Portal>
							<PopoverContent>
								<PopoverArrow />
								<PopoverHeader>
									<Button
										w={"100%"}
										as={RouteLink}
										to={"/profile/" + friend.id}
										alignItems={"center"}
										_hover={{ bg: "gray.200" }}
										p={2}
										borderRadius={5}
									>
										<Text>
											Visit
											<Text as="b" color="teal">
												{" "}
												{friend.nickname}
											</Text>{" "}
											profile
										</Text>
										<ChevronRightIcon />
									</Button>
								</PopoverHeader>
								<PopoverCloseButton />
								<PopoverBody>
									<Flex justifyContent={"space-between"}>
										<DeleteFriendButton user={friend} />
										<PongInviteButton user={friend} />
									</Flex>
								</PopoverBody>
							</PopoverContent>
						</Portal>
					</Popover>
				))}
			</List>
		);
}
