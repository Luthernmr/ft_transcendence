import { ArrowBackIcon, CheckIcon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarBadge,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { chatSocket, userSocket } from "../../sockets/sockets";

interface User {
  id: number;
  nickname: string;
  imgPdp: string;
  isOnline: boolean;
}

interface Room {
  name: string;
  members: User[];
}

interface CreateRoomProps {
  setShowCreateRoom: (show: boolean) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ setShowCreateRoom }) => {
  const [roomName, setRoomName] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    userSocket.on("userList", (data) => {
      setAllUsers(data);
    });
    userSocket.emit("getAllUsers");
  }, []);

  function handleCreate(e: any) {
    e.preventDefault();
    if (roomName.trim() !== "") {
      chatSocket.emit("createRoom", { name: roomName, members: members });
      setShowCreateRoom(false);
    }
  }

  function handleAddMember(user: User) {
    const memberExists = members.find((m) => m.id === user.id);
    if (!memberExists) {
      setMembers([...members, user]);
    } else {
      setMembers(members.filter((m) => m.id !== user.id));
    }
  }
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
          onClick={() => setShowCreateRoom(false)}
        />
        <Heading size={"md"} textAlign={"center"} flex={"1"}>
          Create Room
        </Heading>
      </Flex>

      <Input
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Type the name of the room..."
        borderRadius="md"
        mb={4}
      />

      <Text mb={2} fontWeight="semibold">
        Click on a user to add them to the room:
      </Text>

      <Box
        overflowY="scroll"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={2}
        mb={4}
        maxH="200px"
      >
        {allUsers.map((user) => (
          <Flex
            key={user.id}
            alignItems={"center"}
            _hover={{ bg: "gray.200", cursor: "pointer" }}
            padding={"2"}
            w={"100%"}
            borderRadius={"8"}
            onClick={() => handleAddMember(user)}
          >
            <Avatar size="sm" src={user.imgPdp}>
              <AvatarBadge boxSize="1em" bg={user.isOnline ? "green.500" : "tomato"} />
            </Avatar>
            <Box ml="2">
              <Flex alignItems="center">
                <Heading size="sm">{user.nickname}</Heading>
                <Badge ml="1" colorScheme={user.isOnline ? "green" : "red"}>
                  {user.isOnline ? "Online" : "Offline"}
                </Badge>
              </Flex>
            </Box>
            {members.find((m) => m.id === user.id) && <CheckIcon ml="auto" color="green.500" />}
          </Flex>
        ))}
      </Box>

      <Text mb={2} fontWeight="semibold">
        Selected members:
      </Text>

      <Stack direction="row" spacing={2} overflowX="auto" mb={4}>
        {members.map((user) => (
          <Avatar key={user.id} size="sm" src={user.imgPdp}>
            <AvatarBadge boxSize="1em" bg={user.isOnline ? "green.500" : "tomato"} />
          </Avatar>
        ))}
      </Stack>

      <Spacer />

      <Button colorScheme="teal" size="md" w="100%" onClick={handleCreate}>
        Create
      </Button>
    </Flex>
  );
};

export default CreateRoom;
