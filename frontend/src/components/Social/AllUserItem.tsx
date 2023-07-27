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
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { userSocket } from "../../sockets/sockets";
import { Link as RouteLink } from "react-router-dom";
import BlockUserButton from "./BlockUserButton";
import AddFriendButton from "./AddFriendButton";
import PongInviteButton from "./PongInviteButton";
import UserCard from "./UserCard";
import DirectMessageButton from "./DirectMessageButton";

export interface User {
	id: number;
	nickname: string;
	imgPdp: string;
	isOnline: boolean;
	isTwoFa: boolean;
	level: number;
	experience: number;
	ratioToNextLevel: number;
}

export default function AllUserItem(props: any) {
	const [users, setUsers] = useState<User[]>([]);
	const currentUser: User = JSON.parse(
		sessionStorage.getItem("currentUser") || "{}"
	);

	useEffect(() => {
		userSocket.on("userList", (data) => {
			setUsers(data);
		});
		userSocket.on("reloadLists", () => {
			userSocket.emit("getAllUsers");
		});
		userSocket.emit("getAllUsers");
	}, []);

	if (users)
		return (
			<List>
				{users.map((user) => (
					<Popover key={user.id} isLazy >
						{props.user.id != user.id && <Box>
							<ListItem>
								<PopoverTrigger>
									<Box>
										<UserCard user={user} />
									</Box>
								</PopoverTrigger>
							</ListItem>
						</Box>}
						<Portal>
							<PopoverContent >
								<PopoverArrow />
								<PopoverHeader>
									<Button
										w={"100%"}
										as={RouteLink}
										to={"/profile/" + user.id}
										alignItems={"center"}
										_hover={{ bg: "gray.200" }}
										p={2}
										borderRadius={5}
									>
										<Text>
											Visit
											<Text as="b" color="teal">
												{" "}
												{user.nickname}
											</Text>{" "}
											profile
										</Text>
										<ChevronRightIcon />
									</Button>
								</PopoverHeader>
								<PopoverCloseButton />
								<PopoverBody>
									<Flex justifyContent={"space-between"} zIndex={'99999999999'}>
										<AddFriendButton user={user} />
										<BlockUserButton user={user} />
										<PongInviteButton user={user} />
										<DirectMessageButton user={user} currentUser={currentUser} />
									</Flex>
								</PopoverBody>
							</PopoverContent>
						</Portal>
					</Popover>
				))}
			</List>
		); else
		return (
			<>
				<Text>No friend</Text>
			</>
		)
}
