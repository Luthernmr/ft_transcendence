import React from "react";
import { Button, Stack, Spacer, Box } from "@chakra-ui/react";
import { CloseIcon, WarningIcon } from "@chakra-ui/icons";
import { FiMeh } from "react-icons/fi";

interface UserOptionsProps {
  isAdmin: boolean;
  userId: number;
}

const UserOptions: React.FC<UserOptionsProps> = ({ isAdmin, userId }) => {
  if (!isAdmin) return null;

  const handleKick = (userId: number) => {
    // kick logic
  };

  const handleBan = (userId: number) => {
    // ban logic
  };

  const handleMute = (userId: number) => {
    // mute logic
  };

  return (
    <Box display="flex" width="100%" mb={2}>
      <Spacer />
      <Stack spacing={3} direction="row">
        <Button
          leftIcon={<CloseIcon />}
          variant="outline"
          onClick={() => handleKick(userId)}
        >
          Kick
        </Button>
        <Button
          leftIcon={<WarningIcon />}
          variant="outline"
          onClick={() => handleBan(userId)}
        >
          Ban
        </Button>
        <Button
          leftIcon={<FiMeh />}
          variant="outline"
          onClick={() => handleMute(userId)}
        >
          Mute
        </Button>
      </Stack>
    </Box>
  );
};

export default UserOptions;
