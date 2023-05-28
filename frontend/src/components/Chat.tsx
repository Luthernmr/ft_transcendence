import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Flex,
  Spacer,
} from "@chakra-ui/react";

interface Message {
  sender: string;
  content: string;
}

const exampleMessages: Message[] = [
  { sender: 'Alice', content: 'Hello !' },
  { sender: 'Bob the dog', content: 'Yo man !' },
  { sender: 'Alice', content: 'How are you ?' },
  { sender: 'Bob the dog', content: 'Good !' },
  { sender: 'Alice', content: 'How you dealin with socket ?' },
  { sender: 'Bob the dog', content: 'I do some front to chill a bit 😁' },
  { sender: 'Alice', content: 'Okay!' },
  { sender: 'Bob the dog', content: 'Luther is giving me some good vibes 🔥!' },
  { sender: 'Alice', content: 'Oh really nice !' },
  { sender: 'Bob the dog', content: 'Aza too man 👨‍🎤 !' },
  { sender: 'Alice', content: 'Wait, wait are you the Bowie ft Les Daft-punk Team ?' },
  { sender: 'Bob the dog', content: 'We are !' },
  { sender: 'Bob the dog', content: 'And I\'m a bit skyzo 👒 !' },
];

interface MessageItemProps {
  sender: string;
  content: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ sender, content }) => {
  const isSentByMe = sender === "Alice";

  return (
    <Flex width="100%">
      {isSentByMe ? <Spacer /> : null}
      <Box
        bg={isSentByMe ? "blue.400" : "gray.300"}
        color={isSentByMe ? "white" : "black"}
        borderRadius="lg"
        px={4}
        py={2}
        maxW="70%"
      >
        <Text fontWeight="bold">{sender}</Text>
        <Text>{content}</Text>
      </Box>
      {!isSentByMe ? <Spacer /> : null}
    </Flex>
  );
};

const ChatComponent: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>(exampleMessages);
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = useState<number>(0);

  const sendMessage = () => {
    console.log("Message sent:", inputValue);
    setInputValue("");
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;
      const headerHeight = 60;
      const footerHeight = 50;
      const calculatedHeight = windowHeight - headerHeight - footerHeight;
      setChatHeight(calculatedHeight);
    };

    calculateHeight();

    window.addEventListener("resize", calculateHeight);

    return () => {
      window.removeEventListener("resize", calculateHeight);
    };
  }, []);

  return (
    <Flex
      bg="white"
      borderRadius="lg"
      p={4}
      boxShadow="md"
      h={`${chatHeight}px`}
      w="100%"
      direction="column"
      justify="space-between"
    >
      <Box flex="1" overflowY="auto" ref={chatRef}>
        <VStack spacing={4} align="start">
          {messages.map((msg, index) => (
            <MessageItem key={index} sender={msg.sender} content={msg.content} />
          ))}
        </VStack>
      </Box>
      <HStack spacing={4} mt={4}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          flex="1"
        />
        <Button colorScheme="teal" onClick={sendMessage}>
          Send
        </Button>
      </HStack>
    </Flex>
  );
};

export default ChatComponent;
