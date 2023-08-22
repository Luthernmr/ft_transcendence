import { useContext, useEffect, useState } from "react";
import RoomList from "./RoomList";
import CreateRoom from "./CreateRoom";
import ChatRoom, { Room } from "./ChatRoom";
import SelectedRoomContext from "./SelectedRoomContext";
import { useToast } from "@chakra-ui/react";
import { chatSocket } from "../../sockets/sockets";

function Chat() {
  const { selectedRoom, setSelectedRoom } = useContext(SelectedRoomContext);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const toast = useToast();

  const handleError = (error: { message: string }) =>
    toast({
      title: error.message,
      status: "error",
      isClosable: true,
      position: "top",
    });

  useEffect(() => {
    setSelectedRoom(null);
    chatSocket.on("error", handleError);
    return () => {
      chatSocket.off("error", handleError);
    };
  }, []);

  if (showCreateRoom) {
    return <CreateRoom setShowCreateRoom={setShowCreateRoom} />;
  }
  if (selectedRoom) {
    return (
      <ChatRoom setSelectedRoom={setSelectedRoom} selectedRoom={selectedRoom} />
    );
  }
  return (
    <RoomList
      setSelectedRoom={setSelectedRoom}
      setShowCreateRoom={setShowCreateRoom}
    />
  );
}

export default Chat;
