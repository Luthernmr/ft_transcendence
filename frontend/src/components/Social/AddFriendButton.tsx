import { AddIcon } from "@chakra-ui/icons";
import { Button, IconButton } from "@chakra-ui/react";
import { userSocket } from "../../sockets/sockets";

export default function AddFriendButton(props : any) {
	function sendFriendRequest(e: any, id: number) {
		e.preventDefault()
		userSocket.emit("friendRequest", { userReceiveId: id })
		console.log('test');
	}
	
	return (
		<Button colorScheme="teal" onClick={(e) => sendFriendRequest(e, props.user.id)}>
			<IconButton
				variant='ghost'
				colorScheme='white'
				aria-label='addFriend'
				icon={<AddIcon />}
			/>
			Add to friends
		</Button>
	)
}