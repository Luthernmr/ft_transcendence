import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User } from "./AllUserItem";
import { IconButton, Box, Text, List, ListItem, Flex, Avatar, AvatarBadge, Badge, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, Icon, HStack, VStack, CircularProgress, CircularProgressLabel, Heading } from "@chakra-ui/react";
import AddFriendButton from "./AddFriendButton";
import BlockUserButton from "./BlockUserButton";




export default function OtherProfilInfo(props: any) {


	return (
		<>
			<Box borderWidth='1px' borderRadius='lg' p={4} m={4}>
				<Flex flexDirection={'column'} justifyContent={'space-between'} >
					<Flex alignItems={'center'} flexDirection={'row'}>
						<VStack>
							<CircularProgress value={props?.user?.ratioToNextLevel} size={"3em"} color='green.400' thickness={'3px'}>
								<CircularProgressLabel><Avatar
									name={props.user?.nickname}
									size="xl"
									src={props.user?.imgPdp}>
								</Avatar></CircularProgressLabel>
							</CircularProgress>
							<Heading >{props.user?.nickname}</Heading>
						</VStack>
						<Flex flexDirection={'column'}>
							<Heading> lvl {props?.user?.level}</Heading>
						</Flex>
					</Flex>
					<HStack>
						<AddFriendButton user={props.user} />
						<BlockUserButton user={props.user} />
					</HStack>
				</Flex>
			</Box>
		</>
	)
}