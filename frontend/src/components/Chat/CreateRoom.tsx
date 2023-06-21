import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Select,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { chatSocket, userSocket } from "../../sockets/sockets";
import { User } from "../Social/AllUserItem";

interface Room {
  name: string;
  members: User[];
}

interface CreateRoomProps {
  setShowCreateRoom: (show: boolean) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ setShowCreateRoom }) => {
  const [room, setRoom] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  useEffect(() => {
    userSocket.on("userList", (data) => {
      setAllUsers(data);
    });
    userSocket.emit("getAllUsers");
  }, []);

  useEffect(() => {
    if (selectedUser !== "") {
      const userToAdd = allUsers.find(
        (user) => user.id.toString() === selectedUser
      );
      if (userToAdd) {
        setMembers([...members, userToAdd]);
        setSelectedUser("");
      }
    }
  }, [selectedUser]);

  useEffect(() => {
    chatSocket.on("createRoom", (data) => {
      console.log("createRoom", data);
      setRoom(data);
    });
  }, []);

  function handleCreate(e: any) {
    e.preventDefault();
    if (roomName.trim() !== "") {
      chatSocket.emit("createRoom", { name: roomName, ownweId: userSocket.id ,members: members });
      setShowCreateRoom(false);
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
      />

      <Select
        placeholder="Select user"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        {allUsers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.nickname}
          </option>
        ))}
      </Select>

      <Flex direction="column">
        {members.map((member) => (
          <Text key={member.id}>{member.nickname}</Text>
        ))}
      </Flex>

      <Button colorScheme="teal" size="md" onClick={handleCreate}>
        Create
      </Button>
    </Flex>
  );
};

export default CreateRoom;
