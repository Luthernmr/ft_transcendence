import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import MatchHistory from "../User/MatchHistory";
import OtherProfilInfo from "./OtherUserInfo";
import axios, { HttpStatusCode } from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { User } from "./AllUserItem";
import UserStats from "../User/Stats";
import MediaQuery from "react-responsive";

export default function OtherProfilPage() {
  const [user, setUser] = useState<User>();
  const { id } = useParams();
  useEffect(() => {
    try {
      const getUser = async () => {
        try {
          const resp: any = await axios.get(
            import.meta.env.VITE_BACKEND + "/user/" + id,
            {
              withCredentials: true,
            }
          );
          if (resp.status != 404) {
            setUser(resp?.data?.user);
          }
        } catch (error) {}
        // throw Error
      };
      getUser();
    } catch (error) {}
  }, [id]);
  return (
    <>
      <Flex
        borderRadius={"md"}
        bg={"white"}
        padding={"15px"}
        minHeight={"100%"}
        flex={"1"}
        direction={"column"}
        maxH={"100%"}
      >
        <MediaQuery maxWidth={1224}>
          <VStack flexDirection={"column"} overflowY={"auto"}>
            <OtherProfilInfo user={user} />
            <UserStats user={user} />
          </VStack>
        </MediaQuery>
        <MediaQuery minWidth={1224}>
          <Flex>
            <OtherProfilInfo user={user} />
            <UserStats user={user} />
          </Flex>
        </MediaQuery>
        <Box
          w="100%"
          h="100%"
          maxHeight={"70vh"}
          overflowY="scroll"
          sx={{
            "&::-webkit-scrollbar": {
              width: "5px",
              borderRadius: "8px",
              backgroundColor: `rgba(0, 0, 0, 0.05)`,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: `teal`,
              borderRadius: "8px",
            },
          }}
        >
          <Box w="100%" h="80%">
            <MatchHistory user={user} />
          </Box>
        </Box>
      </Flex>
    </>
  );
}
