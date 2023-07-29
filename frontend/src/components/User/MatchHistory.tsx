import {
	Card,
	CardBody,
	Heading,
	Stack,
	Text,
	Avatar,
	Flex,
	HStack,
	Center,
	Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouteLink } from "react-router-dom";

import { User } from "../Social/AllUserItem";
import axios from "axios";

export interface MatchHistory {
  id: number;
  opponent: User;
  winner: boolean;
  myScore: number;
  opponentScore: number;
  customMode: boolean;
}

enum HistoryState {
  Loading,
  Loaded
}

export default function MatchHistory(props: any){
  const [matchHistorys, setMatchHistorys] = useState<MatchHistory[]>([]);
  const [historyState, setHistoryState] = useState<HistoryState>(HistoryState.Loading);
  
  useEffect(() => {
    try {
      const getHistory = async () => {
        try {
          const resp = await axios.get(
            import.meta.env.VITE_BACKEND + "/user/history/" + props?.user?.id,
            {
              withCredentials: true,
            }
          );
          setMatchHistorys(resp.data.history);
          setHistoryState(HistoryState.Loaded);
        } catch (error) {}
      };
      getHistory();
    } catch (error) {}
  }, [props?.user?.id]);

  function handleBg(issue: any) {
    if (issue) return "#68b7a1";
    return "red.400";
  }

  function handleIssue(issue: any) {
    if (issue) {
      return "WIN";
    }
    return "LOOSE";
  }

  if (historyState === HistoryState.Loading) {
    return (
      <>
        <Center><Spinner/></Center>
      </>
    )
  } else if (historyState === HistoryState.Loaded) {
    if (matchHistorys.length) {
      return (
        <>
          <Stack spacing="2">
            {matchHistorys.map((matchHistory) => (
              <Card
                key={matchHistory.id}
                size={"sm"}
                bg={handleBg(matchHistory?.winner)}
              >
                <CardBody>
                  <Flex justifyContent={"space-around"} alignItems={"center"}>
                    <HStack spacing={"2"}>
                      <Avatar
                        name={props?.user?.nickname}
                        src={props?.user?.imgPdp}
                        size={['sm', 'md', 'lg', 'xl']}
                      />
                      <Text
                        fontWeight={"hairline"}
                        fontSize={['sm', 'md', 'lg', 'xl']}
                        color={"white"}
                      >
                        VS
                      </Text>
                      <Avatar
                        _hover={{ opacity: "50%" }}
                        as={RouteLink}
                        to={"/profile/" + matchHistory?.opponent?.id}
                        name={matchHistory?.opponent?.nickname}
                        src={matchHistory?.opponent?.imgPdp}
                        size={['sm', 'md', 'lg', 'xl']}
                      />
                    </HStack>
                    <Flex flexDirection={"column"} alignItems={"center"}>
                      <Text
                        fontWeight={"thin"}
                        fontSize={['sm', 'md', 'lg', 'xl']}
                        color={"yellow.300"}
                      >
                        {handleIssue(matchHistory?.winner)}
                      </Text>
                      <Text fontSize={['sm', 'md', 'lg', 'xl']} color={"white"}>
                        {matchHistory?.myScore} - {matchHistory?.opponentScore}{" "}
                      </Text>
                    </Flex>
                    {matchHistory?.customMode && (
                      <Text
                        fontWeight={"hairline"}
                        fontSize={['sm', 'md', 'lg', 'xl']}
                        color={"white"}
                      >
                        GNOP GAME
                      </Text>
                    )}
                    {!matchHistory?.customMode && (
                      <Text
                        fontWeight={"hairline"}
                        fontSize={['sm', 'md', 'lg', 'xl']}
                        color={"white"}
                      >
                        NORMAL GAME
                      </Text>
                    )}
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Stack>
        </>
      );
    } else
      return (
		<>
        <Center>
          <Heading color={"gray.500"}>
            This user has not yet played a game
          </Heading>
        </Center>
		</>
      );
  }
  return <div>Something went wrong!</div>;
}
