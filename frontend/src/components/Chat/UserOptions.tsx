import React from "react";
import { Button, Stack, Spacer, Box } from "@chakra-ui/react";
import { CloseIcon, WarningIcon } from "@chakra-ui/icons";
import { FiMeh } from "react-icons/fi";
import { User } from "../Social/AllUserItem";
import { chatSocket } from "../../sockets/sockets";
import { Room } from "./ChatRoom";

interface UserOptionsProps {
  isAdmin: boolean;
  targetedUser: User;
  currentUser: User;
  ownerId: number;
  selectedRoom: Room;
}

const UserOptions: React.FC<UserOptionsProps> = ({
  isAdmin,
  targetedUser,
  currentUser,
  ownerId,
  selectedRoom,
}) => {
  if (
    !isAdmin ||
    targetedUser.id === currentUser.id ||
    targetedUser.id === ownerId
  )
    return null;

  const handleKick = (user: User, selectedRoom: Room, currentUser: User) => {
    chatSocket.emit("kickUser", {
      targetUser: user,
      room: selectedRoom,
      user: currentUser,
    });
  };

  const handleBan = (user: User, selectedRoom: Room, currentUser: User) => {
    chatSocket.emit("banUser", {
      targetUser: user,
      room: selectedRoom,
      user: currentUser,
    });
  };

  const handleMute = (user: User, selectedRoom: Room, currentUser: User) => {
    chatSocket.emit("muteUser", {
      targetUser: user,
      room: selectedRoom,
      user: currentUser,
    });
  };

  return (
    <Box display="flex" width="100%" mb={2}>
      <Spacer />
      <Stack spacing={3} direction="row">
        <Button
          leftIcon={<CloseIcon />}
          variant="outline"
          onClick={() => handleKick(targetedUser, selectedRoom, currentUser)}
        >
          Kick
        </Button>
        <Button
          leftIcon={<WarningIcon />}
          variant="outline"
          onClick={() => handleBan(targetedUser, selectedRoom, currentUser)}
        >
          Ban
        </Button>
        <Button
          leftIcon={<FiMeh />}
          variant="outline"
          onClick={() => handleMute(targetedUser, selectedRoom, currentUser)}
        >
          Mute
        </Button>
      </Stack>
    </Box>
  );
};

export default UserOptions;
