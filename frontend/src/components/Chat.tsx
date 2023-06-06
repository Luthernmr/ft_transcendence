import { AddIcon, ArrowBackIcon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarGroup,
  Box,
  Flex,
  Heading,
  IconButton,
  StackDivider,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  src: string;
}

interface Group {
  users: User[];
}

function Chat() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    const fakeGroupsData: Group[] = [
      {
        users: [
          { id: 1, name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
          { id: 2, name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
          { id: 3, name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
        ],
      },
      {
        users: [
          { id: 3, name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
          {
            id: 4,
            name: "Prosper Otemuyiwa",
            src: "https://bit.ly/prosper-baba",
          },
        ],
      },
    ];

    setGroups(fakeGroupsData);
  }, []);

  if (selectedGroup) {
    return (
      <Box
        borderRadius={"md"}
        bg={"white"}
        padding={"15px"}
        height="100%"
        flex={"1"}
      >
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          <IconButton aria-label={"Go back"} icon={<ArrowBackIcon />} onClick={() => setSelectedGroup(null)}/>
          <Heading size={"md"} textAlign={"center"} flex={"1"}>
            Rooms
          </Heading>
        </Flex>
      </Box>
    );
  }

  return (
    <Flex
      borderRadius={"md"}
      bg={"white"}
      padding={"15px"}
      minHeight={"100%"}
      flex={"1"}
      direction={"column"}
    >
      <VStack
        divider={<StackDivider borderColor={"gray.200"} />}
        spacing={4}
        align={"stretch"}
        height={"100%"}
      >
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          <Heading size={"md"} textAlign={"center"} flex={"1"}>
            Rooms
          </Heading>
          <IconButton aria-label={"Add room"} icon={<AddIcon />} />
        </Flex>
        {groups.map((group, index) => (
          <Box h={"40px"} key={index} onClick={() => setSelectedGroup(group)}>
            <AvatarGroup size={"md"} max={2}>
              {group.users.map((user) => (
                <Avatar name={user.name} src={user.src} key={user.id} />
              ))}
            </AvatarGroup>
          </Box>
        ))}
      </VStack>
    </Flex>
  );
}

export default Chat;
