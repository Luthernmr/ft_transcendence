import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  Portal,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  IconButton,
  Box,
  Avatar,
  Text,
  Flex,
  Stack,
  Center,
  Heading,
  ScaleFade,
  Fade,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import { userSocket } from "../../sockets/sockets";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export interface FriendRequest {
  id: number;
  senderNickname: string;
  senderPdp: string;
  type: string;
}

const PendingRequest = () => {
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const toast = useToast();
  useEffect(() => {
    userSocket.on("notifyRequest", () => {
      userSocket.emit("getPendingRequest");
    });

    userSocket.on("pendingRequestsList", (data) => {
      setFriendRequests(data);
    });
    userSocket.on("requestAcccepted", () => {
      userSocket.emit("getPendingRequest");
    });

    userSocket.on("duelAcccepted", () => {
      userSocket.emit("getPendingRequest");
      navigate("/play");
    });
    userSocket.on("requestRejected", () => {
      userSocket.emit("getPendingRequest");
    });
    userSocket.emit("getPendingRequest");

    userSocket.on("pendingRequestsList", (data) => {
      setFriendRequests(data);
    });
    userSocket.on("requestAcccepted", () => {
      userSocket.emit("getPendingRequest");
    });
    userSocket.on("requestRejected", () => {
      userSocket.emit("getPendingRequest");
    });
    userSocket.emit("getPendingRequest");

    userSocket.on("sendSuccess", () => {
      toast({
        title: `A request has been sent`,
        status: "success",
        isClosable: true,
        position: "top",
      });
    });
    userSocket.on("alreadyFriend", () => {
      toast({
        title: `You can't send more friend request`,
        status: "error",
        isClosable: true,
        position: "top",
      });
    });
  }, []);

  const handleAccept = async (id: number, type: string) => {
    if (type == "Friend")
      userSocket.emit("acceptFriendRequest", { requestId: id });
    if (type == "Pong") userSocket.emit("acceptPongRequest", { requestId: id });
  };

  const handleReject = async (id: number) => {
    userSocket.emit("rejectRequest", { requestId: id });
  };
  if (friendRequests.length) {
    return (
      <Box>
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList>
            <Tab>Notifications</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {friendRequests.map((friendRequest) => (
                <Flex key={friendRequest.id} flexDirection={"column"}>
                  <Flex direction="row" align="center" p={3}>
                    <Avatar
                      src={friendRequest.senderPdp}
                      size="xs"
                      name={friendRequest.senderNickname}
                      ml={-1}
                      mr={2}
                    />
                    <Text>
                      <Text as="b">{friendRequest.senderNickname}</Text> send
                      you a {friendRequest.type} Request{" "}
                    </Text>
                  </Flex>
                  <Stack spacing={2} direction="row" align="center">
                    <Button
                      colorScheme="twitter"
                      size="sm"
                      onClick={() =>
                        handleAccept(friendRequest.id, friendRequest.type)
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      colorScheme="gray"
                      onClick={() => handleReject(friendRequest.id)}
                      size="sm"
                    >
                      Reject
                    </Button>
                  </Stack>
                </Flex>
              ))}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    );
  } else
    return (
      <>
        <Center>
          <Text color={"gray.500"}>No notifications for the moment</Text>
        </Center>
      </>
    );
};

const BellButton = () => {
  const [notified, setNotified] = useState(false);
  const [count, setCount] = useState(0);

  const handleNotify = async () => {
    setNotified(false);
  };

  useEffect(() => {
    userSocket.on("requestAcccepted", () => {
      setNotified(false);
    });
    userSocket.on("duelAcccepted", () => {
      setNotified(false);
    });

    userSocket.on("notifyRequest", () => {
      setNotified(true);
    });
    userSocket.on("pendingRequestsList", (data) => {
      if (data.length) {
        if (data.length < 100) setCount(data.length);
        else setCount(99);
        setNotified(true);
      }
    });

    userSocket.on("requestRejected", () => {
      setNotified(false);
    });
    userSocket.on("duelRejected", () => {
      setNotified(false);
    });
  }, [notified]);

  if (notified)
    return (
      <PopoverTrigger>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          icon={
            <>
              <FiBell color={"gray.750"} />
              <Box
                as={"span"}
                color={"white"}
                position={"absolute"}
                top={"10px"}
                right={"10px"}
                boxSize="0.7em"
                bgColor={"red"}
                borderRadius={"100%"}
                zIndex={9999}
                transition={"ease-in-out"}
              >
                <Text fontSize={"9px"} m={"1px"}>
                  {count}
                </Text>
              </Box>
            </>
          }
        />
      </PopoverTrigger>
    );
  else
    return (
      <PopoverTrigger>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          icon={<FiBell />}
          onClick={handleNotify}
        />
      </PopoverTrigger>
    );
};

export default function Notification() {
  return (
    <Popover>
      <BellButton />
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <PendingRequest />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
