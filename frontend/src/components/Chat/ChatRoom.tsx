import React, { useState, FormEvent } from "react";
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
  id: string;
  name: string;
  password: string;
  isPrivate: boolean;
  users: User[];
}

interface ChatRoomProps {
  setSelectedRoom: (room: any) => void;
  selectedRoom: Room;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  setSelectedRoom,
  selectedRoom,
}) => {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  const [messageContent, setMessageContent] = useState<string>("");
  const toast = useToast();

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
      room: selectedRoom.id,
      user: currentUser.id,
    });

    setMessageContent("");
  };

  const handleError = (error: { message: any }) => {
    console.log("Here", error)
    toast({
      title: error.message,
      status: "error",
      isClosable: true,
      position: "top",
    });
    chatSocket.off("error1", handleError);
  };

  chatSocket.on("error1", handleError);

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
      <VStack flex="1" spacing={4} align={"stretch"} overflowY={"auto"}>
        {/* {messages.map((message) => (
          <Box
            key={message.id}
            bg={message.userId === 1 ? "teal.500" : "gray.200"}
            color={message.userId === 1 ? "white" : "black"}
            alignSelf={message.userId === 1 ? "flex-end" : "flex-start"}
            borderRadius="lg"
            p={2}
            maxWidth="80%"
            mt={2}
          >
            <Text>{message.content}</Text>
          </Box>
        ))} */}
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
