import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Flex,
  Spacer,
} from '@chakra-ui/react';

interface Message {
  sender: string;
  content: string;
}

const exampleMessages: Message[] = [
  { sender: 'Alice', content: 'Salut !' },
  { sender: 'Bob the dog', content: 'Wsh !' },
  { sender: 'Alice', content: 'Comment ça va ?' },
  { sender: 'Bob the dog', content: 'OKLM !' },
];

interface MessageItemProps {
  sender: string;
  content: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ sender, content }) => {
  const isSentByMe = sender === 'Alice';

  return (
    <Flex width="100%">
      {isSentByMe ? <Spacer /> : null}
      <Box
        bg={isSentByMe ? 'blue.400' : 'gray.300'}
        color={isSentByMe ? 'white' : 'black'}
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

const Messaging: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  const sendMessage = () => {
    console.log('Message envoyé :', inputValue);
    setInputValue('');
  };

  return (
    <Box
      bg="white"
      borderRadius="lg"
      p={4}
      boxShadow="md"
      w="100%"
      maxW="500px"
    >
      <VStack spacing={4} align="start">
        {exampleMessages.map((msg, index) => (
          <MessageItem
            key={index}
            sender={msg.sender}
            content={msg.content}
          />
        ))}
      </VStack>
      <HStack spacing={4} mt={4}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Écrivez votre message ici..."
        />
        <Button colorScheme="teal" onClick={sendMessage}>
          Envoyer
        </Button>
      </HStack>
    </Box>
  );
};

export default Messaging;
