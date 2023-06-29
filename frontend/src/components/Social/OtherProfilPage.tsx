import { Box, CircularProgress, Flex, HStack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import BlockedList from "../User/BlockedList"
import MatchHistory from "../User/MatchHistory"
import Settings from "../User/Settings"
import OtherProfilInfo from "./OtherUserInfo"
import axios from "axios"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { User } from "./AllUserItem"

export default function OtherProfilPage() {

	const [user, setUser] = useState<User>();
	const { id } = useParams();
	useEffect(() => {
		try {
			const getUser = async () => {
				const resp : any  = await axios.get(import.meta.env.VITE_BACKEND + '/user/' + id, {
					withCredentials: true,
				})
				console.log('je rep', resp);
				setUser(resp.data.user)
			}
			getUser();
		}
		catch (error) {
			console.log(error)
		}
	}, [id])
	
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
				overflowY={"auto"}
			>
				<HStack>
					<OtherProfilInfo user={user}/>
				</HStack>
				<Box borderWidth='1px' borderRadius='lg' p={4} m={4} overflowY={"auto"}>
					<MatchHistory user={user} />
				</Box>
			</Flex>
		</>
	)
}