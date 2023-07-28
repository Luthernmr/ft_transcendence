import React, { useState } from "react";
import {
  Box,
  Flex,
  Avatar,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Portal,
  Button,
} from "@chakra-ui/react";
import { Room } from "./ChatRoom";
import UserOptions from "./UserOptions";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Link as RouteLink } from "react-router-dom";
import AddFriendButton from "../Social/AddFriendButton";
import BlockUserButton from "../Social/BlockUserButton";
import DirectMessageButton from "../Social/DirectMessageButton";
import PongInviteButton from "../Social/PongInviteButton";
import { User } from "../Social/AllUserItem";

interface UserListPopoverProps {
  selectedRoom?: Room;
  currentUser?: User;
}

const UserListPopover: React.FC<UserListPopoverProps> = ({
  selectedRoom,
  currentUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!selectedRoom || !currentUser || !selectedRoom.users) return null;

  return (
    <Popover>
      <PopoverTrigger>
        <Button>Show Users</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>User List</PopoverHeader>
        <PopoverBody>
          <Box
            mb={4}
            overflowY="scroll"
            maxHeight="200px"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={2}
          >
            {selectedRoom.users.map((user) => (
              <Flex
                key={user.id}
                align="center"
                cursor="pointer"
                p={2}
                borderRadius="md"
                onClick={() => setSelectedUser(user)}
              >
                <Avatar size="sm" name={user.nickname} src={user.imgPdp} />
                <Text ml={2}>{user.nickname}</Text>
              </Flex>
            ))}
          </Box>

          {selectedUser && (
            <>
              <PopoverHeader>
                <UserOptions
                  isAdmin={
                    selectedRoom.ownerId === currentUser.id ||
                    selectedRoom.admins?.some(
                      (admin) => admin.id === currentUser.id
                    )
                  }
                  targetedUser={selectedUser}
                  currentUser={currentUser}
                  ownerId={selectedRoom.ownerId}
                  selectedRoom={selectedRoom}
                />
                <Button
                  w={"100%"}
                  as={RouteLink}
                  to={"/profile/" + selectedUser?.id}
                  alignItems={"center"}
                  _hover={{ bg: "gray.200" }}
                  p={2}
                  borderRadius={5}
                >
                  <Text>
                    Visit
                    <Text as="b" color="teal">
                      {" "}
                      {selectedUser?.nickname}
                    </Text>
                    's profile
                  </Text>
                  <ChevronRightIcon />
                </Button>
              </PopoverHeader>
              <PopoverCloseButton />
              <PopoverBody>
                <Flex justifyContent={"space-between"}>
                  <AddFriendButton user={selectedUser} />
                  <BlockUserButton user={selectedUser} />
                  <PongInviteButton user={selectedUser} />
                  <DirectMessageButton
                    user={selectedUser}
                    currentUser={currentUser}
                  />
                </Flex>
                <Button onClick={() => setSelectedUser(null)}>
                  Back to user list
                </Button>
              </PopoverBody>
            </>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default UserListPopover;
