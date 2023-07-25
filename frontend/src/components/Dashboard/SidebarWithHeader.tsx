import { ReactNode, useEffect, useState } from "react";
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
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
} from "@chakra-ui/react";
import {
	FiSettings,
	FiMenu,
	FiChevronDown,
	FiMessageSquare,
} from "react-icons/fi";
import { FaUsers } from 'react-icons/fa';
import { BsJoystick } from "react-icons/bs";
import { RiGamepadLine } from "react-icons/ri";
import { IconType } from "react-icons";
import { Link as RouteLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Notification from "../Social/Notification";
import FriendList from "../Social/FriendList";
import { chatSocket, pongSocket, userSocket } from "../../sockets/sockets";
import MediaQuery from 'react-responsive';
import { ChatIcon, TriangleDownIcon } from "@chakra-ui/icons";

interface LinkItemProps {
	name: string;
	icon: IconType;
	routeName: string;
}
const LinkItems: Array<LinkItemProps> = [
	{ name: "Play", icon: RiGamepadLine, routeName: "/Play" },
	{ name: "Chat", icon: FiMessageSquare, routeName: "/Chat" },
	{ name: "Profile", icon: FiSettings, routeName: "/Profile" },
];

export default function SidebarWithHeader({
	children,
}: {
	children: ReactNode;
}) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const currentUser: User = JSON.parse(
		sessionStorage.getItem("currentUser") || "{}"
	);
	return (
		<>
			<Flex
				h={"100vh"}
				flexDirection={"column"}
				bg={useColorModeValue("gray.100", "gray.900")}
			>
				<SidebarContent
					onClose={() => onClose}
					display={{ base: "none", md: "block" }}
				/>
				<Drawer
					autoFocus={false}
					isOpen={isOpen}
					placement="left"
					onClose={onClose}
					returnFocusOnClose={false}
					onOverlayClick={onClose}
					size="full"
				>
					<DrawerContent>
						<SidebarContent onClose={onClose} />
					</DrawerContent>
				</Drawer>
				<MobileNav onOpen={onOpen} />
				<Flex
					h={"100%"}
					ml={{ base: 0, md: 60 }}
					p={"4"}
					overflow={"auto"}
					justifyContent={"space-between"}
				>
					{children}
					<MediaQuery minWidth={1224}>
						<Box ml={5}>
							<FriendList />
						</Box>
					</MediaQuery>
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
			transition="3s ease-in-out"
			bg={useColorModeValue("white", "gray.900")}
			borderRight="1px"
			borderRightColor={useColorModeValue("gray.200", "gray.700")}
			w={{ base: "full", md: 60 }}
			pos="fixed"
			h="full"
			{...rest}
		>
			<Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
				<Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
					<Icon as={BsJoystick} fontSize="2xl" />
					<Text as="span" ml="2">
						Pong
					</Text>
				</Text>
				<CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
			</Flex>
			{LinkItems.map((link) => (
				<NavItem
					key={link.name}
					icon={link.icon}
					routeName={link.routeName}
					onClose={onClose}
					onClick={onClose}
				>
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
	onClose: () => void;
}

const NavItem = ({ icon, children, routeName, ...rest }: NavItemProps) => {
	return (
		<Link
			as={RouteLink}
			to={routeName}
			style={{ textDecoration: "none" }}
			_focus={{ boxShadow: "none" }}
		>
			<Flex
				align="center"
				p="4"
				mx="4"
				borderRadius="lg"
				role="room"
				cursor="pointer"
				_hover={{
					bg: "teal.500",
					color: "white",
				}}
				{...rest}
			>
				{icon && <Icon mr="4" fontSize="16" as={icon} />}
				{children}
			</Flex>
		</Link>
	);
};

export interface MobileProps extends FlexProps {
	onOpen: () => void;
}

export interface User {
	nickname: string;
	imgPdp: string;
	isTwoFa: boolean;
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
	const [user, setUser] = useState<User>({
		nickname: "",
		imgPdp: "",
		isTwoFa: false,
	});

	useEffect(() => {
		const getUser = async () => {
			const res = await axios.get(import.meta.env.VITE_BACKEND + "/api/user", {
				withCredentials: true,
			});
			setUser(res.data.user);
			sessionStorage.setItem("currentUser", JSON.stringify(res.data.user));
		};
		getUser();
	}, []);
	const signOut = async () => {
		try {
			sessionStorage.removeItem("jwt");
			sessionStorage.removeItem("currentUser");
			chatSocket.disconnect();
			userSocket.disconnect();
			pongSocket.disconnect();
		} catch (error) { }
	};


	return (
		<Flex
			ml={{ base: 0, md: 60 }}
			px={{ base: 4, md: 4 }}
			height="20"
			alignItems="center"
			bg={useColorModeValue("white", "gray.900")}
			borderBottomWidth="1px"
			borderBottomColor={useColorModeValue("gray.200", "gray.700")}
			justifyContent={{ base: "space-between", md: "flex-end" }}
			{...rest}
		>
			<IconButton
				display={{ base: "flex", md: "none" }}
				onClick={onOpen}
				variant="outline"
				aria-label="open menu"
				icon={<FiMenu />}
			/>

			<Text
				display={{ base: "flex", md: "none" }}
				fontSize="2xl"
				fontFamily="monospace"
				fontWeight="bold"
			>
				Pong
			</Text>

			<HStack spacing={{ base: "0", md: "6" }}>
				<MediaQuery maxWidth={1224}>
					<Menu>
						<MenuButton>
								<FaUsers size={'1.3em'}/>
						</MenuButton>
						<MenuList zIndex={'1'} p={3}>
							<FriendList />
						</MenuList>
					</Menu>
				</MediaQuery>
				<Notification />
				<Flex alignItems={"center"}>
					<Menu>
						<MenuButton
							py={2}
							transition="all 0.3s"
							_focus={{ boxShadow: "none" }}
						>
							<HStack>
								<Box bg="white">
									<Avatar name={user.nickname} size={"md"} src={user.imgPdp} />
								</Box>
								<VStack
									display={{ base: "none", md: "flex" }}
									alignItems="flex-start"
									spacing="1px"
									ml="2"
								>
									<Text fontSize="sm" fontWeight={"bold"}>
										{user.nickname}
									</Text>
								</VStack>
								<Box display={{ base: "none", md: "flex" }}>
									<FiChevronDown />
								</Box>
							</HStack>
						</MenuButton>
						<MenuList
							bg={useColorModeValue("white", "gray.900")}
							borderColor={useColorModeValue("gray.200", "gray.700")}
						>
							<MenuItem as={RouteLink} to="/Profile">
								Settings
							</MenuItem>
							<MenuDivider />
							<MenuItem onClick={signOut} as={RouteLink} to="/Login">
								Sign out
							</MenuItem>
						</MenuList>
					</Menu>
				</Flex>
			</HStack>
		</Flex>
	);
};
