import axios from "axios"
import { useState, useEffect } from "react"
import { MatchHistory } from "./MatchHistory"
import { Text, Avatar, VStack, FormControl, FormLabel, HStack, Input, Switch, Button, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, PinInput, PinInputField, useToast, CircularProgress, CircularProgressLabel, Flex, Box } from "@chakra-ui/react";

export default function UserStat(props : any){
	
	const [winCount, setWinCount] = useState(0)
	const [looseCount, setLooseCount] = useState(0)
	const [matchCount, setMatchCount] = useState(0)
	const [matchHistorys, setMatchHistorys] = useState<MatchHistory[]>([])
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
					setMatchCount(resp.data.history.length)
				} catch (error) {
					//console.log("error", error);
				}
			};
			getHistory();
		} catch (error) {
			//console.log(error);
		}
	}, [props?.user?.id])

	useEffect (() => {
		{matchHistorys.map((matchHistory) => {
			if (matchHistory.winner)
				setWinCount(winCount + 1)
			else
				setLooseCount(looseCount + 1)
		})}
	},[matchHistorys])

	return (
		<>
		<Text>number win {winCount}</Text>
		<Text>number loose {looseCount}</Text>
		<Text>number game {matchCount}</Text>
		</>
	)
}