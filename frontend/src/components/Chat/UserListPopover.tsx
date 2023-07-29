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
  AvatarBadge,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import { ChevronRightIcon, CheckIcon } from "@chakra-ui/icons";
import { Link as RouteLink } from "react-router-dom";
import AddFriendButton from "../Social/AddFriendButton";
import BlockUserButton from "../Social/BlockUserButton";
import DirectMessageButton from "../Social/DirectMessageButton";
import PongInviteButton from "../Social/PongInviteButton";
import UserOptions from "./UserOptions";
import { Room } from "./ChatRoom";
import { User } from "../Social/AllUserItem";
import { PiUsersThreeLight } from "react-icons/pi";

interface UserListPopoverProps {
  selectedRoom?: Room | null;
  currentUser?: User | null;
}

const UserListPopover: React.FC<UserListPopoverProps> = ({
  selectedRoom,
  currentUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!selectedRoom || !currentUser || !selectedRoom.users) return null;

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <IconButton
          icon={<PiUsersThreeLight />}
          aria-label={"Settings"}
          mr={2}
        />
      </PopoverTrigger>
      <PopoverContent minWidth="350px" maxWidth="500px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>User List</PopoverHeader>
        <PopoverBody>
          <VStack spacing={4} w="full" align="stretch">
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
                  _hover={{ bg: "gray.100" }}
                  cursor="pointer"
                  p={2}
                  borderRadius="md"
                  onClick={() => setSelectedUser(user)}
                >
                  <Avatar size="sm" name={user.nickname} src={user.imgPdp}>
                    <AvatarBadge
                      boxSize="1em"
                      bg={user.isOnline ? "green.500" : "tomato"}
                    />
                  </Avatar>
                  <Text ml={2}>{user.nickname}</Text>
                  {selectedUser?.id === user.id && (
                    <CheckIcon color="green.500" ml="auto" />
                  )}
                </Flex>
              ))}
            </Box>

            {selectedUser && (
              <>
                <PopoverHeader>
                  <Box width="max-content">
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
                  </Box>
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
                </PopoverBody>
              </>
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default UserListPopover;
