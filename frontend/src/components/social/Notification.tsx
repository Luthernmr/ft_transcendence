import {
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverHeader,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	PopoverCloseButton,
	PopoverAnchor,
	Button,
	Portal,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	IconButton,
	Box,
	Avatar,
	Tag,
	TagLabel,
	Text,
	Flex,
	Stack,
} from '@chakra-ui/react'
import React from 'react'
import {
	FiSettings,
	FiMenu,
	FiBell,
	FiChevronDown,
	FiMessageSquare,
} from 'react-icons/fi';
import { userSocket } from '../../sockets/sockets';

function Example() {
	// 1. Create the component
	//function DataTabs({ data}) {
	//	return (
	//		<Tabs>
	//			<TabList>
	//				{data.map((tab, index) => (
	//					<Tab key={index}>{tab.label}</Tab>
	//				))}
	//			</TabList>
	//			<TabPanels>
	//				{data.map((tab, index) => (
	//					<TabPanel p={4} key={index}>
	//						{tab.content}
	//					</TabPanel>
	//				))}
	//			</TabPanels>
	//		</Tabs>
	//	)
	//}


	// 2. Create an array of data
	//TODO - 1 stocker la requete dans la bdd / creer des entity requetes pending
	//TODO - 2 recuperer ces requetes et rmplir le content avec les data
	//TODO - si la requete est accepter ou pas faire les bail (creer la rellation amis)/ delet le requeste dans la bdd
	const tabData = [
		{
			label: 'Friend Request',
			content: 'noar veut etre ton amis',
		},
		{
			label: 'Play request',
			content:
				'noar veux jouer avec toi',
		},
	]

	// 3. Pass the props and chill!
//	return <DataTabs data={tabData} />
}

const PendingRequest = () => {
	return (
		<Box>
			<Tabs variant='soft-rounded' colorScheme='blue'>
				<TabList>
					<Tab>Friends Request</Tab>
					<Tab>New Message</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<Stack direction='row' align='center' m={2}>
							<Avatar
								src='https://bit.ly/sage-adebayo'
								size='xs'
								name='Segun Adebayo'
								ml={-1}
								mr={2}
								/>
								<Text><Text as='b'>Luther </Text>want .play. with you</Text>
						</Stack>
						<Stack spacing={2} direction='row' align='center'>
							
							<Button colorScheme='twitter' size='sm'>Accepter</Button>
							<Button colorScheme='gray' size='sm'>Rejeter</Button>
						</Stack>

					</TabPanel>
					<TabPanel>
						<p>two!</p>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Box>
	)
}
export default function Notification() {
	return (
		<Popover>
			<PopoverTrigger>
				<IconButton
					size="lg"
					variant="ghost"
					aria-label="open menu"
					icon={<FiBell />}
				/>
			</PopoverTrigger>
			<Portal>
				<PopoverContent>
					<PopoverArrow />
					<PopoverCloseButton />
					<PopoverBody>
						<PendingRequest />
					</PopoverBody>
				</PopoverContent>
			</Portal>
		</Popover>
	)
}