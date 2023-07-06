import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import AllUserItem from "./AllUserItem";
import AllfriendItem from "./AllFriendsItem";

export default function FriendList(MobileProps) {
  return (
    <>
      <Tabs variant="soft-rounded">
        <TabList mb="1em">
          <Tab>Friends</Tab>
          <Tab>All User</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <AllfriendItem />
          </TabPanel>
          <TabPanel>
            <AllUserItem />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
