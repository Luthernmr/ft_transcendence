import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import BlockedList from "../User/BlockedList"
import MatchHistory from "../User/MatchHistory"
import Settings from "../User/Settings"
import OtherProfilInfo from "./OtherUserInfo"

export default function OtherProfilPage() {

	return (
		<>
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
						<Tab>Profile Infos</Tab>
						<Tab>Match History</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<OtherProfilInfo />
						</TabPanel>
						<TabPanel>
							<MatchHistory />
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Flex>
			</>
	)
}