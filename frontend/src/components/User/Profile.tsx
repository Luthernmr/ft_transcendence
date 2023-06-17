import React, { useEffect, useState } from 'react';
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
	Tabs
} from '@chakra-ui/react';
import axios from 'axios';
import { BsJustify } from 'react-icons/bs';
import AllfriendItem from '../Social/AllFriendsItem';
import AllUserItem from '../Social/AllUserItem';
import Settings from './Settings';
import MatchHistory from './MatchHistory';
import { BlockList } from 'net';
import BlockedList from './BlockedList';


export default function UserProfile() {



	return (
		<Box
			bg="white"
			borderRadius="lg"
			p={4}
			boxShadow="md"
			w="100%"
			overflowY="auto"

		>

			<Tabs variant='soft-rounded'>
				<TabList mb='1em'>
					<Tab>Profile Settings</Tab>
					<Tab>Match History</Tab>
					<Tab>Blocked List</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<Settings />
					</TabPanel>
					<TabPanel

					>
						<MatchHistory />
					</TabPanel>
					<TabPanel>
						<BlockedList />
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Box>



	);
};
