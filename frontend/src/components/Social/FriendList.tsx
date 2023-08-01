import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
} from "@chakra-ui/react";
import AllUserItem, { User } from "./AllUserItem";
import AllfriendItem from "./AllFriendsItem";

export default function FriendList() {
  const currentUser: User = JSON.parse(
    sessionStorage.getItem("currentUser") || "{}"
  );
  return (
    <Flex zIndex={"9999"}>
      <Tabs variant="soft-rounded">
        <TabList mb="1em">
          <Tab>Friends</Tab>
          <Tab>All Users</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <AllfriendItem />
          </TabPanel>
          <TabPanel>
            <AllUserItem user={currentUser} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
