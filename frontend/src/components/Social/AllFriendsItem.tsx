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
import DirectMessageButton from "./DirectMessageButton";
import { User } from "./AllUserItem";
import BlockUserButton from "./BlockUserButton";
import WatchGame from "./WatchButton";

export interface Friend {
  id: number;
  nickname: string;
  imgPdp: string;
  isOnline: boolean;
  isPlaying: boolean;
}

export default function AllfriendItem() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const currentUser: User = JSON.parse(
	sessionStorage.getItem("currentUser") || "{}"
);

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

  if (friends.length)
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
                    to={"/profile/" + friend?.id}
                    alignItems={"center"}
                    _hover={{ bg: "gray.200" }}
                    p={2}
                    borderRadius={5}
                  >
                    <Text>
                      Visit
                      <Text as="b" color="teal">
                        {" "}
                        {friend?.nickname}
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
                    {
											friend.isOnline &&  !friend.isPlaying &&
											<PongInviteButton user={friend} />
										}
										{
										friend.isPlaying &&
											<WatchGame user={friend} />
										}
										<BlockUserButton user={friend} />
                    <DirectMessageButton
                      user={friend}
                      currentUser={currentUser}
                    />
                  </Flex>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
        ))}
      </List>
    );
  else
    return (
      <>
        <Text>No friend</Text>
      </>
    );
}
