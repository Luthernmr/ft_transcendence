import { Button, IconButton, useToast } from "@chakra-ui/react";
import { chatSocket } from "../../sockets/sockets";
import { ChatIcon } from "@chakra-ui/icons";

export default function DirectMessageButton(props: any) {
  const { user, currentUser } = props;
  const toast = useToast();

  const handleCreateDirectMessage = (e: any) => {
    e.preventDefault();

    if (currentUser.id === user.id) {
      toast({
        title: "You can't send a direct message to yourself.",
        status: "error",
        position: "top",
      });
      return;
    }

    chatSocket.emit("createDirectMessageRoom", {
      targetUser: user,
      user: currentUser,
    });
  };

  return (
    <IconButton
      icon={<ChatIcon />}
      colorScheme="blue"
      onClick={handleCreateDirectMessage}
      aria-label={""}
    />
  );
}
