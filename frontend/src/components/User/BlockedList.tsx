import { DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Text,
  List,
  ListItem,
  Flex,
  Avatar,
  HStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { userSocket } from "../../sockets/sockets";

export interface BlockedUser {
  id: number;
  nickname: string;
  imgPdp: string;
  isOnline: boolean;
}

export default function BlockedList() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const toast = useToast();

  useEffect(() => {
    userSocket.on("blockedList", (data) => {
      setBlockedUsers(data);
    });

    userSocket.emit("getBlockedList");

    userSocket.on("userHasBlocked", () => {
      userSocket.emit("getBlockedList");
    });

    userSocket.on("alreadyBlocked", () => {
      toast({
        title: `You can't block this user`,
        status: "error",
        isClosable: true,
        position: "top",
      });
    });
  }, []);

  function unblockUser(e: any, id: number) {
    e.preventDefault();
    userSocket.emit("unblockUser", { blockedId: id });
  }
  return (
    <List>
      {blockedUsers.map((blockedUser) => (
        <Box key={blockedUser.id}>
          <ListItem>
            <Flex
              alignItems={"center"}
              _hover={{ bg: "gray.200" }}
              padding={"2"}
              w={"100%"}
              borderRadius={"8"}
              justifyContent={"space-between"}
            >
              <HStack>
                <Avatar
                  name={blockedUser.nickname}
                  size="sm"
                  src={blockedUser.imgPdp}
                ></Avatar>
                <Box ml="2">
                  <Text fontSize="xl">{blockedUser.nickname}</Text>
                </Box>
              </HStack>
              <IconButton
                onClick={(e) => unblockUser(e, blockedUser.id)}
                color="gray"
                _hover={{ color: "red" }}
                bg={"none"}
                aria-label="Call Segun"
                size="lg"
                icon={<DeleteIcon />}
              />
            </Flex>
          </ListItem>
        </Box>
      ))}
    </List>
  );
}
