import { Button, Flex, Menu, MenuButton, MenuList, useDisclosure } from "@chakra-ui/react";
import { userSocket } from "../../sockets/sockets";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function WatchGame(props: any) {
	function sendPongRequest(e: any, id: number,) {
		e.preventDefault();
		userSocket.emit("watchGame", { userPlayingId: id });
	}

	const navigate = useNavigate()
	function navigator() {
		navigate('/play')

	}
	useEffect(() => {
		userSocket.on('watching', navigator)

		return () => {
			userSocket.off("watching", navigator)
		}

	})
	const { onOpen } = useDisclosure()

	return (
		<>
			<Button
				colorScheme="blue"
				onClick={(e) => sendPongRequest(e, props?.user?.id)}
			>
				watch game
			</Button>
		</>
	)

}


