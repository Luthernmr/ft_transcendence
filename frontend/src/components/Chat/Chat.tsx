import { useEffect, useState } from "react";
import RoomList from "./RoomList";
import ChatRoom from "./ChatRoom";
import CreateRoom from "./CreateRoom";

interface User {
  id: number;
  name: string;
  src: string;
}

interface Message {
  id: number;
  content: string;
  userId: number;
}

interface Group {
  users: User[];
}

const fakeMessagesData: Message[] = [
  { id: 1, userId: 1, content: "Hello, how are you?" },
  { id: 2, userId: 2, content: "I'm fine, thank you! And you?" },
  { id: 3, userId: 1, content: "I'm great! Thanks for asking." },
  { id: 4, userId: 2, content: "You're welcome!" },
  { id: 5, userId: 1, content: "So, what are you up to?" },
  { id: 6, userId: 2, content: "Just working on a project. You?" },
  { id: 7, userId: 1, content: "Same here. Let's keep in touch." },
  { id: 8, userId: 2, content: "Sure, talk to you later!" },
  { id: 9, userId: 2, content: "Sure, talk to you later!" },
  // { id: 10, userId: 2, content: "Sure, talk to you later!" },
  // { id: 11, userId: 2, content: "Sure, talk to you later!" },
  // { id: 12, userId: 2, content: "Sure, talk to you later!" },
];

function Chat() {
  const [rooms, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>(fakeMessagesData);
  const [selectedGroup, setSelectedRoom] = useState<Group | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useEffect(() => {
    const fakeGroupsData: Group[] = [
      {
        users: [
          { id: 1, name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
          { id: 2, name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
          { id: 3, name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
        ],
      },
      {
        users: [
          { id: 3, name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
          {
            id: 4,
            name: "Prosper Otemuyiwa",
            src: "https://bit.ly/prosper-baba",
          },
        ],
      },
    ];
    setGroups(fakeGroupsData);
  }, []);

  if (showCreateRoom) {
    return <CreateRoom setShowCreateRoom={setShowCreateRoom} />;
  }
  if (selectedGroup) {
    return <ChatRoom messages={messages} setSelectedRoom={setSelectedRoom} />;
  }
  return (
    <RoomList
      rooms={rooms}
      setSelectedRoom={setSelectedRoom}
      setShowCreateRoom={setShowCreateRoom}
    />
  );
}

export default Chat;
