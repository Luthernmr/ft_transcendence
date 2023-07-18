import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Button,
  Avatar,
  AvatarBadge,

  Text,
  Spacer
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
    chatSocket.emit("changeRoomPassword", selectedRoom.id, password);
  };

  const handleAdminSelection = useCallback((user: User) => {
    if (user.id !== currentUser.id) {
      const adminExists = admins.find((admin) => admin.id === user.id);
      if (!adminExists) {
        setAdmins([...admins, user]);
        chatSocket.emit("addAdminToRoom", selectedRoom.id, user.id);
      } else {
        setAdmins(admins.filter((admin) => admin.id !== user.id));
        chatSocket.emit("removeAdminFromRoom", selectedRoom.id, user.id);
      }
    }
  }, [admins, currentUser, selectedRoom]);

  useEffect(() => {
    chatSocket.on("updateRoom", setSelectedRoom);
    return () => {
      chatSocket.off("updateRoom", setSelectedRoom);
    };
  }, [setSelectedRoom]);

  return (
    <VStack spacing={4}>
      <Box>
        <FormControl id="password">
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <Button onClick={handlePasswordChange}>Change Password</Button>
      </Box>

      <Text mb={2} fontWeight="semibold">Select Admins:</Text>
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
              <AvatarBadge boxSize="1em" bg={user.isOnline ? "green.500" : "tomato"} />
            </Avatar>
            <Box ml="2">
              <Text fontSize="sm" fontWeight="bold">{user.nickname}</Text>
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
    </VStack>
  );
};

export default SettingsPopover;
