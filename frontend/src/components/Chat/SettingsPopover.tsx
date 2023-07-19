import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Avatar,
  AvatarBadge,
  Text,
  Spacer,
  IconButton,
} from "@chakra-ui/react";
import { chatSocket } from "../../sockets/sockets";
import { Room } from "./ChatRoom";
import { User } from "../Social/AllUserItem";
import { CheckIcon } from "@chakra-ui/icons";

interface SettingsPopoverProps {
  selectedRoom: Room;
  currentUser: User;
  setSelectedRoom: (room: Room | null) => void;
}

const SettingsPopover: React.FC<SettingsPopoverProps> = ({
  selectedRoom,
  currentUser,
  setSelectedRoom,
}) => {
  const [password, setPassword] = useState<string>(selectedRoom.password);
  const [admins, setAdmins] = useState<User[]>(selectedRoom.admins || []);
  const [users, setUsers] = useState<User[]>(selectedRoom.users);

  const handlePasswordChange = () => {
    chatSocket.emit("changeRoomPassword", {
      roomId: selectedRoom.id,
      password: password,
    });
  };

  const handleAdminUpdate = () => {
    console.log("Here");
    chatSocket.emit("updateAdmins", {
      roomId: selectedRoom.id,
      adminList: admins.map((admin) => admin.id),
    });
  };

  const handleAdminSelection = useCallback(
    (user: User) => {
      if (user.id !== currentUser.id) {
        const adminExists = admins.find((admin) => admin.id === user.id);
        if (!adminExists) {
          setAdmins([...admins, user]);
        } else {
          setAdmins(admins.filter((admin) => admin.id !== user.id));
        }
      }
    },
    [admins, currentUser]
  );

  useEffect(() => {
    chatSocket.on("updateRoom", setSelectedRoom);
    return () => {
      chatSocket.off("updateRoom", setSelectedRoom);
    };
  }, [setSelectedRoom]);

  return (
    <VStack spacing={4} w="full" align="stretch">
      <FormControl id="password">
        <FormLabel>Change password</FormLabel>
        <Flex align="center">
          <Input
            type="password"
            placeholder="Leave blank to suppress"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <IconButton
            colorScheme="teal"
            ml={2}
            aria-label="Change password"
            icon={<CheckIcon />}
            onClick={handlePasswordChange}
          />
        </Flex>
      </FormControl>

      <FormControl id="admins" flex="1">
        <FormLabel>Select Admins:</FormLabel>
        <Box
          mb={4}
          overflowY="scroll"
          maxHeight="200px"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          p={2}
        >
          {users.map((user) => (
            <Flex
              key={user.id}
              align="center"
              _hover={{ bg: "gray.100" }}
              cursor="pointer"
              p={2}
              borderRadius="md"
              onClick={() => handleAdminSelection(user)}
            >
              <Avatar size="sm" name={user.nickname}>
                <AvatarBadge
                  boxSize="1em"
                  bg={user.isOnline ? "green.500" : "tomato"}
                />
              </Avatar>
              <Box ml="2">
                <Text fontSize="sm" fontWeight="bold">
                  {user.nickname}
                </Text>
              </Box>
              {(admins.some((admin) => admin.id === user.id) ||
                user.id === currentUser.id) && (
                <>
                  <Spacer />
                  <CheckIcon color="green.500" />
                </>
              )}
            </Flex>
          ))}
        </Box>
      </FormControl>

      <IconButton
        aria-label="Confirm admin selection"
        icon={<CheckIcon />}
        colorScheme="teal"
        onClick={handleAdminUpdate}
      />
    </VStack>
  );
};

export default SettingsPopover;
