import {
  Text,
  Box,
  Flex,
  Avatar,
  HStack,
  VStack,
  CircularProgress,
  CircularProgressLabel,
  Heading,
} from "@chakra-ui/react";
import AddFriendButton from "./AddFriendButton";
import BlockUserButton from "./BlockUserButton";

export default function OtherProfilInfo(props: any) {
  return (
    <>
      <Box borderWidth="1px" borderRadius="lg" p={4} m={4}>
        <Flex flexDirection={"column"} justifyContent={"space-between"}>
          <Flex alignItems={"center"} flexDirection={"row"}>
            <VStack>
              <CircularProgress
                transform={"rotate(180deg)"}
                value={props?.user?.ratioToNextLevel}
                size={"3em"}
                color="teal.500"
                thickness={"15%"}
              >
                <CircularProgressLabel
                  transform={"rotate(0.5turn) translateX(50%) translatey(50%)"}
                >
                  <Avatar
                    name={props.user?.nickname}
                    size={"2xl"}
                    src={props?.user?.imgPdp}
                  ></Avatar>
                  <Box
                    as={"span"}
                    position={"absolute"}
                    left={"calc(50% - 15px)"}
                    bottom={"-15px"}
                    h={"20px"}
                    w={"30px"}
                    bg={"black"}
                    border="2px"
                    borderColor={"teal.500"}
                    borderRadius={"8px"}
                    zIndex={9999}
                    p={"1px"}
                    alignSelf={"center"}
                  >
                    <Text m="-1" fontSize={"1.3em"} color={"white"}>
                      {props?.user?.level}
                    </Text>
                  </Box>
                </CircularProgressLabel>
              </CircularProgress>
              <Heading>{props.user?.nickname}</Heading>
            </VStack>
          </Flex>
          <HStack>
            <AddFriendButton user={props.user} />
            <BlockUserButton user={props.user} />
          </HStack>
        </Flex>
      </Box>
    </>
  );
}
