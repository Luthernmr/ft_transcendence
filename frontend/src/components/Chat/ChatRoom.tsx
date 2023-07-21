import React, { useState, useEffect, FormEvent, useRef } from "react";
import {
  Flex,
  Box,
  Heading,
  IconButton,
  VStack,
  Text,
  InputGroup,
  Input,
  InputRightElement,
  useToast,
  Button,
  Avatar,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
} from "@chakra-ui/react";
import { ArrowBackIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { FiLogOut, FiSend, FiSettings } from "react-icons/fi";
import { User } from "../Social/AllUserItem";
import { chatSocket, userSocket } from "../../sockets/sockets";
import AddFriendButton from "../Social/AddFriendButton";
import BlockUserButton from "../Social/BlockUserButton";
import PongInviteButton from "../Social/PongInviteButton";
import { Link as RouteLink } from "react-router-dom";
import LeavePopover from "./LeavePopover";
import SettingsPopover from "./SettingsPopover";
import UserOptions from "./UserOptions";

export interface Room {
  id: number;
  name: string;
  password: string;
  isPrivate: boolean;
  users: User[];
  admins: User[];
  ownerId: number;
}

export interface Message {
  id: number;
  text: string;
  created_at: Date;
  user: User;
}

interface Props {
  setSelectedRoom: (room: Room | null) => void;
  selectedRoom: Room;
}

const ChatRoom: React.FC<Props> = ({ setSelectedRoom, selectedRoom }) => {
  const currentUser: User = JSON.parse(
    sessionStorage.getItem("currentUser") || "{}"
  );
  const [messageContent, setMessageContent] = useState<string>("");
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const toast = useToast();

  const handleLeaveRoom = () => {
    chatSocket.emit("leaveRoom", {
      roomId: selectedRoom.id,
    });
    setSelectedRoom(null);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (messageContent.trim() === "") {
      toast({
        title: "Type a message",
        status: "error",
        isClosable: true,
        position: "top",
      });
      return;
    }
    chatSocket.emit("sendMessage", {
      text: messageContent,
      room: selectedRoom,
      user: currentUser,
    });
    setMessageContent("");
  };

  const handleRoomMessages = (roomMessages: Message[]) =>
    setMessages(roomMessages);
  const handleBlockedUsers = (blockedUsers: User[]) =>
    setBlockedUsers(blockedUsers);
  const handleError = (error: { message: string }) =>
    toast({
      title: error.message,
      status: "error",
      isClosable: true,
      position: "top",
    });
  const handleReceiveMessage = (receivedMessage: Message) =>
    setMessages((prevMessages) => [...prevMessages, receivedMessage]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    chatSocket.emit("getRoomMessages", selectedRoom);
    userSocket.emit("getBlockedList");
    chatSocket.on("roomMessages", handleRoomMessages);
    userSocket.on("blockedList", handleBlockedUsers);
    chatSocket.on("error", handleError);
    chatSocket.on("receiveMessage", handleReceiveMessage);
    chatSocket.on("leftRoom", (userName: string, updatedRoom: Room) => {
      if (selectedRoom.id === updatedRoom.id) {
        toast({
          title: userName + " just left the room.",
          status: "info",
          isClosable: true,
          position: "top",
        });
        if (userName != currentUser.nickname) {
          setSelectedRoom(updatedRoom);
        }
      }
    });
    chatSocket.on("roomPasswordChanged", (updatedRoom: Room) => {
      if (selectedRoom.id === updatedRoom.id) {
        toast({
          title: "Room password has been changed.",
          status: "info",
          isClosable: true,
          position: "top",
        });
        setSelectedRoom(updatedRoom);
      }
    });
    chatSocket.on("adminsUpdated", (updatedRoom: Room) => {
      if (selectedRoom.id === updatedRoom.id) {
        toast({
          title: "Room admins have been updated.",
          status: "info",
          isClosable: true,
          position: "top",
        });
        setSelectedRoom(updatedRoom);
      }
    });
    return () => {
      chatSocket.off("roomMessages", handleRoomMessages);
      chatSocket.off("blockedList", handleRoomMessages);
      chatSocket.off("error", handleError);
      chatSocket.off("receiveMessage", handleReceiveMessage);
      chatSocket.off("leftRoom", handleReceiveMessage);
      chatSocket.off("roomPasswordChanged");
      chatSocket.off("adminsUpdated");
    };
  }, []);

  return (
    <Flex
      borderRadius={"md"}
      bg={"white"}
      padding={"15px"}
      height="100%"
      flex={"1"}
      direction="column"
    >
      <Flex justifyContent={"space-between"} alignItems={"center"} mb={4}>
        <IconButton
          aria-label={"Go back"}
          icon={<ArrowBackIcon />}
          onClick={() => setSelectedRoom(null)}
        />

        <Heading size={"md"} textAlign={"center"} flex={"1"}>
          {selectedRoom.name}
        </Heading>

        <Flex>
          {currentUser.id === selectedRoom.ownerId && (
            <Popover>
              {({ onClose }) => (
                <>
                  <PopoverTrigger>
                    <IconButton
                      icon={<FiSettings />}
                      aria-label={"Settings"}
                      mr={2}
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>Room Settings</PopoverHeader>
                    <PopoverBody>
                      <SettingsPopover
                        onClose={onClose}
                        selectedRoom={selectedRoom}
                        currentUser={currentUser}
                        setSelectedRoom={setSelectedRoom}
                      />
                    </PopoverBody>
                  </PopoverContent>
                </>
              )}
            </Popover>
          )}

          {currentUser.id === selectedRoom.ownerId &&
          selectedRoom.users.length > 1 ? (
            <Popover>
              <PopoverTrigger>
                <IconButton icon={<FiLogOut />} aria-label={"Leave"} />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Choose a new owner</PopoverHeader>
                <PopoverBody>
                  <LeavePopover
                    selectedRoom={selectedRoom}
                    currentUser={currentUser}
                    setSelectedRoom={setSelectedRoom}
                  />
                </PopoverBody>
              </PopoverContent>
            </Popover>
          ) : (
            <IconButton
              icon={<FiLogOut />}
              aria-label={"Leave"}
              onClick={() => {
                if (currentUser.id === selectedRoom.ownerId) {
                  chatSocket.emit("deleteRoom", selectedRoom);
                } else {
                  handleLeaveRoom();
                }
                setSelectedRoom(null);
              }}
            />
          )}
        </Flex>
      </Flex>
      <VStack
        marginY={"10px"}
        flex="1"
        spacing={4}
        align={"stretch"}
        overflowY={"auto"}
        padding={"15px"}
      >
        {messages.map((message: any, index: number) => (
          <Box
            key={index}
            bg={message.user?.id === currentUser.id ? "teal.500" : "gray.200"}
            color={message.user?.id === currentUser.id ? "white" : "black"}
            p={2}
            alignSelf={
              message.user?.id === currentUser.id ? "flex-end" : "flex-start"
            }
            borderRadius="lg"
            maxWidth="80%"
            mt={2}
            style={{
              filter: blockedUsers?.some((user) => user.id === message.user.id)
                ? "blur(10px)"
                : "none",
              pointerEvents: blockedUsers?.some(
                (user) => user.id === message.user.id
              )
                ? "none"
                : "auto",
            }}
          >
            <Flex flexDirection="column">
              <Popover isLazy>
                <PopoverTrigger>
                  <Flex alignItems="center">
                    <Avatar
                      size="sm"
                      name={message.user.nickname}
                      src={message.user.imgPdp}
                      _hover={{ boxShadow: "0 0 0 3px teal" }}
                    />
                    <Text ml={2}>{message.user?.nickname}</Text>
                  </Flex>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverHeader>
                      <UserOptions
                        isAdmin={
                          selectedRoom.ownerId === currentUser.id ||
                          selectedRoom.admins.some(
                            (admin) => admin.id === currentUser.id
                          )
                        }
                        targetedUser={message.user}
                        currentUserId={currentUser.id}
                        ownerId={selectedRoom.ownerId}
                      />

                      <Button
                        w={"100%"}
                        as={RouteLink}
                        to={"/profile/" + message.user?.id}
                        alignItems={"center"}
                        _hover={{ bg: "gray.200" }}
                        p={2}
                        borderRadius={5}
                      >
                        <Text>
                          Visit
                          <Text as="b" color="teal">
                            {" "}
                            {message.user?.nickname}
                          </Text>
                          's profile
                        </Text>
                        <ChevronRightIcon />
                      </Button>
                    </PopoverHeader>
                    <PopoverCloseButton />
                    <PopoverBody>
                      <Flex justifyContent={"space-between"}>
                        <AddFriendButton user={message.user} />
                        <BlockUserButton user={message.user} />
                        <PongInviteButton user={message.user} />
                      </Flex>
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
              <Text mt={1}>{message.text}</Text>
            </Flex>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </VStack>
      <form onSubmit={handleSendMessage}>
        <InputGroup size="md">
          <Input
            placeholder="Type your message..."
            borderRadius="md"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
          />
          <InputRightElement mr={"1.5"}>
            <Button
              colorScheme="teal"
              h="1.75rem"
              size="sm"
              aria-label="Send message"
              type="submit"
            >
              <FiSend />
            </Button>
          </InputRightElement>
        </InputGroup>
      </form>
    </Flex>
  );
};

export default ChatRoom;
