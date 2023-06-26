import { useCallback, useEffect, useState } from 'react';
import { ArrowBackIcon, CheckIcon, ViewIcon, ViewOffIcon, LockIcon, UnlockIcon } from "@chakra-ui/icons";
import { Avatar, AvatarBadge, Badge, Box, Button, Flex, Heading, IconButton, Input, Spacer, Switch, Text, VStack } from "@chakra-ui/react";
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
  const [roomName, setRoomName] = useState<string>("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [password, setPassword] = useState<string>("");
  const [passwordEnabled, setPasswordEnabled] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  const userListListener = useCallback((data: User[]) => {
    setAllUsers(data);
  }, []);

  useEffect(() => {
    userSocket.on("userList", userListListener);
    userSocket.emit("getAllUsers");
    return () => {
      userSocket.off("userList", userListListener);
    };
  }, [userListListener]);

  const handleCreate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() !== "") {
      chatSocket.emit("createRoom", {
        name: roomName,
        users: members,
        password: passwordEnabled ? password : null,
        isPrivate: isPrivate
      });
      setShowCreateRoom(false);
    }
  }, [roomName, members, password, passwordEnabled, isPrivate, setShowCreateRoom]);

  const handleAddMember = useCallback((user: User) => {
    const memberExists = members.find((m) => m.id === user.id);
    if (!memberExists) {
      setMembers([...members, user]);
    } else {
      setMembers(members.filter((m) => m.id !== user.id));
    }
  }, [members]);

  localStorage.getItem("user")

  const AvatarWithBadge = ({ src, isOnline, ...props }: { src: string, isOnline: boolean, props?: any }) => (
    <Avatar size="sm" src={src} {...props}>
      <AvatarBadge boxSize="1em" bg={isPrivate ? "green.500" : "tomato"} />
    </Avatar>
  );
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

      <Flex alignItems="center" mb={4}>
        <Input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Type the name of the room..."
          borderRadius="md"
          flexGrow={1}
          mr={4}
        />
        <VStack alignItems="start" spacing={0.5}>
          <Text fontWeight={"bold"} fontSize={"xs"}>
            Private
          </Text>
          <Flex alignItems="center">
            <Switch
              isChecked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            {isPrivate ? (
              <ViewOffIcon boxSize={6} ml={2} />
            ) : (
              <ViewIcon boxSize={6} ml={2} />
            )}
          </Flex>
        </VStack>
      </Flex>

      <Flex alignItems="center" mb={4}>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password..."
          borderRadius="md"
          isDisabled={!passwordEnabled}
          flexGrow={1}
          mr={4}
        />
        <VStack alignItems="start" spacing={0.5}>
          <Text fontWeight={"bold"} fontSize={"xs"}>
            Password
          </Text>
          <Flex alignItems="center">
            <Switch
              isChecked={passwordEnabled}
              onChange={() => setPasswordEnabled(!passwordEnabled)}
            />
            {passwordEnabled ? (
              <LockIcon boxSize={6} ml={2} />
            ) : (
              <UnlockIcon boxSize={6} ml={2} />
            )}
          </Flex>
        </VStack>
      </Flex>

      <Text mb={2} fontWeight="semibold">
        Choose members:
      </Text>

      <Box
        mb={4}
        overflowY="scroll"
        maxHeight="200px"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={2}
      >
        {allUsers.map((user) => (
          <Flex
            key={user.id}
            align="center"
            _hover={{ bg: "gray.100" }}
            cursor="pointer"
            p={2}
            borderRadius="md"
            onClick={() => handleAddMember(user)}
          >
            <Avatar size="sm" src={user.imgPdp}>
              <AvatarBadge
                boxSize="1em"
                bg={user.isOnline ? "green.500" : "tomato"}
              />
            </Avatar>
            <Box ml="2">
              <Text fontSize="sm" fontWeight="bold">
                {user.nickname}
              </Text>
              <Flex align="center">
                <Badge ml="1" colorScheme={user.isOnline ? "green" : "red"}>
                  {user.isOnline ? "Online" : "Offline"}
                </Badge>
              </Flex>
            </Box>
            {members.some((member) => member.id === user.id) && (
              <>
                <Spacer />
                <CheckIcon color="green.500" />
              </>
            )}
          </Flex>
        ))}
      </Box>

      <Text mb={2} fontWeight="semibold">
        Selected members:
      </Text>
      <Flex wrap="wrap" justify="start">
        {members.map((member) => (
          <Box key={member.id} mr={2}>
            <Avatar size="sm" name={member.nickname} src={member.imgPdp}>
              <AvatarBadge
                boxSize="1em"
                bg={member.isOnline ? "green.500" : "tomato"}
              />
            </Avatar>
          </Box>
        ))}
      </Flex>

      <Spacer />

      <Button colorScheme="teal" w="100%" size="md" onClick={handleCreate}>
        Create
      </Button>
    </Flex>
  );
};

export default CreateRoom;
