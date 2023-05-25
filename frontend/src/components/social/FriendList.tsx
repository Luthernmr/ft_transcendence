import { Text, Tabs, TabList, TabPanels, Tab, TabPanel, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Radio, RadioGroup, Stack, useDisclosure, List, ListItem, Avatar, AvatarBadge, Flex, Badge, Box } from '@chakra-ui/react'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import AllUserItem from './AllUserItem';



export default function FriendList() {
	const { isOpen, onOpen, onClose } = useDisclosure()

	return (
		<>
			<Tabs isFitted variant='enclosed'>
				<TabList mb='1em'>
					<Tab>Friends</Tab>
					<Tab>Online Users</Tab>
					<Tab>All User</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<p>friends list</p>
					</TabPanel>
					<TabPanel>
						<p>Online users</p>
					</TabPanel>
					<TabPanel>
						<AllUserItem />
					</TabPanel>
				</TabPanels>
			</Tabs>
		</>
	)

}