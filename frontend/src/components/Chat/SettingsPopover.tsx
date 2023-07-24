import React, { useEffect, useState } from "react";
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
  IconButton,
} from "@chakra-ui/react";
import { chatSocket } from "../../sockets/sockets";
import { Room } from "./ChatRoom";
import { User } from "../Social/AllUserItem";
import { CheckIcon } from "@chakra-ui/icons";

interface SettingsPopoverProps {
  onClose: () => void;
  selectedRoom: Room;
  currentUser: User;
  setSelectedRoom: (room: Room | null) => void;
}

const SettingsPopover: React.FC<SettingsPopoverProps> = ({
  selectedRoom,
  currentUser,
  setSelectedRoom,
  onClose,
}) => {
  const [password, setPassword] = useState<string>("");
  const [admins, setAdmins] = useState<User[]>(selectedRoom.admins || []);
  const [users] = useState<User[]>(selectedRoom.users);

  const handlePasswordChange = () => {
    chatSocket.emit("changeRoomPassword", {
      roomId: selectedRoom.id,
      password: password,
    });
    onClose();
  };

  const handleAdminUpdate = () => {
    chatSocket.emit("updateAdmins", {
      roomId: selectedRoom.id,
      adminList: admins.map((admin) => admin),
    });
    onClose();
  };

  const handleAdminSelection = (user: User) => {
    if (user.id !== currentUser.id) {
      const adminExists = admins.find((admin) => admin.id === user.id);
      if (!adminExists) {
        setAdmins([...admins, user]);
      } else {
        setAdmins(admins.filter((admin) => admin.id !== user.id));
      }
    }
  };

  useEffect(() => {
    chatSocket.on("updateRoom", setSelectedRoom);
    return () => {
      chatSocket.off("updateRoom", setSelectedRoom);
    };
  }, [setSelectedRoom]);

  return (
    <VStack spacing={4} w="full" align="stretch">
      <FormControl id="password">
        <FormLabel>Update or suppress password:</FormLabel>
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
              <Avatar size="sm" name={user.nickname} src={user.imgPdp}>
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
                <CheckIcon color="green.500" ml="auto" />
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
