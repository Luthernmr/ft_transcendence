import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { userSocket } from "../../sockets/sockets";
import { useEffect } from "react";

export default function AddFriendButton(props: any) {
  function sendFriendRequest(e: any, id: number) {
    e.preventDefault();
		userSocket.emit("friendRequest", { userReceiveId: id });
  }

  return (
    <Button
      colorScheme="teal"
      onClick={(e) => sendFriendRequest(e, props.user.id)}
    >
      <AddIcon />
      Add friend
    </Button>
  );
}
