import { ReactNode, useEffect, useState } from 'react';
import {
	IconButton,
	Avatar,
	Box,
	CloseButton,
	Flex,
	HStack,
	VStack,
	Icon,
	useColorModeValue,
	Link,
	Drawer,
	DrawerContent,
	Text,
	useDisclosure,
	BoxProps,
	FlexProps,
	Menu,
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuList,
} from '@chakra-ui/react';
import {
	FiSettings,
	FiMenu,
	FiChevronDown,
	FiMessageSquare,
} from 'react-icons/fi';
import { BsJoystick } from 'react-icons/bs';
import { RiGamepadLine } from 'react-icons/ri';
import { IconType } from 'react-icons';
import { Link as RouteLink, useNavigate } from "react-router-dom";
import axios from 'axios';
import Notification from './social/Notification';
import { userSocket } from '../sockets/sockets';
import FriendList from './social/FriendList';

interface LinkItemProps {
	name: string;
	icon: IconType;
	routeName: string;
}
const LinkItems: Array<LinkItemProps> = [
	{ name: 'Play', icon: RiGamepadLine, routeName: "/home/Play" },
	{ name: 'Chat', icon: FiMessageSquare, routeName: "/home/Chat" },
	{ name: 'Settings', icon: FiSettings, routeName: "/home/Settings" },
];

export default function SidebarWithHeader({ children }: {
	children: ReactNode;
}) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	return (
		<>
			<Flex h={'100vh'} flexDirection={'column'} bg={useColorModeValue('gray.100', 'gray.900')}>
				<SidebarContent
					onClose={() => onClose}
					display={{ base: 'none', md: 'block' }}
				/>
				<Drawer
					autoFocus={false}
					isOpen={isOpen}
					placement="left"
					onClose={onClose}
					returnFocusOnClose={false}
					onOverlayClick={onClose}
					size="full">
					<DrawerContent>
						<SidebarContent onClose={onClose} />
					</DrawerContent>
				</Drawer>
				{/* mobilenav */}
				<MobileNav onOpen={onOpen} />
				{/* <Box
					pos="fixed"
					right="0"
					bg={useColorModeValue('white', 'gray.900')}
					h="full"
					w={{ base: 'full', md: 60 }}
				>
			</Box > */}
				<Flex h={'100%'} ml={{ base: 0, md: 60 }} p="4" >

					{children}
					<Box ml={5}>
						<FriendList />
					</Box>
				</Flex>

			</Flex>
		</>
	);
}

interface SidebarProps extends BoxProps {
	onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
	return (
		<Box
			transition="3s ease"
			bg={useColorModeValue('white', 'gray.900')}
			borderRight="1px"
			borderRightColor={useColorModeValue('gray.200', 'gray.700')}
			w={{ base: 'full', md: 60 }}
			pos="fixed"
			h="full"
			{...rest}>
			<Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
				<Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
					<Icon as={BsJoystick} fontSize="2xl" />
					<Text as="span" ml="2">
						Pong
					</Text>
				</Text>
				<CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
			</Flex>
			{LinkItems.map((link) => (
				<NavItem key={link.name} icon={link.icon} routeName={link.routeName}>
					{link.name}
				</NavItem>
			))}
		</Box>
	);
};

interface NavItemProps extends FlexProps {
	icon: IconType;
	children: string;
	routeName: string;
}

const NavItem = ({ icon, children, routeName, ...rest }: NavItemProps) => {
	return (
		<Link as={RouteLink} to={routeName} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
			<Flex
				align="center"
				p="4"
				mx="4"
				borderRadius="lg"
				role="group"
				cursor="pointer"
				_hover={{
					bg: 'cyan.400',
					color: 'white',
				}}
				{...rest}>
				{icon && (
					<Icon
						mr="4"
						fontSize="16"
						_groupHover={{
							color: 'white',
						}}
						as={icon}
					/>
				)}
				{children}
			</Flex>
		</Link>
	);
};

interface MobileProps extends FlexProps {
	onOpen: () => void;
}

interface User {
	nickname: string;
	imgPdp: string;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
	const [user, setUser] = useState<User>({
		nickname: "",
		imgPdp: ""
	});

	useEffect(() => {
		const getUser = async () => {
			const res = await axios.get(import.meta.env.VITE_BACKEND + '/api/user', { withCredentials: true });
			setUser(res.data.user);
			localStorage.setItem('currentUser', JSON.stringify(res.data.user))
			console.log(localStorage.getItem('currentUser'))
		}
		getUser();
	}, []);
	const navigate = useNavigate();
	const signOut = async (event: any) => {
		try {
			const response = await axios.get(import.meta.env.VITE_BACKEND + 'api/logout', { withCredentials: true })
			console.log(response.data);
			navigate('/Login')
		} catch
		{
		}
	}

	userSocket.on('pendingRequest', (userSocket)=> {
		
		console.log('pending');
	})
	
	return (
		<Flex
			ml={{ base: 0, md: 60 }}
			px={{ base: 4, md: 4 }}
			height="20"
			alignItems="center"
			bg={useColorModeValue('white', 'gray.900')}
			borderBottomWidth="1px"
			borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
			justifyContent={{ base: 'space-between', md: 'flex-end' }}
			{...rest}>
			<IconButton
				display={{ base: 'flex', md: 'none' }}
				onClick={onOpen}
				variant="outline"
				aria-label="open menu"
				icon={<FiMenu />}
			/>

			<Text
				display={{ base: 'flex', md: 'none' }}
				fontSize="2xl"
				fontFamily="monospace"
				fontWeight="bold">
				Pong
			</Text>

			<HStack spacing={{ base: '0', md: '6' }}>
				
				<Notification />
				<Flex alignItems={'center'}>
					<Menu>
						<MenuButton
							py={2}
							transition="all 0.3s"
							_focus={{ boxShadow: 'none' }}>
							<HStack>
								<Box
									borderRadius="full"
									boxShadow='outline'
									bg='white'>
									<Avatar
										size={'md'}
										src={user.imgPdp}
									/>
								</Box>
								<VStack
									display={{ base: 'none', md: 'flex' }}
									alignItems="flex-start"
									spacing="1px"
									ml="2">
									<Text fontSize="sm">{user.nickname}</Text>
								</VStack>
								<Box display={{ base: 'none', md: 'flex' }}>
									<FiChevronDown />
								</Box>
							</HStack>
						</MenuButton>
						<MenuList
							bg={useColorModeValue('white', 'gray.900')}
							borderColor={useColorModeValue('gray.200', 'gray.700')}>
							<MenuItem as={RouteLink} to="/Settings">Settings</MenuItem>
							<MenuDivider />
							<MenuItem onClick={signOut} as={RouteLink} to="/Login">Sign out</MenuItem>
						</MenuList>
					</Menu>
				</Flex>
			</HStack>
		</Flex>
	);
};