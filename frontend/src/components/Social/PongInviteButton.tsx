import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { userSocket } from "../../sockets/sockets";

export default function PongInviteButton(props : any) {
	function sendPongRequest(e: any, id: number) {
		e.preventDefault()
		userSocket.emit("PongRequest", { userReceiveId: id })
	}
	
	return (
		<Button colorScheme="purple" onClick={(e) => sendPongRequest(e, props?.user?.id)}>
			Duel
		</Button>
	)
}