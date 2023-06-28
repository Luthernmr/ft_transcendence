import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  Image,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  Text,
  Flex,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import axios from "axios";
import { BsJustify } from "react-icons/bs";
import AllfriendItem from "../Social/AllFriendsItem";
import Settings from "./Settings";
import MatchHistory from "./MatchHistory";
import { BlockList } from "net";
import BlockedList from "./BlockedList";

interface User {
	id : number,
	nickname: string,
	imgPdp: string,
	isTwoFa: boolean,
}

export default function UserProfile() {

	const currentUser : any = sessionStorage.getItem("currentUser");

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
      <Tabs variant="soft-rounded">
        <TabList mb="1em">
          <Tab>Profile Settings</Tab>
          <Tab>Match History</Tab>
          <Tab>Blocked List</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Settings />
          </TabPanel>
          <TabPanel>
            <MatchHistory user={currentUser}/>
          </TabPanel>
          <TabPanel>
            <BlockedList />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
