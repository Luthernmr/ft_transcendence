import React from "react";
import {
  Box,
  Flex,
  Heading,
  Avatar,
  AvatarGroup,
  VStack,
  IconButton,
  StackDivider,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

interface User {
  id: number;
  name: string;
  src: string;
}

interface GroupListProps {
  groups: any[];
  setSelectedGroup: (group: any) => void;
  setShowCreateRoom: (show: boolean) => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, setSelectedGroup, setShowCreateRoom}) => {
  return (
    <Flex
      borderRadius={"md"}
      bg={"white"}
      padding={"15px"}
      minHeight={"100%"}
      flex={"1"}
      direction={"column"}
      maxH={"100%"}
    >
      <Flex justifyContent={"space-between"} alignItems={"center"} mb={4}>
        <IconButton
          aria-label={"Add room"}
          icon={<AddIcon />}
          onClick={() => setShowCreateRoom(true)}
        />
        <Heading size={"md"} textAlign={"center"} flex={"1"}>
          Rooms
        </Heading>
      </Flex>
      <VStack
        divider={<StackDivider borderColor="gray.200" />}
        spacing={4}
        align="stretch"
        height="100%"
        overflowY="auto"
      >
        {groups.map((group, index) => (
          <Box h={"40px"} key={index} onClick={() => setSelectedGroup(group)}>
            <AvatarGroup size={"md"} max={2}>
              {group.users.map((user: User) => (
                <Avatar name={user.name} src={user.src} key={user.id} />
              ))}
            </AvatarGroup>
          </Box>
        ))}
      </VStack>
    </Flex>
  );
};

export default GroupList;
