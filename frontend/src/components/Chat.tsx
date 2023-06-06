import {
  Avatar,
  AvatarGroup,
  Box,
  StackDivider,
  VStack,
} from "@chakra-ui/react";

function Chat() {
  return (
      <Box borderRadius={"md"} bg={"white"} padding={"15px"}>
        <VStack
          divider={<StackDivider borderColor="gray.200" />}
          spacing={4}
          align="stretch"
        >
          <Box h="40px">
            <AvatarGroup size="md" max={2}>
              <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
              <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
              <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
              <Avatar
                name="Prosper Otemuyiwa"
                src="https://bit.ly/prosper-baba"
              />
              <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
            </AvatarGroup>
          </Box>
          <Box h="40px">2</Box>
          <Box h="40px">3</Box>
        </VStack>
      </Box>
  );
}

export default Chat;
