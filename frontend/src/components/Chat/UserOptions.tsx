import React from "react";
import { Button, Stack, Spacer, Box } from "@chakra-ui/react";
import { CloseIcon, WarningIcon } from "@chakra-ui/icons";
import { FiMeh } from "react-icons/fi";
import { User } from "../Social/AllUserItem";

interface UserOptionsProps {
  isAdmin: boolean;
  targetedUser: User;
  currentUserId: number;
  ownerId: number;
}

const UserOptions: React.FC<UserOptionsProps> = ({
  isAdmin,
  targetedUser,
  currentUserId,
  ownerId,
}) => {
  if (!isAdmin || targetedUser.id === currentUserId || targetedUser.id === ownerId) return null;

  const handleKick = (user: User) => {
    // kick logic
  };

  const handleBan = (user: User) => {
    // ban logic
  };

  const handleMute = (user: User) => {
    // mute logic
  };

  return (
    <Box display="flex" width="100%" mb={2}>
      <Spacer />
      <Stack spacing={3} direction="row">
        <Button
          leftIcon={<CloseIcon />}
          variant="outline"
          onClick={() => handleKick(targetedUser)}
        >
          Kick
        </Button>
        <Button
          leftIcon={<WarningIcon />}
          variant="outline"
          onClick={() => handleBan(targetedUser)}
        >
          Ban
        </Button>
        <Button
          leftIcon={<FiMeh />}
          variant="outline"
          onClick={() => handleMute(targetedUser)}
        >
          Mute
        </Button>
      </Stack>
    </Box>
  );
};

export default UserOptions;
