import {
	Box,
	Flex,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
} from "@chakra-ui/react";
import Settings from "./Settings";
import MatchHistory from "./MatchHistory";
import BlockedList from "./BlockedList";

interface User {
	id: number;
	nickname: string;
	imgPdp: string;
	isTwoFa: boolean;
}

const UserProfile: React.FC = () => {
	const currentUser: User = JSON.parse(
	  sessionStorage.getItem("currentUser") || "{}"
	);
  console.log(currentUser.nickname);
  return (
    <Flex
      borderRadius={"md"}
      bg={"white"}
      padding={"15px"}
      minHeight={"100%"}
      flex={"1"}
      direction={"column"}
      maxH={"100%"}
      overflowY="auto"
    >
      <Tabs variant="soft-rounded">
        <TabList mb="1em">
          <Tab>Profile Settings</Tab>
          <Tab>Match History</Tab>
          <Tab>Blocked List</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Settings user={currentUser} />
          </TabPanel>
          <TabPanel>
            <Box
              w="100%"
              h="100%"
              maxHeight={"70vh"}
              overflowY="scroll"
              sx={{
                "&::-webkit-scrollbar": {
                  width: "5px",
                  borderRadius: "8px",
                  backgroundColor: `rgba(0, 0, 0, 0.05)`,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: `teal`,
                  borderRadius: "8px",
                },
              }}
            >
              <Box w="100%" h="80%">
                <MatchHistory user={currentUser} />
              </Box>
            </Box>
          </TabPanel>
          <TabPanel>
            <BlockedList />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
export default UserProfile;