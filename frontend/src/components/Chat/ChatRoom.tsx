import React from 'react';
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
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FiSend } from "react-icons/fi";

interface ChatRoomProps {
  messages: any[];
  setSelectedRoom: (room: any) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages, setSelectedRoom }) => {
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
          Room
        </Heading>
      </Flex>
      <VStack flex="1" spacing={4} align={"stretch"} overflowY={"auto"}>
        {messages.map((message) => (
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
        ))}
      </VStack>
      <InputGroup size="md">
        <Input placeholder="Type your message..." borderRadius="md" />
        <InputRightElement mr={"1.5"}>
          <IconButton
            colorScheme="teal"
            h="1.75rem"
            size="sm"
            aria-label="Send message"
            icon={<FiSend />}
            type="submit"
          />
        </InputRightElement>
      </InputGroup>
    </Flex>
  );
};

export default ChatRoom;
