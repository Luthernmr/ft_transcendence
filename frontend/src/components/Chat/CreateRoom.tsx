import { Button, Flex, Heading, Input } from "@chakra-ui/react";

function CreateRoom() {
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
