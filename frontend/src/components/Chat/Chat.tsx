import { useState } from "react";
import RoomList from "./RoomList";
import CreateRoom from "./CreateRoom";
import ChatRoom, { Room } from "./ChatRoom";

function Chat() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
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
