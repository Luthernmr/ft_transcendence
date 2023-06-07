import { AddIcon, ArrowBackIcon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarGroup,
  Box,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  StackDivider,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiSend } from "react-icons/fi";

interface User {
  id: number;
  name: string;
  src: string;
}

interface Message {
  id: number;
  content: string;
  userId: number;
}

interface Group {
  users: User[];
}

const fakeMessagesData: Message[] = [
  { id: 1, userId: 1, content: "Hello, how are you?" },
  { id: 2, userId: 2, content: "I'm fine, thank you! And you?" },
  { id: 3, userId: 1, content: "I'm great! Thanks for asking." },
  { id: 4, userId: 2, content: "You're welcome!" },
  { id: 5, userId: 1, content: "So, what are you up to?" },
  { id: 6, userId: 2, content: "Just working on a project. You?" },
  { id: 7, userId: 1, content: "Same here. Let's keep in touch." },
  { id: 8, userId: 2, content: "Sure, talk to you later!" },
];

const fakeGroupsData: Group[] = [
  {
    users: [
      { id: 1, name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
      { id: 2, name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
      { id: 3, name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
    ],
  },
  {
    users: [
      { id: 3, name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
      { id: 4, name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
    ],
  },
];

function Chat() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  return selectedGroup ? (
    <Flex
      flex={"1"}
      direction="column"
      bg="white"
      padding="15px"
      height="100%"
      borderRadius="md"
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <IconButton
          aria-label="Go back"
          icon={<ArrowBackIcon />}
          onClick={() => setSelectedGroup(null)}
        />
        <Heading size="md" textAlign="center" flex="1">
          Room
        </Heading>
      </Flex>
      <VStack flex="1" spacing={4} align="stretch" overflowY="auto">
        {fakeMessagesData.map((message) => (
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
        <InputRightElement mr="1.5">
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
  ) : (
    <Flex
      direction="column"
      bg="white"
      padding="15px"
      minHeight="100%"
      borderRadius="md"
      flex="1"
      maxH="100%"
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <IconButton aria-label="Add room" icon={<AddIcon />} />
        <Heading size="md" textAlign="center" flex="1">
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
        {fakeGroupsData.map((group, index) => (
          <Box h="40px" key={index} onClick={() => setSelectedGroup(group)}>
            <AvatarGroup size="md" max={2}>
              {group.users.map((user) => (
                <Avatar name={user.name} src={user.src} key={user.id} />
              ))}
            </AvatarGroup>
          </Box>
        ))}
      </VStack>
    </Flex>
  );
}

export default Chat;
