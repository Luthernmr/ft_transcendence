import { Dispatch, SetStateAction, createContext } from "react";
import { Room } from "./ChatRoom";

const SelectedRoomContext = createContext({
  selectedRoom: null as Room | null,
  setSelectedRoom: (() => {}) as Dispatch<SetStateAction<Room | null>>,
});

export default SelectedRoomContext;
