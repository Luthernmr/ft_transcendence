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
	id: number,
	nickname: string,
	imgPdp: string,
	isTwoFa: boolean,
}

export default function UserProfile() {

	const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");

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
			<Tabs variant="soft-rounded" >
				<TabList mb="1em">
					<Tab>Profile Settings</Tab>
					<Tab>Match History</Tab>
					<Tab>Blocked List</Tab>
				</TabList>
				<TabPanels >
					<TabPanel>
							<Settings user={currentUser} />
					</TabPanel>
					<TabPanel >
						<Box borderWidth='1px' borderRadius='lg' p={4} m={4}
							overflowY="scroll"
							sx={{
								'&::-webkit-scrollbar': {
									width: '5px',
									borderRadius: '8px',
									backgroundColor: `rgba(0, 0, 0, 0.05)`,
								},
								'&::-webkit-scrollbar-thumb': {
									backgroundColor: `teal`,
									borderRadius: '8px',
								},
							}}>
							<MatchHistory user={currentUser} />

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
