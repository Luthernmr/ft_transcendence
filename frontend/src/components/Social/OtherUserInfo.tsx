import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User } from "./AllUserItem";
import { IconButton, Box, Text, List, ListItem, Flex, Avatar, AvatarBadge, Badge, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, Icon, HStack } from "@chakra-ui/react";




export default function OtherProfilInfo() {
	const [user, setUser] = useState<User>();
	const { id } = useParams();
	useEffect( () => {
		try {
			const  getUser = async () =>{
				const resp =  await axios.get(import.meta.env.VITE_BACKEND + '/user/' + id, {
					withCredentials: true,
				})
				setUser(resp.data.user)
			}
			getUser();
		}
		catch (error)
		{
			console.log(error)
		}
	}, [id])

	return (
		<>
			<Text>{user?.nickname}</Text>
		</>
	)
}