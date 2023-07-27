import { useContext, useState } from "react";
import RoomList from "./RoomList";
import CreateRoom from "./CreateRoom";
import ChatRoom, { Room } from "./ChatRoom";
import SelectedRoomContext from "./SelectedRoomContext";

function Chat() {
  const { selectedRoom, setSelectedRoom } = useContext(SelectedRoomContext);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

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
