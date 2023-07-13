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
import {
  AddIcon,
  CloseIcon,
  DeleteIcon,
  LockIcon,
  ViewIcon,
  ViewOffIcon,
} from "@chakra-ui/icons";
import { chatSocket } from "../../sockets/sockets";
import { User } from "../Social/AllUserItem";

interface Room {
  id: number;
  ownerId: number;
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
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  const [rooms, setRooms] = useState<Room[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roomPassword, setRoomPassword] = useState("");
  const [selectedRoom, setSelectedRoomLocal] = useState<Room | null>(null);
  const toast = useToast();

  useEffect(() => {
    chatSocket.emit("getUserRooms", { userId: currentUser.id });
    chatSocket.on("roomList", (rooms: Room[]) => {
      setRooms(rooms);
    });
    chatSocket.on("roomDeleted", (roomName: string) => {
      toast({
        title: roomName + " room deleted",
        status: "info",
        isClosable: true,
        position: "top",
      });
      chatSocket.emit("getUserRooms", { userId: currentUser.id });
    });

    chatSocket.on("roomCreated", () => {
      chatSocket.emit("getUserRooms", { userId: currentUser.id });
    });

    return () => {
      chatSocket.off("roomList");
      chatSocket.off("roomCreated");
      chatSocket.off("roomDeleted");
    };
  }, [currentUser.id]);

  const handleRoomClick = (room: Room) => {
    if (room.password) {
      setSelectedRoomLocal(room);
      onOpen();
    } else {
      setSelectedRoom(room);
    }
  };

  const handleDeleteRoom = (e: FormEvent, room: Room) => {
    e.stopPropagation();
    e.preventDefault();
    chatSocket.emit("deleteRoom", room);
    // chatSocket.emit("getUserRooms", { userId: currentUser.id });
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
              flex-direction={"column"}
              p={2}
              borderRadius={"8"}
              key={index}
              onClick={() => handleRoomClick(room)}
              _hover={{ bg: "gray.200" }}
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
                {currentUser.id === room.ownerId ? (
                  <IconButton
                    icon={<DeleteIcon />}
                    _hover={{ color: "red" }}
                    color="gray"
                    bg={"none"}
                    aria-label="Call Segun"
                    size="lg"
                    onClick={(e) => handleDeleteRoom(e, room)}
                  />
                ) : (
                  <IconButton
                    _hover={{ color: "none" }}
                    color="none"
                    bg={"none"}
                    aria-label="Hello ;)"
                    size="lg"
                  />
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
