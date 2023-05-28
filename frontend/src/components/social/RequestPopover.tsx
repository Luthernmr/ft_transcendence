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
} from '@chakra-ui/react'
import React from 'react'

function Example() {
	// 1. Create the component
	function DataTabs({ data }) {
		return (
			<Tabs>
				<TabList>
					{data.map((tab, index) => (
						<Tab key={index}>{tab.label}</Tab>
					))}
				</TabList>
				<TabPanels>
					{data.map((tab, index) => (
						<TabPanel p={4} key={index}>
							{tab.content}
						</TabPanel>
					))}
				</TabPanels>
			</Tabs>
		)
	}


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
	return <DataTabs data={tabData} />
}

export default function RequestPopover() {

	return (
		<Popover>
			<PopoverTrigger>
				<Button>Trigger</Button>
			</PopoverTrigger>
			<Portal>
				<PopoverContent>
					<PopoverArrow />
					<PopoverHeader>Header</PopoverHeader>
					<PopoverCloseButton />
					<PopoverBody>
						<Button colorScheme='blue'>Button</Button>
					</PopoverBody>
					<PopoverFooter>This is the footer</PopoverFooter>
				</PopoverContent>
			</Portal>
		</Popover>
	)
}