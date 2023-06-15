import { Text, Tabs, TabList, TabPanels, Tab, TabPanel, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Radio, RadioGroup, Stack, useDisclosure, List, ListItem, Avatar, AvatarBadge, Flex, Badge, Box } from '@chakra-ui/react'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import AllUserItem from './AllUserItem';
import AllfriendItem from './AllFriendsItem';



export default function FriendList() {
	const { isOpen, onOpen, onClose } = useDisclosure()

	return (
		<>
			<Tabs variant='soft-rounded'>
				<TabList mb='1em'>
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
	)

}