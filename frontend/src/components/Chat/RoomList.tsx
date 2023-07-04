import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Avatar,
  AvatarGroup,
  VStack,
  IconButton,
  StackDivider,
  Text,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import {
  AddIcon,
  LockIcon,
  UnlockIcon,
  ViewIcon,
  ViewOffIcon,
} from "@chakra-ui/icons";
import { chatSocket } from "../../sockets/sockets";
import { User } from "../Social/AllUserItem";

interface Room {
  id: string;
  name: string;
  password: string;
  isPrivate: boolean;
  users: User[];
}

interface RoomListProps {
  setSelectedRoom: (room: Room) => void;
  setShowCreateRoom: (show: boolean) => void;
}

const RoomList: React.FC<RoomListProps> = ({
  setSelectedRoom,
  setShowCreateRoom,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");

  useEffect(() => {
    chatSocket.on("roomList", (rooms: Room[]) => {
      setRooms(rooms);
    });
    chatSocket.emit("getUserRooms", { userId: currentUser.id });

    return () => {
      chatSocket.off("roomList");
    };
  }, [currentUser.id]);

  return (
    <Flex
      borderRadius={"md"}
      bg={"white"}
      padding={"15px"}
      minHeight={"100%"}
      flex={"1"}
      direction={"column"}
      maxH={"100%"}
    >
      <Flex justifyContent={"space-between"} alignItems={"center"} mb={4}>
        <IconButton
          aria-label={"Add room"}
          icon={<AddIcon />}
          onClick={() => setShowCreateRoom(true)}
        />
        <Heading size={"md"} textAlign={"center"} flex={"1"}>
          Rooms
        </Heading>
      </Flex>
      <VStack
        divider={<StackDivider borderColor="gray.200" />}
        spacing={4}
        align="stretch"
        height="100%"
        overflowY="auto"
      >
        {rooms?.map((room, index) => (
          <Box h={"40px"} key={index} onClick={() => setSelectedRoom(room)}>
            <HStack>
              <AvatarGroup size={"md"} max={3}>
                {room?.users?.map((user: User) => (
                  <Avatar
                    name={user.nickname}
                    src={user.imgPdp}
                    key={user.id}
                  />
                ))}
              </AvatarGroup>
              <Spacer />
              <Text mr={2}>{room.name}</Text>
              {room.isPrivate && (
                <ViewOffIcon boxSize={6} ml={2} color={"gray.500"} />
              )}
              {room.password && (
                <LockIcon boxSize={6} ml={2} color={"gray.500"} />
              )}
              {!room.isPrivate && !room.password && (
                <ViewIcon boxSize={6} ml={2} color={"gray.500"} />
              )}
            </HStack>
          </Box>
        ))}
      </VStack>
    </Flex>
  );
};

export default RoomList;
