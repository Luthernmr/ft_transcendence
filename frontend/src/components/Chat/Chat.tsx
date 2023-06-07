import { useEffect, useState } from "react";
import GroupList from './GroupList';
import ChatRoom from './ChatRoom';

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
];

function Chat() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>(fakeMessagesData);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

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

  if (selectedGroup) {
    return <ChatRoom messages={messages} setSelectedGroup={setSelectedGroup} />;
  }

  return <GroupList groups={groups} setSelectedGroup={setSelectedGroup} />;
}

export default Chat;
