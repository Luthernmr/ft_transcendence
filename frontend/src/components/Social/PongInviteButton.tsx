import { Button, Flex, Menu, MenuButton, MenuList, useDisclosure } from "@chakra-ui/react";
import { userSocket } from "../../sockets/sockets";

export default function PongInviteButton(props: any) {
	function sendPongRequest(e: any, id: number, custom: boolean) {
		e.preventDefault();
			userSocket.emit("PongRequest", { userReceiveId: id, custom: custom });
	}

	const { onOpen } = useDisclosure()

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


