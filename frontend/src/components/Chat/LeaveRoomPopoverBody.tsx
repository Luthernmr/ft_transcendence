import React, { useState } from "react";
import { User } from "../Social/AllUserItem";
import {
  Box,
  Flex,
  Avatar,
  AvatarBadge,
  Text,
  Badge,
  Spacer,
  Button,
} from "@chakra-ui/react";
import { Room } from "./ChatRoom";
import { chatSocket } from "../../sockets/sockets";
import { CheckIcon } from "@chakra-ui/icons";

interface LeaveRoomPopoverBodyProps {
  selectedRoom: Room;
  currentUser: User;
  setSelectedRoom: (room: Room | null) => void;
}

const LeaveRoomPopoverBody: React.FC<LeaveRoomPopoverBodyProps> = ({
  selectedRoom,
  currentUser,
  setSelectedRoom,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleSubmit = () => {
    chatSocket.emit("leaveRoom", {
      roomId: selectedRoom.id,
      newOwnerId: selectedUserId,
    });
    setSelectedRoom(null);
  };

  return (
    <>
      <Box
        mb={4}
        overflowY="scroll"
        maxHeight="200px"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={2}
      >
        {selectedRoom.users.map(
          (user) =>
            currentUser.id !== user.id && (
              <Flex
                key={user.id}
                align="center"
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
                p={2}
                borderRadius="md"
                onClick={() => handleUserSelect(user.id)}
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
                  <Flex align="center">
                    <Badge ml="1" colorScheme={user.isOnline ? "green" : "red"}>
                      {user.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </Flex>
                </Box>
                {selectedUserId === user.id && (
                  <>
                    <Spacer />
                    <CheckIcon color="green.500" />
                  </>
                )}
              </Flex>
            )
        )}
      </Box>
      <Button
        colorScheme="teal"
        onClick={handleSubmit}
        isDisabled={selectedUserId === null}
      >
        Leave
      </Button>
    </>
  );
};

export default LeaveRoomPopoverBody;
