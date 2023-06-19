import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Flex, Heading, IconButton, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { chatSocket } from "../../sockets/sockets";

interface Room {
  name: string;
}

interface CreateRoomProps {
  setShowCreateRoom: (show: boolean) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ setShowCreateRoom }) => {
  const [room, setRoom] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    chatSocket.on("createRoom", (data) => {
      console.log("createRoom", data);
      setRoom(data);
    });
    // chatSocket.on('requestAcccepted', () => {
    // 	chatSocket.emit('getFriends');
    // })
    // chatSocket.emit('getFriends');

    // chatSocket.on('reload', () => {
    // 	chatSocket.emit('getFriends');
    // })
  }, []);

  function handleCreate(e: any) {
    e.preventDefault();
    chatSocket.emit("createRoom", {name: roomName});
    // console.log('deleteFriend');
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
      <Button
        colorScheme="teal"
        size="md"
        onClick={handleCreate}
      >
        Create
      </Button>
    </Flex>
  );
};

export default CreateRoom;
