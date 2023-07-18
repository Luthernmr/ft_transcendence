import React, { useState, FormEvent, useRef, useEffect } from "react";
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
import {
  ArrowBackIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { FiLogOut, FiSend } from "react-icons/fi";
import { User } from "../Social/AllUserItem";
import { chatSocket, userSocket } from "../../sockets/sockets";
import AddFriendButton from "../Social/AddFriendButton";
import BlockUserButton from "../Social/BlockUserButton";
import PongInviteButton from "../Social/PongInviteButton";
import { Link as RouteLink } from "react-router-dom";
import LeaveRoomPopoverBody from "./LeaveRoomPopoverBody";

export interface Room {
  id: number;
  name: string;
  password: string;
  isPrivate: boolean;
  users: User[];
  ownerId: number;
}

export interface Message {
  id: number;
  text: string;
  created_at: Date;
  user: User;
}

interface ChatRoomProps {
  setSelectedRoom: (room: any) => void;
  selectedRoom: Room;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  setSelectedRoom,
  selectedRoom,
}) => {
  const currentUser: User = JSON.parse(
    sessionStorage.getItem("currentUser") || "{}"
  );
  const [messageContent, setMessageContent] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const toast = useToast();
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  // const [newOwnerId, setNewOwnerId] = useState(null);
  // const [showOwnerSelect, setShowOwnerSelect] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // useEffect(() => {
  //   if (currentUser.id === selectedRoom.ownerId) {
  //     setShowOwnerSelect(true);
  //   }
  // }, [selectedRoom]);

  const handleLeaveRoom = () => {
    // Emit leaveRoom event through WebSocket connection.
    // If showOwnerSelect is true, pass newOwnerId as well.
    // Your WebSocket client might look something like socket.emit('leaveRoom', { roomId: selectedRoom.id, newOwnerId });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

  const handleError = (error: { message: string }) => {
    toast({
      title: error.message,
      status: "error",
      isClosable: true,
      position: "top",
    });
  };

  const handleReceiveMessage = (receivedMessage: Message) => {
    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
  };

  useEffect(() => {
    chatSocket.emit("getRoomMessages", selectedRoom);
    userSocket.emit("getBlockedList");

    const handleRoomMessages = (roomMessages: Message[]) => {
      setMessages(roomMessages);
    };

    const handleBlockedUsers = (blockedUsers: User[]) => {
      setBlockedUsers(blockedUsers);
    };

    chatSocket.on("roomMessages", handleRoomMessages);
    userSocket.on("blockedList", handleBlockedUsers);
    chatSocket.on("error", handleError);
    chatSocket.on("receiveMessage", handleReceiveMessage);

    return () => {
      chatSocket.off("roomMessages", handleRoomMessages);
      chatSocket.off("error", handleError);
      chatSocket.off("receiveMessage", handleReceiveMessage);
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

        {currentUser.id === selectedRoom.ownerId ? (
          <Popover>
            <PopoverTrigger>
              <IconButton icon={<FiLogOut />} aria-label={"Leave"} />
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Choose a new owner</PopoverHeader>
              <PopoverBody>
                <LeaveRoomPopoverBody
                  selectedRoom={selectedRoom}
                  currentUser={currentUser}
                  // handleLeaveRoom={handleLeaveRoom}
                />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        ) : (
          <IconButton
            icon={<FiLogOut />}
            aria-label={"Leave"}
            onClick={handleLeaveRoom}
          />
        )}
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
