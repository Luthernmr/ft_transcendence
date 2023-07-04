import { NotAllowedIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { userSocket } from "../../sockets/sockets";

export default function BlockUserButton(props : any) {
	function blockUser(e: any, id: number) {
		e.preventDefault()
		userSocket.emit("blockUser", { userBlockedId: id })
	}
	return (
		<Button colorScheme="red" onClick={(e) => blockUser(e, props.user.id)}>
			<NotAllowedIcon />
		</Button>
	)
}