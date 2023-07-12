import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import AllUserItem from "./AllUserItem";
import AllfriendItem from "./AllFriendsItem";

export default function FriendList() {
	const currentUser: User = JSON.parse(
		sessionStorage.getItem("currentUser") || "{}"
	  );
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
            <AllUserItem user={currentUser}/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
