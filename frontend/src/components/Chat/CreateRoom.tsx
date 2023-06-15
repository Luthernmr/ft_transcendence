import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Flex, Heading, IconButton, Input } from "@chakra-ui/react";


interface CreateRoomProps {
  setShowCreateRoom: (show: boolean) => void;
}
const CreateRoom: React.FC<CreateRoomProps> = ({ setShowCreateRoom }) => {
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
      <Input placeholder="Type the name of the room..." borderRadius="md" />
      <Button colorScheme="teal" size="md">
        Create
      </Button>
    </Flex>
  );
}

export default CreateRoom;
