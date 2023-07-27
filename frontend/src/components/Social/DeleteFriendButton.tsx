import { DeleteIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { userSocket } from "../../sockets/sockets";
import { useEffect } from "react";

export default function DeleteFriendButton(props: any) {
	function deleteFriend(e: any, id: number) {
		e.preventDefault();
			userSocket.emit("deleteFriend", { friendId: id });
	}
	return (
		<Button colorScheme="red" onClick={(e) => deleteFriend(e, props.user.id)}>
			<DeleteIcon />
		</Button>
	);
}
