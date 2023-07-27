import { Box, Button, Flex, HStack, Menu, MenuButton, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, VStack, useDisclosure } from "@chakra-ui/react";
import { userSocket } from "../../sockets/sockets";
import { useEffect } from "react";

export default function PongInviteButton(props: any) {
	function sendPongRequest(e: any, id: number, custom: boolean) {
		e.preventDefault();
			userSocket.emit("PongRequest", { userReceiveId: id, custom: custom });
	}

	const { isOpen, onOpen, onClose } = useDisclosure()

	return (
		<>
			<Menu>
				<MenuButton as={Button} colorScheme="purple"
					onClick={onOpen}
				>
					Duel
				</MenuButton>
				<MenuList alignItems={'center'}>
					<Flex justifyContent={'space-around'} >

						<Button
							colorScheme="blue"
							onClick={(e) => sendPongRequest(e, props?.user?.id, false)}
						>
							normal
						</Button>
						<Button
							colorScheme="green"
							onClick={(e) => sendPongRequest(e, props?.user?.id, true)}
						>
							Custom
						</Button>
					</Flex>
				</MenuList>
			</Menu>
		</>
	)

}


function BasicUsage() {

}