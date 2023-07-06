import { useState } from "react";
import RoomList from "./RoomList";
import ChatRoom from "./ChatRoom";
import CreateRoom from "./CreateRoom";
import { User } from "../Social/AllUserItem";

interface Room {
  id: string;
  name: string;
  password: string;
  isPrivate: boolean;
  users: User[];
}

function Chat() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);


  if (showCreateRoom) {
    return <CreateRoom setShowCreateRoom={setShowCreateRoom} />;
  }
  if (selectedRoom) {
    return <ChatRoom setSelectedRoom={setSelectedRoom} selectedRoom={selectedRoom}/>;
  }
  return (
    <RoomList
      setSelectedRoom={setSelectedRoom}
      setShowCreateRoom={setShowCreateRoom}
    />
  );
}

export default Chat;
