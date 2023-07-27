import { IconButton, useToast } from "@chakra-ui/react";
import { chatSocket, userSocket } from "../../sockets/sockets";
import { ChatIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import SelectedRoomContext from "../Chat/SelectedRoomContext";
import { useContext } from "react";
import ChatRoom, { Room } from "../Chat/ChatRoom";

export default function DirectMessageButton(props: any) {
  const navigate = useNavigate();
  const { user, currentUser } = props;
  const toast = useToast();
  const { selectedRoom, setSelectedRoom } = useContext(SelectedRoomContext);

  const handleCreateDirectMessage = (e: any) => {
    e.preventDefault();
    setSelectedRoom(null);

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

    chatSocket.on('directRoomCreated', (newRoom: Room) => {
      navigate('/Chat');
      setSelectedRoom(newRoom);
    });
    
    chatSocket.on('roomAlreadyExists', (newRoom: Room) => {
      chatSocket.emit("joinRoom", { userId: currentUser.id, room: newRoom });
      navigate('/Chat');
      setSelectedRoom(newRoom);
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
