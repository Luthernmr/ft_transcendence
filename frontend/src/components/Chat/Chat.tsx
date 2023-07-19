import { useState } from "react";
import RoomList from "./RoomList";
import ChatRoom, { Room } from "./ChatRoom";
import CreateRoom from "./CreateRoom";

function Chat() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  if (showCreateRoom) {
    return <CreateRoom setShowCreateRoom={setShowCreateRoom} />;
  }
  if (selectedRoom) {
    console.log(selectedRoom);
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
