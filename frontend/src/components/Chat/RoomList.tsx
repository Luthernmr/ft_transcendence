import React, { FormEvent, useEffect, useState } from "react";
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
  Input,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, LockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { chatSocket } from "../../sockets/sockets";
import { User } from "../Social/AllUserItem";

interface Room {
  id: number;
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
    chatSocket.emit("getUserRooms", { userId: currentUser.id });
    chatSocket.on("roomList", (rooms: Room[]) => {
      setRooms(rooms);
    });
  }, [currentUser.id]);

  useEffect(() => {
    console.log(rooms);
  }, [rooms]);  

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roomPassword, setRoomPassword] = useState("");
  const [selectedRoom, setSelectedRoomLocal] = useState<Room | null>(null);
  const toast = useToast();

  const handleRoomClick = (room: Room) => {
    if (room.password) {
      setSelectedRoomLocal(room);
      onOpen();
    } else {
      setSelectedRoom(room);
    }
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    chatSocket.on("passCheck", (check: boolean) => {
      if (check && selectedRoom) {
        setSelectedRoom(selectedRoom);
      } else {
        setRoomPassword("");
        toast({
          title: "Wrong password",
          status: "error",
          isClosable: true,
          position: "top",
        });
        return;
      }
    });
    chatSocket.emit("checkRoomPassword", {
      room: selectedRoom,
      password: roomPassword,
    });
    onClose();
  };

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
        {rooms?.length > 0 ? (
          rooms.map((room, index) => (
            <Box
              h={"40px"}
              key={index}
              onClick={() => handleRoomClick(room)}
              _hover={{
                transform: "scaleX(0.98)",
              }}
            >
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
          ))
        ) : (
          <Text textAlign={"center"} width="100%">
            No rooms available. Please create a new one.
          </Text>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Password Required</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handlePasswordSubmit}>
              <Input
                type="password"
                placeholder="Enter password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
              />
            </form>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handlePasswordSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default RoomList;
