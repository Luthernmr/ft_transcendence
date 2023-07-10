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
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FiSend } from "react-icons/fi";
import { User } from "../Social/AllUserItem";
import { chatSocket } from "../../sockets/sockets";

interface Room {
  id: number;
  name: string;
  password: string;
  isPrivate: boolean;
  users: User[];
}

interface Message {
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

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

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

  React.useEffect(() => {
    chatSocket.emit("getRoomMessages", selectedRoom);

    const handleRoomMessages = (roomMessages: Message[]) => {
      setMessages(roomMessages);
    };

    chatSocket.on("roomMessages", handleRoomMessages);
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
      </Flex>
      <VStack
        marginY={"10px"}
        flex="1"
        spacing={4}
        align={"stretch"}
        overflowY={"auto"}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            bg={message.user?.id === currentUser.id ? "teal.500" : "gray.200"}
            color={message.user?.id === currentUser.id ? "white" : "black"}
            alignSelf={
              message.user?.id === currentUser.id ? "flex-end" : "flex-start"
            }
            borderRadius="lg"
            p={2}
            maxWidth="80%"
            mt={2}
          >
            <Text>{message.text}</Text>
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
